import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "react-toastify/dist/ReactToastify.css";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]{8,}$/;

function AcceptInvitePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inviteToken = params.get("token");
    if (inviteToken) {
      setToken(inviteToken);
    }
  }, [location]);

  const handleAcceptInvite = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !token) {
      toast.error("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters, include one uppercase, one number, and one special character."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/accept-invite", {
        name,
        email,
        password,
        token,
      });

      toast.success("Invite accepted successfully!");
      localStorage.setItem("token", res.data?.user?.token || "");
      localStorage.setItem("role", res.data?.user?.role || "");
      localStorage.setItem("name", res.data?.user?.name || "");
      localStorage.setItem("tenantName", res.data?.user?.tenantName || "");
      localStorage.setItem("tenantId", res.data?.user?.tenantId || "");

      navigate("/dashboard");
    } catch (err) {
      console.error("AcceptInvite error:", err);
      toast.error(err.response?.data?.message || "Failed to accept invite");
    } finally {
      setLoading(false);
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
        <h2 className="text-[#3aabb7] text-3xl font-bold text-center mb-6">
          Accept Invitation
        </h2>

        <form onSubmit={handleAcceptInvite}>
          {/* Full Name */}
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded-xl border bg-gray-50"
            required
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
            required
          />

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
              required
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
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer text-gray-500"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Invite Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e)=> setToken(e.target.value)}
            placeholder="Enter Invitation Token"
            className="w-full mb-6 px-4 py-2 rounded-xl border bg-gray-100"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] text-white py-3 rounded-full text-lg font-semibold mt-2 shadow-md"
          >
            {loading ? "Please wait..." : "Accept Invite"}
          </button>
        </form>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
            <p>
                Don&apos;t have an account?{" "}
                <span
                    onClick={() => navigate("/register")}
                    className="text-[#3aabb7] font-semibold cursor-pointer hover:underline"
                >
                    Register
                </span>
            </p>
            <p>
                Already a user?{" "}
                <span
                    onClick={() => navigate("/login")}
                    className="text-[#3aabb7] font-semibold cursor-pointer hover:underline"
                >
                    Login
                </span>
            </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AcceptInvitePage;
