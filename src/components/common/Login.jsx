import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";
import PropTypes from 'prop-types';


const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginModal({ onClose }) {
  const [loader, setLoader] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  LoginModal.propTypes = {
    onClose: PropTypes.func.isRequired,
  };


  const handleLogin = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters, include 1 uppercase, 1 number, and 1 special character!"
      );
      return;
    }

    setLoader(true);
    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (!res.data?.accessToken) {
        toast.error("No token received. Something went wrong!");
        return;
      }

      localStorage.setItem("token", res.data.accessToken);
      toast.success("Login Successful");
      onClose();
    } catch (err) {
        console.error("error is : ",err)
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-gray-800">
          &times;
        </button>

        <h2 className="text-[#3aabb7] text-4xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin}>
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
          />

          <label className="block text-[#3aabb7] text-lg font-bold mb-1">Password</label>
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

          <button
            type="submit"
            disabled={loader}
            className="w-full bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] hover:from-[#3aabb7] hover:to-[#48c4D3] text-white py-3 rounded-full text-lg font-semibold mt-4 shadow-md"
          >
            {loader ? "Please wait..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
