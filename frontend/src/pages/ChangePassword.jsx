import { useState } from "react";
import axios from "axios";

function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const hasLength = password.length >= 8;

  const score = [
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecial,
    hasLength,
  ].filter(Boolean).length;

  let strength = "Weak";

  if (score >= 4) {
    strength = "Strong";
  } else if (score >= 3) {
    strength = "Medium";
  }
  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5001/api/auth/change-password",
        {
          currentPassword,
          newPassword: password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Password updated successfully");

      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update password"
      );
    }
  };
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Change Password
      </h1>
      <input
        type="password"
        placeholder="Current Password"
        className="border p-2 w-full mb-3 rounded"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        className="border p-2 w-full mb-3 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="border p-2 w-full mb-4 rounded"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <p className="font-semibold mb-2">
        Password Strength: {strength}
      </p>

      <div className="w-full bg-gray-300 h-3 rounded mb-4">
        <div
          className={`h-3 rounded ${strength === "Weak"
              ? "bg-red-500 w-1/3"
              : strength === "Medium"
                ? "bg-yellow-500 w-2/3"
                : "bg-green-500 w-full"
            }`}
        ></div>
      </div>

      <div className="mb-4 text-sm">
        <p>{hasLength ? "✓" : "✗"} Minimum 8 characters</p>
        <p>{hasUpperCase ? "✓" : "✗"} Uppercase letter</p>
        <p>{hasLowerCase ? "✓" : "✗"} Lowercase letter</p>
        <p>{hasNumber ? "✓" : "✗"} Number</p>
        <p>{hasSpecial ? "✓" : "✗"} Special character</p>
      </div>

      {confirmPassword &&
        password !== confirmPassword && (
          <p className="text-red-500 mb-3">
            Passwords do not match
          </p>
        )}



      <button
        onClick={handleChangePassword}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Change Password
      </button>
    </div>
  );
}

export default ChangePassword;