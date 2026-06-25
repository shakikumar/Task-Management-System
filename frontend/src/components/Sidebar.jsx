import { useState } from "react";
import { NavLink } from "react-router-dom";
/* -------------------------------------------------------------------------- */
/*  Layout constants — use in parent layouts for main-content offset          */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*  Icons — path data + single renderer for consistent sizing/stroke           */
/* -------------------------------------------------------------------------- */

const ICON_PATHS = {
  dashboard: [
    "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  ],
  projects: [
    "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l.12-.7a1.125 1.125 0 011.3-.98l3.036.52a1.125 1.125 0 011.065 1.328l-.332 1.933M15 12.75H9m6 0a2.25 2.25 0 002.25-2.25V9.75a2.25 2.25 0 00-2.25-2.25H9A2.25 2.25 0 006.75 9.75v.75a2.25 2.25 0 002.25 2.25h6z",
  ],
  users: [
    "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  ],
  settings: [
    "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
    "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  ],
  logo: ["M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"],
  close: ["M6 18L18 6M6 6l12 12"],
  collapse: ["M15.75 19.5L8.25 12l7.5-7.5"],
  expand: ["M8.25 4.5l7.5 7.5-7.5 7.5"],
  logout: [
    "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9",
  ],
};

function SidebarIcon({ paths, className = "h-5 w-5 shrink-0", strokeWidth = 1.75 }) {
 
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      aria-hidden="true"
    >
      {paths.map((d, index) => (
        <path key={index} strokeLinecap="round" strokeLinejoin="round" d={d} />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navigation config — routes stay unchanged                                 */
/* -------------------------------------------------------------------------- */

const navItems = [
  { to: "/admin", label: "Overview", icon: ICON_PATHS.dashboard, end: true },
  { to: "/admin/projects", label: "Projects", icon: ICON_PATHS.projects },
  { to: "/admin/users", label: "Users", icon: ICON_PATHS.users },
  { to: "/admin/tasks", label: "Tasks", icon: ICON_PATHS.dashboard },
  { to: "/admin/profile", label: "Profile", icon: ICON_PATHS.users },
  { to: "/admin/settings", label: "Settings", icon: ICON_PATHS.settings },
];

/* -------------------------------------------------------------------------- */
/*  NavItem — active indicator, collapsed tooltips, keyboard focus            */
/* -------------------------------------------------------------------------- */

function navLinkClass(isActive, collapsed) {
  return [
    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0516]",
    collapsed ? "lg:justify-center lg:gap-0 lg:px-2" : "",
    isActive
      ? [
        "bg-purple-650/20 text-white shadow-sm ring-1 ring-purple-500/35",
        "before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-purple-400 before:shadow-[0_0_8px_rgba(168,85,247,0.8)]",
        collapsed ? "lg:before:h-5" : "",
      ].join(" ")
      : "text-slate-400 hover:bg-purple-500/5 hover:text-purple-200",
  ].join(" ");
}

function NavItem({ to, label, icon, end, onClose, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) => navLinkClass(isActive, collapsed)}
    >
      {({ isActive }) => (
        <>
          <span
            className={
              isActive
                ? "text-indigo-300"
                : "text-slate-500 transition-colors group-hover:text-slate-300"
            }
          >
            <SidebarIcon paths={icon} />
          </span>
          <span className={collapsed ? "lg:sr-only" : undefined}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sidebar — fixed nav shell with mobile drawer + optional desktop collapse    */
/* -------------------------------------------------------------------------- */

function Sidebar({
  isOpen = false,
  onClose,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
}) {
  const [collapsedInternal, setCollapsedInternal] = useState(defaultCollapsed);
  const isCollapsedControlled = collapsedProp !== undefined;
  const collapsed = isCollapsedControlled ? collapsedProp : collapsedInternal;
  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );
  const role = currentUser?.role;
  const filteredNavItems = navItems.filter((item) => {

    if (role === "ADMINISTRATOR") {
      return true;
    }

    if (role === "PROJECT_MANAGER") {
      return item.label !== "Users";
    }

    if (role === "COLLABORATOR") {
      return [
        "Overview",
        "Tasks",
        "Profile",
        "Settings"
      ].includes(item.label);
    }

    return false;
  });

  const handleToggleCollapse = () => {
    const next = !collapsed;
    onCollapsedChange?.(next);
    if (!isCollapsedControlled) {
      setCollapsedInternal(next);
    }
  };
  function handleLogout() {
    localStorage.removeItem("token");
    window.location.replace("/login");
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden={!isOpen}
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        aria-label="Main sidebar"
        className={[
          "fixed top-0 left-0 z-50 flex h-screen w-[260px] flex-col",
          "border-r border-purple-500/15 bg-[#0c051a]/95 backdrop-blur-xl",
          "transition-[transform,width] duration-300 ease-in-out",
          "lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div
          className={[
            "flex h-16 shrink-0 items-center border-b border-purple-500/15",
            collapsed ? "justify-center px-2 lg:px-0" : "justify-between px-5",
          ].join(" ")}
        >
          <div className={["flex items-center", collapsed ? "lg:justify-center" : "gap-2.5"].join(" ")}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md shadow-purple-500/30">
              {/* Checkmark style icon or standard lightning logo paths */}
              <SidebarIcon paths={ICON_PATHS.logo} className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className={["flex flex-col", collapsed ? "lg:hidden" : ""].join(" ")}>
              <span className="text-sm font-bold tracking-wider text-white uppercase">TASK</span>
              <span className="text-[8px] font-semibold tracking-[0.2em] text-purple-300/60 uppercase">MANAGEMENT SYSTEM</span>
            </div>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 lg:hidden"
          >
            <SidebarIcon paths={ICON_PATHS.close} />
          </button>
        </div>

        {/* Navigation */}
        <nav id="sidebar-navigation" className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <p
            className={[
              "mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-purple-400/80",
              collapsed ? "lg:sr-only" : "",
            ].join(" ")}
          >
            Menu
          </p>
          <ul className="space-y-1" role="list">
            {filteredNavItems.map(({ to, label, icon, end }) => (
              <li key={to}>
                <NavItem
                  to={to}
                  label={label}
                  icon={icon}
                  end={end}
                  onClose={onClose}
                  collapsed={collapsed}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop collapse toggle */}
        <div className="hidden shrink-0 px-3 pb-2 lg:block">
          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="sidebar-navigation"
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-400 transition-colors",
              "hover:bg-white/5 hover:text-slate-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
              collapsed ? "lg:justify-center lg:gap-0 lg:px-2" : "",
            ].join(" ")}
          >
            <SidebarIcon paths={collapsed ? ICON_PATHS.expand : ICON_PATHS.collapse} />
            <span className={collapsed ? "lg:sr-only" : "text-sm font-medium"}>
              {collapsed ? "Expand" : "Collapse"}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-purple-500/15 p-4">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            aria-label="Logout"
            className={[
              "mt-1 flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
              "bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/25",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50",
              collapsed ? "lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3",
            ].join(" ")}
          >
            <SidebarIcon paths={ICON_PATHS.logout} />
            <span className={collapsed ? "lg:sr-only" : ""}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
