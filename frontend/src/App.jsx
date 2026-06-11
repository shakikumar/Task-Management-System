import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import ProfileSettings from "./pages/ProfileSettings";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import Tasks from "./pages/Tasks";

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

      {/* ADMIN SYSTEM */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="users" element={<Users />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="settings" element={<ChangePassword />} />
      </Route>

      {/* Legacy Routes */}
      <Route path="/projects" element={<Projects />} />
      <Route path="/users" element={<Users />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;