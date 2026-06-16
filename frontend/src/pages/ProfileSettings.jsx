import { useState, useEffect } from "react";
import axios from "axios";

function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  useEffect(() => {

    const savedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (savedUser) {
      setName(savedUser.name || "");
      setEmail(savedUser.email || "");
      setRole(savedUser.role || "");
    }

  }, []);
  const handleSaveProfile = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5001/api/users/profile",
        {
          name,
          email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert("Profile updated successfully");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to update profile"
      );

    }

  };
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Profile Settings
      </h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Enter your name"
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Phone Number
        </label>
        <input
          type="text"
          placeholder="Enter phone number"
          className="border p-2 w-full rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">
          Role
        </label>
        <input
          type="text"
          value={role}
          readOnly
          className="border p-2 w-full rounded bg-gray-100"
        />
      </div>

      <button
        onClick={handleSaveProfile}
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Save Changes
      </button>
    </div>
  );
}

export default ProfileSettings;