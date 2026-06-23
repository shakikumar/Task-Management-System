// ============================================================
// hooks/useSocketConnection.js — Socket.IO Reconnection Hook
//
// Manages a Socket.IO client connection with:
//   - Exponential backoff for reconnect attempts
//   - Network-aware reconnection (pauses when offline)
//   - Connection status tracking
//   - Graceful cleanup on unmount
//
// IMPORTANT: This hook does NOT modify any existing business
// logic, authentication flow, or database schema.  It is a
// pure connection-management layer.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { io }                from 'socket.io-client';
import createBackoffManager  from '../utils/backoffManager';
import createNetworkMonitor  from '../utils/networkMonitor';
import { CONNECTION_STATUS } from './useConnectionMonitor';

// ---- module-level defaults --------------------------------------------------

const DEFAULT_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL    ||
  'http://localhost:5000';

const DEFAULT_SOCKET_OPTIONS = {
  // Disable Socket.IO's own auto-reconnect — we manage it ourselves
  // so we have full control over the backoff schedule.
  reconnection    : false,
  transports      : ['websocket', 'polling'],
  withCredentials : true,
  timeout         : 10_000, // 10 s connection timeout
};

// ============================================================

/**
 * useSocketConnection
 *
 * Creates and manages a Socket.IO connection with exponential
 * backoff reconnection and network-awareness.
 *
 * @param {object}  [options]
 * @param {string}  [options.serverUrl]   - Socket.IO server URL
 * @param {string}  [options.authToken]   - JWT token passed in socket auth
 * @param {boolean} [options.autoConnect] - Connect on mount (default: true)
 * @param {number}  [options.maxRetries]  - Max reconnect attempts (default: 10)
 *
 * @returns {{
 *   socket     : Socket|null,
 *   status     : string,
 *   isOnline   : boolean,
 *   retryCount : number,
 *   connect    : function,
 *   disconnect : function,
 * }}
 *
 * @example
 *   const token = localStorage.getItem('token');
 *   const { socket, status } = useSocketConnection({ authToken: token });
 *
 *   useEffect(() => {
 *     if (!socket) return;
 *     socket.on('task:updated', (data) => console.log(data));
 *     return () => socket.off('task:updated');
 *   }, [socket]);
 */
