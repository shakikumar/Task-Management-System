import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User, Mail, Shield, Settings, Edit3 } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const roleStyles = {
    ADMINISTRATOR: "bg-violet-100 text-violet-750 border-violet-200/50",
    PROJECT_MANAGER: "bg-indigo-100 text-indigo-750 border-indigo-200/50",
    COLLABORATOR: "bg-slate-100 text-slate-750 border-slate-200/50",
  };

  const roleLabels = {
    ADMINISTRATOR: "Administrator",
    PROJECT_MANAGER: "Project Manager",
    COLLABORATOR: "Collaborator",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-slate-50 to-indigo-50/50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans select-none">
      
      {/* PROFILE HEADER */}
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-wider text-purple-500 uppercase">Account</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 mt-1">My Profile</h1>
        <p className="text-sm text-slate-500/80 mt-1">
          View and manage your personal information.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
        {/* Left Card: Avatar & Basic Details */}
        <div className="lg:col-span-2 bg-white/95 border border-purple-100/50 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shadow-lg shadow-indigo-650/20 shrink-0">
            {getInitials(user?.name)}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-4 w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-855">{user?.name}</h2>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border shadow-sm ${roleStyles[user?.role] || "bg-slate-100 text-slate-700 border-slate-200/50"}`}>
                  {roleLabels[user?.role] || user?.role}
                </span>
              </div>
            </div>

            <div className="border-t border-purple-50 pt-4 space-y-3.5 text-slate-650 text-sm">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <Mail size={16} className="text-purple-400" />
                <span className="font-semibold text-slate-400">Email:</span>
                <span className="text-slate-800 font-semibold">{user?.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <Shield size={16} className="text-purple-400" />
                <span className="font-semibold text-slate-400">Permissions:</span>
                <span className="text-slate-800 font-semibold">
                  {user?.role === "ADMINISTRATOR"
                    ? "Full System Access"
                    : user?.role === "PROJECT_MANAGER"
                    ? "Manager Workspace Access"
                    : "Collaborator Basic Access"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => navigate("/admin/profile-settings")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_8px_20px_rgba(124,58,237,0.25)] transition-all duration-200 cursor-pointer"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Actions */}
        <div className="bg-white/95 border border-purple-100/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-fit space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-850">Quick Actions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage preferences & security</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate("/admin/settings")}
              className="w-full inline-flex items-center justify-between rounded-xl border border-purple-100 bg-white hover:bg-purple-50/50 p-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Settings size={17} className="text-violet-500" />
                <span>Go to Settings</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}