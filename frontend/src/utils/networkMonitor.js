// ============================================================
// utils/networkMonitor.js — Browser Network Status Monitor
//
// Thin wrapper around the browser's Navigator.onLine API and
// the window "online" / "offline" events.
//
// Designed to be framework-agnostic (plain JS) so it can be
// used from React hooks, vanilla scripts, or tests alike.
// ============================================================

/**
 * Returns whether the browser currently believes it has a
 * network connection.  Note: navigator.onLine can be true even
 * when the connection is flaky — it only guarantees the device
 * is not airplane-mode offline.
 *
 * @returns {boolean}
 */
function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Creates a NetworkMonitor instance that:
 *  - Reports current online/offline status via `getStatus()`
 *  - Notifies registered callbacks when the status changes
 *  - Cleans up event listeners when `destroy()` is called
 *
 * @returns {NetworkMonitor}
 */
function createNetworkMonitor() {
  // Set of subscriber callbacks: (isOnline: boolean) => void
  const subscribers = new Set();

  // ---- internal handlers --------------------------------------------------

  function handleOnline() {
    console.log('[NetworkMonitor] Network came ONLINE.');
    subscribers.forEach((cb) => cb(true));
  }

  function handleOffline() {
    console.log('[NetworkMonitor] Network went OFFLINE.');
    subscribers.forEach((cb) => cb(false));
  }

  // Attach global browser events once per monitor instance.
  if (typeof window !== 'undefined') {
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  // ---- public API ---------------------------------------------------------

  /**
   * Register a callback that fires whenever the network status changes.
   * The callback receives a single boolean: `true` = online, `false` = offline.
   *
   * @param {function} callback
   * @returns {function} unsubscribe — call it to stop receiving updates.
   */
  function subscribe(callback) {
    subscribers.add(callback);

    // Return an unsubscribe function for easy cleanup in React useEffect.
    return function unsubscribe() {
      subscribers.delete(callback);
    };
  }

  /**
   * Returns the current network status snapshot.
   * @returns {{ online: boolean }}
   */
  function getStatus() {
    return { online: isOnline() };
  }

  /**
   * Remove global event listeners and clear all subscribers.
   * Call this when the monitor is no longer needed (e.g. app unmounts).
   */
  function destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
    subscribers.clear();
    console.log('[NetworkMonitor] Destroyed — event listeners removed.');
  }

  return {
    subscribe,
    getStatus,
    destroy,
  };
}

export { isOnline, createNetworkMonitor };
export default createNetworkMonitor;
