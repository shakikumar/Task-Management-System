// ============================================================
// hooks/useConnectionMonitor.js — Network Status React Hook
//
// Tracks the browser's online / offline state and exposes it
// as reactive React state so any component can read and react
// to connectivity changes without wiring up event listeners
// itself.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import createNetworkMonitor from '../utils/networkMonitor';

/**
 * Connection status constants.
 * Import these from here to avoid magic strings in consumer code.
 */
export const CONNECTION_STATUS = Object.freeze({
  CONNECTED    : 'CONNECTED',
  DISCONNECTED : 'DISCONNECTED',
  RECONNECTING : 'RECONNECTING',
  OFFLINE      : 'OFFLINE',
});

/**
 * useConnectionMonitor
 *
 * Provides real-time browser network status as React state.
 *
 * @returns {{
 *   isOnline        : boolean,
 *   connectionStatus: string,   — one of CONNECTION_STATUS values
 *   lastChangedAt   : Date|null — timestamp of last status change
 * }}
 *
 * @example
 *   const { isOnline, connectionStatus } = useConnectionMonitor();
 *   if (!isOnline) return <p>You are offline</p>;
 */
function useConnectionMonitor() {
  // ---- state ----------------------------------------------------------------
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState(
    navigator.onLine ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.OFFLINE
  );
  const [lastChangedAt, setLastChangedAt] = useState(null);

  // Keep a stable ref to the monitor so it's created only once.
  const monitorRef = useRef(null);

  // ---- effect ---------------------------------------------------------------
  useEffect(() => {
    // Create the monitor instance on mount.
    const monitor = createNetworkMonitor();
    monitorRef.current = monitor;

    // Subscribe to online / offline events from the monitor.
    const unsubscribe = monitor.subscribe((online) => {
      setIsOnline(online);
      setConnectionStatus(
        online ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.OFFLINE
      );
      setLastChangedAt(new Date());
    });

    // Sync initial state in case navigator.onLine changed between
    // the first render and when the effect ran.
    const { online: currentlyOnline } = monitor.getStatus();
    if (currentlyOnline !== isOnline) {
      setIsOnline(currentlyOnline);
      setConnectionStatus(
        currentlyOnline ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.OFFLINE
      );
    }

    // Cleanup: remove event listeners when the component unmounts.
    return () => {
      unsubscribe();
      monitor.destroy();
    };
  }, []); // run once on mount — no deps needed, monitor is created once

  return {
    isOnline,
    connectionStatus,
    lastChangedAt,
  };
}

export default useConnectionMonitor;
