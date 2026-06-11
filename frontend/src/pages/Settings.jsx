function Settings() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
  
        <div className="bg-white p-6 rounded shadow max-w-md space-y-6">
  
          {/* Theme */}
          <div>
            <h2 className="font-semibold mb-2">Theme</h2>
  
            <select className="border p-2 rounded w-full">
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
  
          {/* Notifications */}
          <div>
            <h2 className="font-semibold mb-2">Notifications</h2>
  
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Email Notifications
            </label>
          </div>
  
          {/* Account */}
          <div>
            <h2 className="font-semibold mb-2">Account</h2>
  
            <input
              className="border p-2 rounded w-full mb-2"
              placeholder="Change password"
            />
  
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Update
            </button>
          </div>
  
        </div>
      </div>
    );
  }
  
  export default Settings;