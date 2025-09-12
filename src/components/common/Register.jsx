import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import OTP from "./otpModal";

import "react-toastify/dist/ReactToastify.css";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const [loader, setLoader] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpModal, setOtpModal] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      toast.error("All fields are required!");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters, include one uppercase, one number, and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (role === "admin" && !tenantName) {
      toast.error("Tenant name is required for Admin!");
      return;
    }

    if (role === "member" && !tenantId) {
      toast.error("Tenant ID is required for Member!");
      return;
    }

    setLoader(true);
    try {
      await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
        role,
        tenantName: role === "admin" ? tenantName : undefined,
        tenantId: role === "member" ? tenantId : undefined,
      });

      toast.success("OTP sent to your email!");
      setOtpModal(true);
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9ff] to-[#ffffff]">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg relative mt-10 mb-10">
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[#3aabb7] font-semibold text-lg hover:text-[#48c4d3]"
          >
            &lt; Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-[#3aabb7] font-semibold text-lg hover:text-[#48c4d3]"
          >
            &lt; Go to Home
          </button>
        </div>
        <h2 className="text-[#3aabb7] text-4xl font-bold text-center mb-6">
          Register
        </h2>

        <form onSubmit={handleRegister}>
          {/* Name */}
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded-xl border bg-gray-50"
          />

          {/* Email */}
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded-xl border bg-gray-50"
          />

          {/* Role */}
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded-xl border bg-gray-50"
          >
            <option value="" disabled>Select Role</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          {/* Tenant Info */}
          {role === "admin" && (
            <>
              <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                Tenant Name
              </label>
              <input
                type="text"
                placeholder="Enter tenant name"
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-xl border bg-gray-50"
              />
            </>
          )}

          {role === "member" && (
            <>
              <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                Tenant ID
              </label>
              <input
                type="text"
                placeholder="Enter tenant ID"
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-xl border bg-gray-50"
              />
            </>
          )}

          {/* Password */}
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Password
          </label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border bg-gray-50"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Confirm Password
          </label>
          <div className="relative mb-6">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border bg-gray-50"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loader}
            className="w-full bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] hover:from-[#3aabb7] hover:to-[#48c4D3] text-white py-3 rounded-full text-lg font-semibold mt-2 shadow-md"
          >
            {loader ? "Please wait..." : "Register"}
          </button>
        </form>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
          <p>
            Already a user?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[#3aabb7] font-semibold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
          <p>
            Have an invitation?{" "}
            <span
              onClick={() => navigate("/accept-invite")}
              className="text-[#3aabb7] font-semibold cursor-pointer hover:underline"
            >
              Accept here
            </span>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModal && (
        <OTP
          type="register"
          email={email}
          tenantName={tenantName}
          tenantId={tenantId}
          name={name}
          password={password}
          onClose={(status) => {
            setOtpModal(false);
            if (status === "verified") {
              toast.success("Registration successful!");
              navigate("/dashboard");
            }
          }}
        />
      )}


      <ToastContainer />
    </div>
  );
}

export default RegisterPage;
