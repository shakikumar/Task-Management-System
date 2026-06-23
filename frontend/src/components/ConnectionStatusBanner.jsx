// ============================================================
// components/ConnectionStatusBanner.jsx
//
// A slim, non-intrusive banner that slides in at the top of
// the page to inform the user of their current connection
// state.  Uses inline styles so it has no external CSS
// dependency and works regardless of which stylesheet is loaded.
//
// Usage:
//   import ConnectionStatusBanner from '../components/ConnectionStatusBanner';
//   const { status, retryCount } = useSocketConnection({ auth: { token } });
//   <ConnectionStatusBanner status={status} retryCount={retryCount} />
// ============================================================

import { CONNECTION_STATUS } from '../hooks/useConnectionMonitor';

/* -------------------------------------------------------------------------- */
/*  Icon helpers — inline SVG, no extra dependency                             */
/* -------------------------------------------------------------------------- */

function OfflineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'tms-spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Status configuration map                                                   */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  [CONNECTION_STATUS.CONNECTED]: {
    show   : false, // hide banner when connected — no need to distract the user
    bg     : '#16a34a',
    text   : 'Connected',
    icon   : <CheckIcon />,
  },
  [CONNECTION_STATUS.DISCONNECTED]: {
    show   : true,
    bg     : '#dc2626',
    text   : 'Connection lost. Attempting to reconnect…',
    icon   : <OfflineIcon />,
  },
  [CONNECTION_STATUS.RECONNECTING]: {
    show   : true,
    bg     : '#d97706',
    text   : 'Reconnecting',
    icon   : <SpinnerIcon />,
  },
  [CONNECTION_STATUS.OFFLINE]: {
    show   : true,
    bg     : '#6b7280',
    text   : 'You are offline. Please check your internet connection.',
    icon   : <OfflineIcon />,
  },
};

/* -------------------------------------------------------------------------- */
/*  ConnectionStatusBanner component                                           */
/* -------------------------------------------------------------------------- */

/**
 * @param {object}  props
 * @param {string}  props.status     - One of CONNECTION_STATUS values
 * @param {number}  [props.retryCount] - Current reconnect attempt number
 */
function ConnectionStatusBanner({ status, retryCount = 0 }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[CONNECTION_STATUS.DISCONNECTED];

  if (!config.show) return null;

  const retryLabel =
    status === CONNECTION_STATUS.RECONNECTING && retryCount > 0
      ? ` (attempt ${retryCount})`
      : '';

  return (
    <>
      {/* Keyframe for the spinner — injected once */}
      <style>{`
        @keyframes tms-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes tms-slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        id="connection-status-banner"
        style={{
          position       : 'fixed',
          top            : 0,
          left           : 0,
          right          : 0,
          zIndex         : 9999,
          display        : 'flex',
          alignItems     : 'center',
          justifyContent : 'center',
          gap            : '8px',
          padding        : '8px 16px',
          backgroundColor: config.bg,
          color          : '#ffffff',
          fontSize       : '13px',
          fontWeight     : 500,
          fontFamily     : 'inherit',
          animation      : 'tms-slide-down 0.25s ease-out',
          boxShadow      : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {config.icon}
        <span>{config.text}{retryLabel}</span>
      </div>
    </>
  );
}

export default ConnectionStatusBanner;
