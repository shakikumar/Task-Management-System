function Profile() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
  
        <div className="bg-white p-6 rounded shadow max-w-md">
          <div className="space-y-3">
  
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-semibold">John Doe</p>
            </div>
  
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-semibold">john@example.com</p>
            </div>
  
            <div>
              <p className="text-gray-500 text-sm">Role</p>
              <p className="font-semibold">Admin</p>
            </div>
  
          </div>
        </div>
      </div>
    );
  }
  
  export default Profile;