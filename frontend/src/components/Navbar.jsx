import { useState, useEffect } from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../services/notificationService";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

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
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
    >
      <BellIcon />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
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
      className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-sm">
        {initials}
      </div>
      <span className="hidden text-sm font-medium text-slate-700 sm:block">{name}</span>
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


  const loadNotifications = async () => {
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
    toast.info(notification.message);
  });

  return () => {
    socket.disconnect();
  };
}, []);
  
  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="flex h-full items-center gap-4 px-4 sm:px-6">

        {/* Left — mobile menu toggle and current page title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <MenuIcon />
          </button>

          <h1 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
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
            <div className="absolute right-16 top-14 w-80 rounded-lg border bg-white shadow-lg z-50">
              
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-semibold">Notifications</span>

                <button
                  onClick={async () => {
                    await markAllAsRead();
                    await loadNotifications();
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark All Read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">

                {notifications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b px-4 py-3 text-sm cursor-pointer ${!notification.isRead
                        ? "bg-blue-50"
                        : "bg-white text-gray-500"
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
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
          <UserAvatar name={user.name} initials={user.initials} />
        </div>

      </div>
    </header>
  );
}

export default Navbar;
