import { useState } from "react";
import axios from "axios";
import { KeyRound, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const hasLength = password.length >= 8;

  const score = [
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecial,
    hasLength,
  ].filter(Boolean).length;

  let strength = "Weak";

  if (score >= 4) {
    strength = "Strong";
  } else if (score >= 3) {
    strength = "Medium";
  }

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

if (!passwordRegex.test(password)) {
  alert(
    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
  );
  return;
}

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5001/api/auth/change-password",
        {
          currentPassword,
          newPassword: password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Password updated successfully");

      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update password"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-slate-50 to-indigo-50/50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans select-none">
      
      {/* HEADER */}
      <header className="mb-8 max-w-md mx-auto">
        <p className="text-xs font-semibold tracking-wider text-purple-500 uppercase">Security</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 mt-1">Change Password</h1>
      </header>

      {/* FORM CARD */}
      <div className="max-w-md mx-auto bg-white/95 border border-purple-100/50 p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        
        <div className="flex items-center gap-2 mb-6 text-slate-855 border-b border-purple-50 pb-3.5">
          <KeyRound size={20} className="text-violet-500" />
          <h2 className="font-bold text-lg text-slate-800">Update Credentials</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Current Password"
              className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              placeholder="New Password"
              className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Strength Meter */}
          <div className="pt-2">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-500">Password Strength</span>
              <span className={
                strength === "Weak"
                  ? "text-red-500 animate-pulse"
                  : strength === "Medium"
                    ? "text-amber-500"
                    : "text-emerald-500"
              }>
                {strength}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-purple-50 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  strength === "Weak"
                    ? "bg-gradient-to-r from-red-500 to-rose-500 w-1/3"
                    : strength === "Medium"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 w-2/3"
                      : "bg-gradient-to-r from-emerald-500 to-green-500 w-full"
                }`}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 bg-slate-50/50 border border-purple-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {hasLength ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-slate-350" />}
                <span className={hasLength ? "text-slate-700" : "text-slate-450"}>Minimum 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                {hasUpperCase ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-slate-350" />}
                <span className={hasUpperCase ? "text-slate-700" : "text-slate-450"}>Uppercase letter</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                {hasLowerCase ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-slate-350" />}
                <span className={hasLowerCase ? "text-slate-700" : "text-slate-450"}>Lowercase letter</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                {hasNumber ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-slate-350" />}
                <span className={hasNumber ? "text-slate-700" : "text-slate-450"}>Number</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                {hasSpecial ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-slate-350" />}
                <span className={hasSpecial ? "text-slate-700" : "text-slate-450"}>Special character (!@#$%^&*)</span>
              </div>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs font-semibold mt-3 flex items-center gap-1.5">
                <XCircle size={14} className="text-red-550" />
                Passwords do not match
              </p>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={handleChangePassword}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_8px_20px_rgba(124,58,237,0.25)] transition-all duration-200 cursor-pointer"
            >
              <RefreshCw size={15} />
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;