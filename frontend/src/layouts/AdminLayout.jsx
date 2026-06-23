import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";



export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const dashboardTitle =
    currentUser?.role === "PROJECT_MANAGER"
      ? "Project Manager Dashboard"
      : currentUser?.role === "COLLABORATOR"
      ? "Collaborator Dashboard"
      : "Admin Dashboard";

  

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:ml-[260px]">
        <Navbar
          title={dashboardTitle}
          onMenuClick={() => setSidebarOpen(true)}
          user={{
            name: currentUser?.name || "User",
            initials:
              currentUser?.name?.charAt(0)?.toUpperCase() || "U",
          }}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
