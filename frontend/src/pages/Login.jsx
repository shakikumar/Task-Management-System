import { useNavigate } from "react-router-dom";
import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter email and password");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />
      <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative w-full max-w-md">

        <div className="rounded-2xl border border-white/10 bg-white/[0.97] p-8 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl sm:p-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
              🔐
            </div>

            <h1 className="text-2xl font-semibold sm:text-3xl">
              Task Manager
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-white font-semibold"
            >
              Sign in
            </button>

          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            © 2026 Task Management System
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;