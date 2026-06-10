import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import ProfileSettings from "./pages/ProfileSettings";

import AdminDashboard from "./pages/AdminDashboard";
import Projects from "./pages/Projects";
import Users from "./pages/Users";

function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Member D Pages */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/profile-settings" element={<ProfileSettings />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="users" element={<Users />} />
        <Route path="tasks" element={<div>Tasks Page (coming soon)</div>} />
        <Route path="profile" element={<div>Profile Page (coming soon)</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
      </Route>

      {/* Legacy */}
      <Route path="/projects" element={<Projects />} />
      <Route path="/users" element={<Users />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;