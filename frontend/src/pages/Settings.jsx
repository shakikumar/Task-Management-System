import { useNavigate } from "react-router-dom";
import { Lock, ShieldAlert } from "lucide-react";

function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-slate-50 to-indigo-50/50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans select-none">
      
      {/* HEADER */}
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-wider text-purple-500 uppercase">Configuration</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 mt-1">Settings</h1>
        <p className="text-sm text-slate-500/80 mt-1">
          Manage your system preferences and account security.
        </p>
      </header>

      {/* CARD */}
      <div className="bg-white/95 border border-purple-100/50 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 max-w-lg">
        
        {/* ACCOUNT SECURITY */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-slate-800 border-b border-purple-50 pb-3">
            <Lock size={18} className="text-violet-500" />
            <h2 className="font-bold text-lg">Account Security</h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Protect your account by regularly changing your password and ensuring robust credentials.
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/change-password")}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200/40 text-red-650 px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            <ShieldAlert size={16} />
            Change Password
          </button>
        </div>

      </div>
    </div>
  );
}

export default Settings;