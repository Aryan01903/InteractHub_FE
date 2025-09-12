import { useState } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../api/axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]{8,}$/;

function ResetPasswordModal({ email, onClose }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be 8+ characters, include one uppercase, one number, and one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        email,
        newPassword,
      });
      toast.success("Password reset successfully!");
      onClose();
    } catch (err) {
      console.error("ResetPasswordModal error:", err);
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-[#3aabb7] text-2xl font-bold text-center mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleReset}>
          {/* New Password */}
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            New Password
          </label>
          <div className="relative mb-4">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border bg-gray-50"
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer text-gray-500"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Confirm Password
          </label>
          <div className="relative mb-6">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border bg-gray-50"
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] text-white py-3 rounded-full text-lg font-semibold mt-2 shadow-md"
          >
            {loading ? "Please wait..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

ResetPasswordModal.propTypes = {
  email: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ResetPasswordModal;
