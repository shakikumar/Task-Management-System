import { useState } from "react";

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

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

function SearchBar({ value, onChange }) {
  return (
    <>
      {/* Full search field — visible from md breakpoint up */}
      <div className="relative hidden w-full max-w-md md:block">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder="Search tasks, projects, people..."
          aria-label="Search"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Compact search trigger — mobile only */}
      <button
        type="button"
        aria-label="Open search"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
      >
        <SearchIcon />
      </button>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  NotificationButton — bell icon with unread indicator                      */
/* -------------------------------------------------------------------------- */

function NotificationButton({ hasUnread = true }) {
  return (
    <button
      type="button"
      aria-label="Notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
    >
      <BellIcon />
      {hasUnread && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
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
  const [searchQuery, setSearchQuery] = useState("");

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

        {/* Center — global search */}
        <div className="flex flex-1 justify-center px-2 sm:px-6">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right — notifications and user profile */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NotificationButton hasUnread={hasUnreadNotifications} />
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
          <UserAvatar name={user.name} initials={user.initials} />
        </div>

      </div>
    </header>
  );
}

export default Navbar;
