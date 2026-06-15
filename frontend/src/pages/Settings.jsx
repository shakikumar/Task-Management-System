import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [emailNotif, setEmailNotif] = useState(true);

  // Apply theme to body (simple real behavior)
  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
  }, [theme]);

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

        {/* THEME */}
        <div>
          <h2 className="font-semibold mb-2">Theme</h2>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* NOTIFICATIONS */}
        <div>
          <h2 className="font-semibold mb-2">Notifications</h2>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={() => setEmailNotif(!emailNotif)}
            />
            Email Notifications
          </label>
        </div>

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