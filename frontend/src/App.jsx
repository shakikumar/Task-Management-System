import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import ProfileSettings from "./pages/ProfileSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<h1 className="text-center text-3xl mt-10">Home Page</h1>}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

         {/* Member D Pages */}
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;