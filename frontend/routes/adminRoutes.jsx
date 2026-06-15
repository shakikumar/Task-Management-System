import { Route } from "react-router-dom";

import AdminDashboard from "../pages/AdminDashboard";
import Projects from "../pages/Projects";
import Users from "../pages/Users";
import Tasks from "../pages/Tasks";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

export const adminRoutes = (
  <>
    <Route index element={<AdminDashboard />} />
    <Route path="projects" element={<Projects />} />
    <Route path="users" element={<Users />} />
    <Route path="tasks" element={<Tasks />} />
    <Route path="profile" element={<Profile />} />
    <Route path="settings" element={<Settings />} />
  </>
);