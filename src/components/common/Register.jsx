import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import OTP from "./otpModal";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterModal({ onClose }) {
  const [registeredData, setRegisteredData] = useState({});
  const [showOTP, setShowOTP] = useState(false);
  const [loader, setLoader] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  const [confirmTogglePassword, setConfirmTogglePassword] = useState(false);

  RegisterModal.propTypes = {
    onClose: PropTypes.func.isRequired,
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters, include one uppercase, one number, and one special character($&@#_-+%^*!)."
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords are not matching");
      return;
    }

    setLoader(true);
    try {
      const res = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
        tenantName,
        tenantId,
        role,
      });

      if (res.status === 200) {
        toast.success("OTP Sent Successfully!!!");
        setRegisteredData({ email, tenantName, tenantId });
        setShowOTP(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {showOTP ? (
        <OTP
          onClose={() => setShowOTP(false)}
          email={registeredData.email}
          tenantName={registeredData.tenantName}
          tenantId={registeredData.tenantId}
        />
      ) : (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={()=>onClose()}
              className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-gray-600"
            >
              &times;
            </button>

            <h2 className="text-[#3aabb7] text-4xl font-bold text-center mb-6">
              Register
            </h2>
            <form onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Input */}
                <div className="col-span-1">
                  <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mb-4 px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                  />
                </div>

                {/* Email Input */}
                <div className="col-span-1">
                  <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                  />
                </div>

                {/* Role Selection */}
                <div className="col-span-1">
                  <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                    Role
                  </label>
                  <select
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full mb-4 px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>

                {/* Tenant Name Input for Admin */}
                {role === "admin" && (
                  <div className="col-span-1">
                    <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                      Tenant Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tenant name"
                      onChange={(e) => setTenantName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                    />
                    <p className="text-xs"><span className="text-red-600">*</span>{" "}take something unique</p>
                  </div>
                )}

                {/* Tenant ID Input for Member */}
                {role === "member" && (
                  <div className="col-span-1">
                    <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                      Tenant ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tenant ID"
                      onChange={(e) => setTenantId(e.target.value)}
                      className="w-full mb-4 px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                    />
                  </div>
                )}

                {/* Password Input */}
                <div className="col-span-1">
                  <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                    Password
                  </label>
                  <div className="relative mb-4">
                    <input
                      type={togglePassword ? "text" : "password"}
                      placeholder="Enter your password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer text-gray-500"
                      onClick={() => setTogglePassword(!togglePassword)}
                    >
                      {togglePassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="col-span-1">
                  <label className="block text-[#3aabb7] text-lg font-bold mb-1">
                    Confirm Password
                  </label>
                  <div className="relative mb-4">
                    <input
                      type={confirmTogglePassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer text-gray-500"
                      onClick={() =>
                        setConfirmTogglePassword(!confirmTogglePassword)
                      }
                    >
                      {confirmTogglePassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs mb-1">
                <span className="text-red-500">*</span> Use at least 8 characters,
                one uppercase, one lowercase, one number, and one special
                character($&@#_-+%^*!)
              </p>

              <button
                type="submit"
                disabled={loader}
                className="w-full bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] hover:from-[#3aabb7] hover:to-[#48c4D3] text-white py-3 rounded-full text-lg font-semibold mt-4 shadow-md"
              >
                {loader ? "Please wait..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default RegisterModal;
