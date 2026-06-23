# Phase 5 — Backoff Manager & Connection Resilience

**Member:** E — QA & Connection Resilience Lead  
**Phase:** 5  
**Date:** 2026-06-23  
**Branch:** `memberE-phase4`

---

## 1. Architecture Overview

The connection resilience layer is a **client-side only** feature. It does not touch the backend, database schema, or authentication flow. It sits between the React application and the Socket.IO client.

```
┌─────────────────────────────────────────────────────┐
│                   React Application                  │
│                                                      │
│   ┌──────────────────────────────────────────────┐   │
│   │          useSocketConnection (hook)          │   │
│   │                                              │   │
│   │   ┌─────────────────┐  ┌──────────────────┐ │   │
│   │   │  BackoffManager │  │  NetworkMonitor  │ │   │
│   │   │  (utils/)       │  │  (utils/)        │ │   │
│   │   └────────┬────────┘  └────────┬─────────┘ │   │
│   │            │                    │            │   │
│   │            └────────┬───────────┘            │   │
│   │                     │                        │   │
│   │             Socket.IO Client                 │   │
│   └──────────────────────────────────────────────┘   │
│                                                      │
│   ┌──────────────────────────────────────────────┐   │
│   │       useConnectionMonitor (hook)            │   │
│   │         NetworkMonitor (utils/)              │   │
│   │   (standalone, no Socket.IO dependency)      │   │
│   └──────────────────────────────────────────────┘   │
│                                                      │
│   ┌──────────────────────────────────────────────┐   │
│   │         ConnectionStatusBanner (UI)          │   │
│   │  Reads status from either hook and renders   │   │
│   │  a fixed top-of-page notification banner     │   │
│   └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Deliverables

| File | Type | Purpose |
|---|---|---|
| `src/utils/backoffManager.js` | Utility | Exponential backoff scheduling |
| `src/utils/networkMonitor.js` | Utility | Browser online/offline detection |
| `src/hooks/useConnectionMonitor.js` | React Hook | Exposes network status as state |
| `src/hooks/useSocketConnection.js` | React Hook | Full Socket.IO lifecycle + reconnection |
| `src/components/ConnectionStatusBanner.jsx` | Component | Visual status indicator |
| `docs/phase5-backoff-manager.md` | Documentation | This file |

---

## 2. Reconnection Flow

```
Client Started
      │
      ▼
 autoConnect? ──Yes──► connect()
      │
      ▼
 Socket.IO tries to connect
      │
   ┌──┴──────────────────────────────────┐
   │                                     │
 connect ✅                       connect_error / disconnect
   │                                     │
   ▼                                     ▼
status = CONNECTED              scheduleReconnect()
retryCount = 0                          │
backoff.reset()                         ▼
                               backoff.scheduleRetry(callback)
                                        │
                              ┌─────────┴───────────┐
                              │                     │
                         scheduled ✅         maxRetries reached ❌
                              │                     │
                              ▼                     ▼
                      wait delay ms         status = DISCONNECTED
                              │             (give up — log error)
                              ▼
                          connect()
                    (loop back to top)
```

When the **network goes offline**:
- All pending retry timers are cancelled.
- `status` changes to `OFFLINE`.

When the **network comes back online**:
- `backoff.reset()` is called so the next attempt starts from `1 000 ms`, not where it left off.
- `connect()` is called immediately.

---

## 3. Backoff Strategy

The delay before each reconnect attempt doubles, up to a hard cap of **30 seconds**.

| Attempt # | Delay (ms) | Delay (human) |
|----------:|----------:|:-------------:|
| 1 | 1 000 | 1 s |
| 2 | 2 000 | 2 s |
| 3 | 4 000 | 4 s |
| 4 | 8 000 | 8 s |
| 5 | 16 000 | 16 s |
| 6+ | 30 000 | 30 s (cap) |

**Formula:** `delay = min(initialDelay × 2^(attempt − 1), maxDelay)`

### Key design decisions

- **No jitter** is added in this implementation to keep the code readable. In a high-concurrency production system, a small random jitter (`± delay * 0.2`) would help stagger simultaneous reconnect storms from many clients.
- **Hard ceiling at 30 s** prevents the backoff from growing indefinitely.
- **Hard ceiling at 10 retries** prevents infinite loops; the manager gives up and logs a warning after the limit is reached.
- **Timer is cancelled before each new schedule** — prevents duplicate timers accumulating if `scheduleReconnect` is called multiple times rapidly.

---

## 4. Network Monitoring Logic

`networkMonitor.js` wraps two standard browser APIs:

| API | Event | Meaning |
|---|---|---|
| `navigator.onLine` | — (sync read) | Current network state |
| `window` | `online` | Device regained network access |
| `window` | `offline` | Device lost network access |

> **Important caveat**: `navigator.onLine` only guarantees the device is not in airplane mode. It does **not** guarantee the server is reachable. A `connect_error` from Socket.IO is the authoritative signal for "server unreachable".

### Lifecycle

1. `createNetworkMonitor()` registers `online` and `offline` event listeners.
2. Any number of callbacks can subscribe via `monitor.subscribe(callback)`.
3. Each `subscribe()` call returns an **unsubscribe** function for easy `useEffect` cleanup.
4. `monitor.destroy()` removes all listeners and clears all subscribers.

---

## 5. Connection Status Values

All statuses are centralised in `useConnectionMonitor.js` as the `CONNECTION_STATUS` constant:

| Status | Meaning |
|---|---|
| `CONNECTED` | Socket.IO connection is active |
| `DISCONNECTED` | Connection was lost; no pending retry |
| `RECONNECTING` | Waiting for the next backoff timer to fire |
| `OFFLINE` | Browser reports no network; retries paused |

---

## 6. Quick Start / Integration Guide

### Step 1 — Install socket.io-client

```bash
cd frontend
npm install socket.io-client
```

### Step 2 — Use the hook in a layout or context

```jsx
// frontend/src/layouts/AdminLayout.jsx  (example)
import useSocketConnection  from '../hooks/useSocketConnection';
import ConnectionStatusBanner from '../components/ConnectionStatusBanner';

