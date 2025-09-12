import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import EmailModal from "./emailModal";
import OTP from "../otpModal";
import ResetPasswordModal from "./resetPasswordModal";

import "react-toastify/dist/ReactToastify.css";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [loader, setLoader] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);

  // flow management
  const [flow, setFlow] = useState(null); // "login" | "forgotpassword"
  const [step, setStep] = useState(null); // "email" | "otp" | "reset"
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();

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

    setLoader(true);
    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (!res.data?.token) {
        toast.error("Something went wrong. Please try again later!");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("tenantName", res.data.tenantName);
      localStorage.setItem("tenantId", res.data.tenantId);

      toast.success("Login Successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("error is : ", err);
      toast.error(
        err.response?.data?.message ||
          "Invalid Credentials or User doesn't exist"
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f7fa] to-[#ffffff]">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg relative">
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
          Login
        </h2>
        {/* Email/Password Login Form */}
        <form onSubmit={handleLogin}>
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
          />

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

          <button
            type="submit"
            disabled={loader}
            className="w-full bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] hover:from-[#3aabb7] hover:to-[#48c4D3] text-white py-3 rounded-full text-lg font-semibold mt-4 shadow-md"
          >
            {loader ? "Please wait..." : "Login"}
          </button>
        </form>

        {/* Extra Options */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              setFlow("login");
              setStep("email");
            }}
            className="text-[#3aabb7] hover:underline text-sm font-semibold"
          >
            Login with OTP
          </button>
          <button
            onClick={() => {
              setFlow("forgotpassword");
              setStep("email");
            }}
            className="text-[#3aabb7] hover:underline text-sm font-semibold"
          >
            Forgot Password?
          </button>
        </div>
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
      

      {/* Modals */}
      {flow && step === "email" && (
        <EmailModal
          type={flow}
          onClose={() => setStep(null)}
          onSuccess={(enteredEmail) => {
            setUserEmail(enteredEmail);
            setStep("otp");
          }}
        />
      )}

      {flow && step === "otp" && (
        <OTP
          type={flow}
          email={userEmail}
          onClose={(status) => {
            if (status === "verified" && flow === "forgotpassword") {
              setStep("reset");
            } else {
              setStep(null);
              setFlow(null);
            }
          }}
        />
      )}

      {flow === "forgotpassword" && step === "reset" && (
        <ResetPasswordModal
          email={userEmail}
          onClose={() => {
            setStep(null);
            setFlow(null);
          }}
        />
      )}

      <ToastContainer />
    </div>
  );
}
