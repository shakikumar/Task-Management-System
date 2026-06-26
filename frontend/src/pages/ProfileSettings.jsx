import { useState, useEffect } from "react";
import axios from "axios";
import { UserCog, Save, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../config";

function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (savedUser) {
      setName(savedUser.name || "");
      setEmail(savedUser.email || "");
      setRole(savedUser.role || "");
    }
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        {
          name,
          email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert("Profile updated successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-slate-50 to-indigo-50/50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans select-none">
      
      {/* HEADER */}
      <header className="mb-8 max-w-md mx-auto">
        <p className="text-xs font-semibold tracking-wider text-purple-500 uppercase">Preferences</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 mt-1">Profile Settings</h1>
      </header>

      {/* FORM CARD */}
      <div className="max-w-md mx-auto bg-white/95 border border-purple-100/50 p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        
        <div className="flex items-center gap-2 mb-6 text-slate-855 border-b border-purple-50 pb-3.5">
          <UserCog size={20} className="text-violet-500" />
          <h2 className="font-bold text-lg text-slate-800">Personal Details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              disabled={isSubmitting}
              className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              disabled={isSubmitting}
              className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Enter phone number"
              disabled={isSubmitting}
              className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">
              Role
            </label>
            <input
              type="text"
              value={role}
              readOnly
              className="w-full bg-slate-50/70 border border-purple-100/50 rounded-xl px-4 py-2.5 text-sm text-slate-500/80 cursor-not-allowed outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;