function useSocketConnection(options = {}) {
  const {
    serverUrl   = DEFAULT_SERVER_URL,
    authToken   = '',
    autoConnect = true,
    maxRetries  = 10,
  } = options;

  // ---- state ----------------------------------------------------------------
  const [status,     setStatus]     = useState(CONNECTION_STATUS.DISCONNECTED);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline,   setIsOnline]   = useState(() => navigator.onLine);
  const [socket,     setSocket]     = useState(null);

  // ---- persistent refs (never trigger re-renders) --------------------------
  const socketRef    = useRef(null);  // the raw Socket.IO instance
  const backoffRef   = useRef(null);  // BackoffManager instance
  const mountedRef   = useRef(false); // guard against post-unmount state updates

  // Stable function refs — updated inside effects, never during render.
  // This pattern lets connect() and scheduleReconnect() reference each other
  // without any temporal-dead-zone or circular-useCallback problems.
  const connectFnRef          = useRef(null);
  const scheduleReconnectFnRef = useRef(null);

  // ---- safe state setter (stable, no deps) ----------------------------------
  const safeSet = useCallback((setter, value) => {
    if (mountedRef.current) setter(value);
  }, []);

  // ---- main effect: wires up all connection logic on mount -----------------
  useEffect(() => {
    mountedRef.current = true;

    // Create manager instances once per mount.
    const backoff        = createBackoffManager({ maxAttempts: maxRetries });
    const networkMonitor = createNetworkMonitor();
    backoffRef.current   = backoff;

    // ------------------------------------------------------------------
    // scheduleReconnect — schedules the next retry via the backoff timer
    // ------------------------------------------------------------------
    function scheduleReconnect() {
      const scheduled = backoff.scheduleRetry(({ attempt, delay }) => {
        console.log(
          `[useSocketConnection] Retry attempt #${attempt} after ${delay}ms.`
        );
        if (mountedRef.current) {
          setRetryCount(attempt);
          setStatus(CONNECTION_STATUS.RECONNECTING);
        }
        connectFnRef.current?.();
      });

      if (!scheduled) {
        console.error(
          '[useSocketConnection] Max reconnection attempts reached. Giving up.'
        );
        if (mountedRef.current) setStatus(CONNECTION_STATUS.DISCONNECTED);
      }
    }

    // ------------------------------------------------------------------
    // connect — opens (or re-opens) the Socket.IO connection
    // ------------------------------------------------------------------
    function connect() {
      if (!navigator.onLine) {
        console.log('[useSocketConnection] Skipping connect — network is offline.');
        if (mountedRef.current) setStatus(CONNECTION_STATUS.OFFLINE);
        return;
      }

      // Tear down any previous socket cleanly.
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      console.log(`[useSocketConnection] Connecting to ${serverUrl} …`);
      if (mountedRef.current) setStatus(CONNECTION_STATUS.RECONNECTING);

      const newSocket = io(serverUrl, {
        ...DEFAULT_SOCKET_OPTIONS,
        auth: { token: authToken },
      });

      // ---- socket event listeners ----------------------------------------

      newSocket.on('connect', () => {
        console.log(`[useSocketConnection] Connected — id: ${newSocket.id}`);
        backoff.reset();
        if (mountedRef.current) {
          setStatus(CONNECTION_STATUS.CONNECTED);
          setRetryCount(0);
          setSocket(newSocket);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.warn(`[useSocketConnection] Disconnected — reason: ${reason}`);
        if (mountedRef.current) {
          setStatus(CONNECTION_STATUS.DISCONNECTED);
          setSocket(null);
        }

        // Only retry on transient transport-level disconnects.
        const transientReasons = [
          'transport error',
          'transport close',
          'ping timeout',
        ];
        if (transientReasons.includes(reason)) {
          scheduleReconnectFnRef.current?.();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('[useSocketConnection] Connection error:', error.message);
        if (mountedRef.current) {
          setStatus(CONNECTION_STATUS.DISCONNECTED);
          setSocket(null);
        }
        scheduleReconnectFnRef.current?.();
      });

      socketRef.current = newSocket;
    }

    // Publish the functions through refs so they can reference each other.
    connectFnRef.current          = connect;
    scheduleReconnectFnRef.current = scheduleReconnect;

    // ------------------------------------------------------------------
    // Network monitor subscription
    // ------------------------------------------------------------------
    const unsubNetwork = networkMonitor.subscribe((online) => {
      if (mountedRef.current) setIsOnline(online);
      if (online) {
        console.log('[useSocketConnection] Network restored — attempting reconnect.');
        backoff.reset();
        connect();
      } else {
        console.log('[useSocketConnection] Network lost — pausing retries.');
        backoff.cancel();
        if (mountedRef.current) setStatus(CONNECTION_STATUS.OFFLINE);
      }
    });

    // Initial connection on mount.
    if (autoConnect) {
      connect();
    }

    // ------------------------------------------------------------------
    // Cleanup on unmount
    // ------------------------------------------------------------------
    return () => {
      mountedRef.current = false;
      unsubNetwork();
      networkMonitor.destroy();
      backoff.cancel();
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  // serverUrl and authToken are primitive strings — safe as deps.
  // autoConnect and maxRetries are numbers — safe as deps.
  }, [serverUrl, authToken, autoConnect, maxRetries]);

  // ---- stable public API callbacks -----------------------------------------
  // These are thin wrappers that delegate to the inner functions held in refs,
  // so consumers get stable references that never change between renders.

  const connect = useCallback(() => {
    connectFnRef.current?.();
  }, []);

  const disconnect = useCallback(() => {
    backoffRef.current?.cancel();
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (mountedRef.current) {
      setStatus(CONNECTION_STATUS.DISCONNECTED);
      setSocket(null);
    }
    console.log('[useSocketConnection] Manually disconnected.');
  }, []);

  // ---- return ---------------------------------------------------------------
  return {
    socket,       // The live Socket.IO instance (null when disconnected)
    status,       // One of CONNECTION_STATUS values
    isOnline,     // Browser network status
    retryCount,   // Number of reconnect attempts since last successful connect
    connect,      // Manually trigger a connection attempt
    disconnect,   // Manually trigger a clean disconnect
  };
}

export default useSocketConnection;
