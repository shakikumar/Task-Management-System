import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  useEffect(() => {
  const savedUser = JSON.parse(
    localStorage.getItem("user")
  );

  if (savedUser) {
    setUser(savedUser);
  }
}, []);
  
  return (
    <div className="p-6 space-y-6">

      {/* PROFILE HEADER */}
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-slate-500">
          View and manage your personal information
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white shadow rounded-xl p-6">

        <div className="space-y-3">
          <p><b>Name:</b> {user?.name}</p>
          <p><b>Email:</b> {user?.email}</p>
          <p><b>Role:</b> {user?.role}</p>
        </div>

        {/* EDIT PROFILE */}
        <button
          onClick={() => navigate("/admin/profile-settings")}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
        >
          Edit Profile
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

        <button
          onClick={() => navigate("/admin/settings")}
          className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-700"
        >
          Go to Settings
        </button>
      </div>

    </div>
  );
}