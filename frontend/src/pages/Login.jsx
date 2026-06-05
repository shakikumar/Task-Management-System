import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md">
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Task Manager
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Sign in to continue
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-200 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-200 p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 Task Management System
        </p>
      </div>
    </div>
  );
}

export default Login;