function AdminLayout() {
  const token = localStorage.getItem('token');

  const { socket, status, retryCount } = useSocketConnection({
    auth: { token },               // passed to socket.io auth handshake
    maxRetries: 10,
  });

  return (
    <>
      <ConnectionStatusBanner status={status} retryCount={retryCount} />
      {/* rest of layout … */}
    </>
  );
}
```

### Step 3 — Listen to real-time events

```jsx
import { useEffect } from 'react';
import useSocketConnection from '../hooks/useSocketConnection';

function TasksPage() {
  const token = localStorage.getItem('token');
  const { socket } = useSocketConnection({ auth: { token } });

  useEffect(() => {
    if (!socket) return;

    const onTaskUpdated = (data) => {
      console.log('Task updated:', data);
      // update local state here
    };

    socket.on('task:updated', onTaskUpdated);

    // Always clean up listeners on unmount or when socket changes.
    return () => socket.off('task:updated', onTaskUpdated);
  }, [socket]);

  return <div>Tasks Page</div>;
}
```

### Step 4 — Network-only monitoring (no Socket.IO)

```jsx
import useConnectionMonitor from '../hooks/useConnectionMonitor';

function OfflineNotice() {
  const { isOnline } = useConnectionMonitor();
  if (isOnline) return null;
  return <p>⚠️ You are offline.</p>;
}
```

---

## 7. Environment Variable

`useSocketConnection` reads the server URL from your `.env`:

```env
# frontend/.env
VITE_SOCKET_URL=http://localhost:5000
```

If `VITE_SOCKET_URL` is not set, it falls back to `VITE_API_URL`, and then to `http://localhost:5000`.

---

## 8. Testing Checklist

### ✅ Browser Refresh Test
**Goal**: Confirm the hook reconnects automatically after a page reload.
1. Open the app, confirm `status = CONNECTED`.
2. Press `F5` to reload.
3. Verify the banner briefly shows `RECONNECTING` and then disappears (back to `CONNECTED`).

---

### ✅ Network Disconnect Test
**Goal**: Confirm the offline state is detected and retries pause.
1. Open Browser DevTools → Network tab → select **Offline** from the throttle dropdown.
2. Verify the banner changes to the grey **Offline** state immediately.
3. Verify no reconnect attempts are logged to the console while offline.

---

### ✅ Network Reconnect Test
**Goal**: Confirm that the app automatically reconnects when the network is restored.
1. Take the network offline (step above).
2. Set DevTools back to **No throttling** (online).
3. Verify the banner briefly shows `RECONNECTING`, then disappears after a successful connection.
4. Verify the console logs show `backoff.reset()` was called.

---

### ✅ Server Restart Test
**Goal**: Confirm the backoff schedule fires correctly when the server is temporarily unavailable.
1. Stop the backend server.
2. Verify the banner shows `RECONNECTING (attempt 1)`, then `…(attempt 2)`, etc.
3. Verify the console shows increasing delays: 1 s, 2 s, 4 s …
4. Start the backend server again.
5. Verify the app reconnects and the retry counter resets to 0.

---

### ✅ Multiple Reconnect Attempts Test
**Goal**: Confirm the backoff ceiling is respected.
1. Keep the server stopped.
2. Watch the console — after attempt 5 the delay should not exceed 30 000 ms.
3. After 10 attempts, confirm the banner stays as `DISCONNECTED` and no further retry timers are scheduled.
4. Confirm the console logs: `Max reconnection attempts reached. Giving up.`

---

### ✅ Successful Reconnection Validation
**Goal**: Confirm that after a successful reconnect the retry counter resets.
1. Cause a few reconnect attempts (e.g., restart the server mid-backoff).
2. After the connection is re-established, verify:
   - `retryCount` displayed in the banner goes back to `0`.
   - Console logs `[BackoffManager] Reset — attempt counter cleared.`
   - The next disconnect (if any) starts from `1 s` again, not from the previous position.

---

## 9. Files Changed
No existing files were modified. All changes are additive:

```
frontend/src/
  utils/
    backoffManager.js       ← NEW
    networkMonitor.js       ← NEW
  hooks/
    useConnectionMonitor.js ← NEW
    useSocketConnection.js  ← NEW
  components/
    ConnectionStatusBanner.jsx ← NEW
docs/
  phase5-backoff-manager.md ← NEW
```
