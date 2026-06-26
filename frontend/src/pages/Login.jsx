import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    // validation
    if (!trimmedEmail || !password) {
      setError("Please enter email and password");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
  "https://task-management-system-2xa3.onrender.com/api/auth/login",
        {
          email: trimmedEmail,
          password,
        }
      );

      // store JWT
      localStorage.setItem("token", data.token);

      // store user data
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
      // Force password change check
      if (data.user.mustResetPassword) {
        navigate("/admin/change-password");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050014] text-white font-sans">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-12px) translateX(2px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-16px) translateX(-2px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(3px); }
        }
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
      `}</style>

      {/* Global Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-700/30 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/25 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />

      {/* Split-screen container */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Side: Branding & Illustration */}
        <div className="hidden lg:flex flex-col space-y-10 lg:col-span-7 pr-8">
          {/* Logo / Branding */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              {/* Checkmark icon inside circle */}
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wider text-white">TASK</span>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-purple-300/60 uppercase">MANAGEMENT SYSTEM</span>
            </div>
          </div>

          {/* Heading and Description */}
          <div className="space-y-4 max-w-lg">
            <h1 className="text-5xl font-extrabold tracking-tight text-white leading-none">
              Welcome <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400">Back</span>
            </h1>
            <p className="text-sm text-purple-200/50 leading-relaxed font-light">
              Sign in to continue using the Task Management System and keep your projects moving forward.
            </p>
          </div>

          {/* Collaboration Illustration */}
          <div className="relative w-full max-w-xl h-[420px] flex items-center justify-center">
            {/* Dashed Connector Lines */}
            <div className="absolute top-10 bottom-10 left-1/2 w-[1px] border-l border-dashed border-purple-500/20 -translate-x-1/2 pointer-events-none" />
            <div className="absolute left-10 right-10 top-1/2 h-[1px] border-t border-dashed border-purple-500/20 -translate-y-1/2 pointer-events-none" />

            {/* Concentric Glow Rings */}
            <div className="absolute w-[340px] h-[180px] rounded-[50%] border border-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.05)] pointer-events-none animate-pulse" />
            <div className="absolute w-[260px] h-[130px] rounded-[50%] border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] pointer-events-none" />
            <div className="absolute w-[160px] h-[80px] rounded-[50%] bg-purple-950/20 border border-purple-500/40 shadow-[inset_0_0_20px_rgba(168,85,247,0.3),_0_0_40px_rgba(168,85,247,0.2)] flex items-center justify-center">
              {/* Center Laptop Icon */}
              <svg className="w-8 h-8 text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>

            {/* Avatars */}
            {/* Top Avatar */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-b from-purple-300 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] mb-1" />
              <div className="w-10 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-2xl shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>

            {/* Bottom Avatar */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-b from-purple-300 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] mb-1" />
              <div className="w-10 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-2xl shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>

            {/* Left Avatar */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-b from-purple-300 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] mb-1" />
              <div className="w-10 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-2xl shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>

            {/* Right Avatar */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-b from-purple-300 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] mb-1" />
              <div className="w-10 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-2xl shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>

            {/* Floating bubbles */}
            {/* Bubble Left: Message content lines */}
            <div className="absolute left-1 top-[20%] animate-float-slow rounded-xl rounded-tr-none bg-purple-950/40 backdrop-blur-md border border-purple-500/25 px-2.5 py-2 flex flex-col gap-1 w-14 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="h-1 w-full bg-purple-300/40 rounded-full" />
              <div className="h-1 w-2/3 bg-purple-300/40 rounded-full" />
            </div>

            {/* Bubble Right (Top): Typing indicator */}
            <div className="absolute right-0 top-[22%] animate-float-medium rounded-xl rounded-tl-none bg-purple-950/40 backdrop-blur-md border border-purple-500/25 px-2.5 py-2 flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="w-1.5 h-1.5 bg-purple-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-purple-400/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-purple-400/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>

            {/* Bubble Right (Bottom): Message line */}
            <div className="absolute right-2 bottom-[20%] animate-float-fast rounded-xl rounded-tr-none bg-purple-950/40 backdrop-blur-md border border-purple-500/25 px-2.5 py-2 flex flex-col gap-1 w-14 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="h-1 w-full bg-purple-300/40 rounded-full" />
              <div className="h-1 w-1/2 bg-purple-300/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-5 flex flex-col justify-center items-start w-full">
          
          {/* Mobile Logo / Header (hidden on large screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tracking-wider text-white">TASK</span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-purple-300/60 uppercase">MANAGEMENT SYSTEM</span>
            </div>
            <p className="text-purple-200/50 text-xs mt-1 text-center max-w-[280px]">
              Sign in to continue using the Task Management System and keep your projects moving forward.
            </p>
          </div>

          {/* Form Box */}
          <div className="relative w-full max-w-[450px] rounded-3xl border border-purple-400/40 bg-purple-950/15 p-8 sm:p-10 backdrop-blur-xl shadow-[0_0_80px_rgba(168,85,247,0.35)] flex flex-col overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 to-indigo-600/5 pointer-events-none" />
            
            <div className="absolute inset-0 rounded-3xl border border-purple-400/60 shadow-[0_0_25px_rgba(192,132,252,0.7)] pointer-events-none" />
            {/* Card Header */}
            <div className="relative mb-8">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Sign In
              </h2>
              <div className="mt-2 h-[2.5px] w-10 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-950/30 border border-red-500/25 text-red-300 text-sm rounded-xl text-center flex items-center justify-center space-x-2 animate-pulse">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-purple-300/60 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-purple-300/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-11 pr-4 py-3 w-full bg-purple-950/30 border border-purple-500/20 text-white rounded-xl placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 focus:shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-purple-300/60 uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-purple-300/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-11 pr-11 py-3 w-full bg-purple-950/30 border border-purple-500/20 text-white rounded-xl placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 focus:shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300/40 hover:text-purple-300/70 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-xl py-3 text-white font-semibold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center text-sm shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            {/* Copyright */}
            <p className="mt-8 text-center text-[10px] tracking-wider text-purple-300/30 select-none">
              © 2026 TASK — Task Management System
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;