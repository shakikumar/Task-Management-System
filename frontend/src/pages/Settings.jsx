
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  

  // Apply theme to body (simple real behavior)
  

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your preferences
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white p-6 rounded-xl shadow space-y-6 max-w-lg">

       

        {/* ACCOUNT */}
        <div>
          <h2 className="font-semibold mb-3">Account Security</h2>

          <button
            onClick={() => navigate("/admin/change-password")}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm"
          >
            Change Password
          </button>
        </div>

      </div>
    </div>
  );
}

export default Settings;