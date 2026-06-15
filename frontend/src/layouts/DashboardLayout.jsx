import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";


function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />

      {/* Main content offset — always safe for fixed sidebar */}
      <div className="min-h-screen ml-[260px]">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default DashboardLayout;