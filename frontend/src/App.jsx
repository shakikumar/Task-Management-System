import { Routes, Route, Navigate } from "react-router-dom";

//import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import Projects from "./pages/Projects";

// Pages
import Login from "./pages/Login";
//import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";

function App() {
  return (
    <Routes>
  {/* Default route → redirect to login */}
  <Route path="/" element={<Navigate to="/login" replace />} />

  {/* Login (no layout) */}
  <Route path="/login" element={<Login />} />

  {/* ADMIN SYSTEM (ONLY ONE CLEAN STRUCTURE) */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="projects" element={<Projects />} />
    <Route path="users" element={<Users />} />
    <Route path="tasks" element={<div>Tasks Page (coming soon)</div>} />
    <Route path="profile" element={<div>Profile Page (coming soon)</div>} />
    <Route path="settings" element={<div>Settings Page</div>} />
  </Route>

  {/* OLD SYSTEM (KEEP ONLY IF STILL NEEDED) */}
  <Route path="/projects" element={<Projects />} />
  <Route path="/users" element={<Users />} />
  <Route path="/tasks" element={<div>Tasks Page (coming soon)</div>} />
  <Route path="/profile" element={<div>Profile Page (coming soon)</div>} />
  <Route path="/settings" element={<div>Settings Page</div>} />

  {/* Fallback */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
  );
}

export default App;