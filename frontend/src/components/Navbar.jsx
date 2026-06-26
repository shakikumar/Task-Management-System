import { useState, useEffect } from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../services/notificationService";
import { io } from "socket.io-client";

/* -------------------------------------------------------------------------- */
/*  Icon components — inline SVGs to avoid extra dependencies                 */
/* -------------------------------------------------------------------------- */

function MenuIcon() {

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}



function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  SearchBar — centered global search, collapses to icon on small screens    */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*  NotificationButton — bell icon with unread indicator                      */
/* -------------------------------------------------------------------------- */

function NotificationButton({
  unreadCount = 0,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Notifications"
      className="relative flex h-9.5 w-9.5 items-center justify-center rounded-xl text-purple-500 transition-all hover:bg-purple-50/50 hover:text-purple-700"
    >
      <BellIcon />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-1 text-[9px] font-bold text-white shadow-[0_0_6px_rgba(168,85,247,0.5)]">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  UserAvatar — profile access point on the far right                        */
/* -------------------------------------------------------------------------- */

function UserAvatar({ name = "User", initials = "U" }) {
  return (
    <button
      type="button"
      aria-label={`${name} account menu`}
      className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2.5 transition-colors hover:bg-purple-50/40"
    >
      <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-xs font-bold text-white shadow-[0_2px_8px_rgba(124,58,237,0.25)]">
        {initials}
      </div>
      <span className="hidden text-sm font-semibold text-slate-700 sm:block">{name}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navbar — sticky top bar with left / center / right layout                 */
/* -------------------------------------------------------------------------- */

function Navbar({
  title = "Dashboard",
  onMenuClick,
  user = { name: "Alex Morgan", initials: "AM" },
  hasUnreadNotifications = true,
}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();

    const socket = io("http://localhost:5001");

    const currentUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (currentUser?.id) {
      socket.emit("join", currentUser.id);
    }

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [
        notification,
        ...prev
      ]);

      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  async function loadNotifications() {
    try {
      const res = await getNotifications();

      const data = res.data.notifications || [];

      setNotifications(data);

      setUnreadCount(
        data.filter((n) => !n.isRead).length
      );
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };
  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-purple-100/50 bg-white/70 backdrop-blur-md">
      <div className="flex h-full items-center gap-4 px-4 sm:px-6">

        {/* Left — mobile menu toggle and current page title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100/50 lg:hidden"
          >
            <MenuIcon />
          </button>

          <h1 className="truncate text-base font-extrabold text-slate-800 sm:text-lg">
            {title}
          </h1>
        </div>

        {/* Right — notifications and user profile */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <NotificationButton
            unreadCount={unreadCount}
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {showNotifications && (
            <div className="absolute right-16 top-14 w-80 rounded-2xl border border-purple-100/60 bg-white p-2.5 shadow-[0_10px_30px_-5px_rgba(124,58,237,0.15)] z-50 animate-scale-up">
              <style>{`
                @keyframes scale-up {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-up {
                  animation: scale-up 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
              `}</style>
              
              <div className="flex items-center justify-between border-b border-purple-100/30 px-3 pb-2 pt-1.5">
                <span className="font-bold text-slate-800 text-sm">Notifications</span>

                <button
                  onClick={async () => {
                    await markAllAsRead();
                    await loadNotifications();
                  }}
                  className="text-xs font-bold text-purple-650 hover:text-purple-700 transition-colors hover:underline"
                >
                  Mark All Read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto mt-2 space-y-1">

                {notifications.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-3 py-2.5 text-xs rounded-xl cursor-pointer transition-all ${!notification.isRead
                        ? "bg-purple-50/50 text-purple-950 font-bold border border-purple-100/30"
                        : "text-slate-500 hover:bg-slate-50"
                        }`}
                      onClick={async () => {
                        if (!notification.isRead) {
                          await markAsRead(notification.id);
                          loadNotifications();
                        }
                      }}
                    >
                      {notification.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <div className="mx-1 hidden h-6 w-px bg-purple-100 sm:block" aria-hidden="true" />
          <UserAvatar name={user.name} initials={user.initials} />
        </div>

      </div>
    </header>
  );
}

export default Navbar;
