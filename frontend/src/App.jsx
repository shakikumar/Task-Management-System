import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      {/* Default route → redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login (no layout) */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard layout (sidebar + outlet pages) */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Temporary placeholder pages */}
        <Route path="/projects" element={<div>Projects Page</div>} />
        <Route path="/users" element={<div>Users Page</div>} />
        <Route path="/settings" element={<div>Settings Page</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;