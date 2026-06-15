
import { Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import ProfileSettings from "../pages/ProfileSettings";
import ChangePassword from "../pages/ChangePassword";

export const userRoutes = (
  <>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile-settings" element={<ProfileSettings />} />
    <Route path="/change-password" element={<ChangePassword />} />
  </>
);