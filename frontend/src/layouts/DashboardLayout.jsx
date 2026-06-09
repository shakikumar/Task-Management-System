import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>

    </div>
  );
}

export default DashboardLayout;