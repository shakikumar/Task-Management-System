// ============================================================
// utils/backoffManager.js  — Exponential Backoff Manager
//
// Manages reconnection timing with exponential delays so that
// failed connections back off progressively, reducing server
// load and preventing rapid reconnect loops.
//
// Retry schedule (milliseconds):
//   Attempt 1 →  1 000 ms
//   Attempt 2 →  2 000 ms
//   Attempt 3 →  4 000 ms
//   Attempt 4 →  8 000 ms
//   Attempt 5 → 16 000 ms
//   Attempt 6+ → 30 000 ms  (hard cap)
// ============================================================

const INITIAL_DELAY_MS  = 1_000;   // 1 s — first retry wait
const MAX_DELAY_MS      = 30_000;  // 30 s — absolute ceiling
const MAX_RETRY_ATTEMPTS = 10;     // give up after this many attempts

/**
 * Creates a self-contained backoff manager instance.
 *
 * @param {object} [options]
 * @param {number} [options.initialDelay]   - First retry delay in ms  (default 1 000)
 * @param {number} [options.maxDelay]       - Maximum delay cap in ms  (default 30 000)
 * @param {number} [options.maxAttempts]    - Max retries before giving up (default 10)
 * @returns {BackoffManager}
 */
function createBackoffManager(options = {}) {
  const initialDelay  = options.initialDelay  ?? INITIAL_DELAY_MS;
  const maxDelay      = options.maxDelay      ?? MAX_DELAY_MS;
  const maxAttempts   = options.maxAttempts   ?? MAX_RETRY_ATTEMPTS;

  // Internal state — kept inside the closure for encapsulation.
  let attemptCount = 0;
  let timerRef     = null;

  // ---- helpers ----------------------------------------------------------------

  /**
   * Pure function: compute the next delay without mutating state.
   * Formula: min(initialDelay * 2^(attempt), maxDelay)
   */
  function computeDelay(attempt) {
    return Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
  }

  /**
   * Cancel any pending retry timer.
   */
  function cancelTimer() {
    if (timerRef !== null) {
      clearTimeout(timerRef);
      timerRef = null;
    }
  }

  // ---- public API -------------------------------------------------------------

  /**
   * Schedule the next reconnect attempt.
   *
   * @param {function} callback - The function to call after the backoff delay.
   *                              Receives { attempt: number, delay: number }.
   * @returns {boolean} false if the max retry limit has been reached.
   */
  function scheduleRetry(callback) {
    if (attemptCount >= maxAttempts) {
      console.warn(
        `[BackoffManager] Max retry limit (${maxAttempts}) reached. ` +
        'Stopping reconnection attempts.'
      );
      return false;
    }

    const delay = computeDelay(attemptCount);
    attemptCount += 1;

    console.log(
      `[BackoffManager] Attempt #${attemptCount} scheduled in ${delay}ms.`
    );

    cancelTimer(); // safety: clear any previous timer before scheduling a new one
    timerRef = setTimeout(() => {
      timerRef = null;
      callback({ attempt: attemptCount, delay });
    }, delay);

    return true;
  }

  /**
   * Call this after a successful connection.
   * Resets attempt counter so future disconnects start from the beginning.
   */
  function reset() {
    cancelTimer();
    attemptCount = 0;
    console.log('[BackoffManager] Reset — attempt counter cleared.');
  }

  /**
   * Abort all pending retries without resetting the counter.
   * Useful when the user manually triggers a disconnect.
   */
  function cancel() {
    cancelTimer();
    console.log('[BackoffManager] Cancelled all pending retries.');
  }

  /** Read-only snapshot of the current internal state. */
  function getState() {
    return {
      attemptCount,
      maxAttempts,
      nextDelay    : computeDelay(attemptCount),
      hasReachedMax: attemptCount >= maxAttempts,
    };
  }

  return {
    scheduleRetry,
    reset,
    cancel,
    getState,
  };
}

export { createBackoffManager, INITIAL_DELAY_MS, MAX_DELAY_MS, MAX_RETRY_ATTEMPTS };
export default createBackoffManager;
