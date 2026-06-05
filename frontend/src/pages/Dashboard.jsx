function Dashboard() {
  return (
    <div className="min-h-screen flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">
          Task Manager
        </h2>

        <ul className="space-y-3">
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
            Dashboard
          </li>

          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
            Tasks
          </li>

          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
            Profile
          </li>

          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
            Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">
            Dashboard
          </h1>
        </div>

        <div className="p-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">
              Welcome
            </h2>

            <p>
              Welcome to the Task Management System.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;