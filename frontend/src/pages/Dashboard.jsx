function Dashboard() {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        
        <h2 className="text-2xl font-bold mb-8 text-blue-400">
          TaskFlow
        </h2>

        <nav className="space-y-2">
          <div className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer">
            Dashboard
          </div>

          <div className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer">
            Tasks
          </div>

          <div className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer">
            Projects
          </div>

          <div className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer">
            Profile
          </div>

          <div className="p-3 rounded-lg hover:bg-red-600 cursor-pointer mt-6">
            Logout
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">

        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-700">
            Dashboard
          </h1>

          <div className="text-sm text-gray-500">
            Welcome back 👋
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-gray-500">Total Tasks</h3>
            <p className="text-2xl font-bold">12</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-gray-500">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">5</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">7</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;