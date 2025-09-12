import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

function OTP({ onClose, email, tenantName, tenantId, type }) {
  const [loader, setLoader] = useState(false);
  const [otp, setOTP] = useState("");
  const [timer, setTimer] = useState(300); // 5 min
  const [isExpired, setIsExpired] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
        tenantName,
        tenantId,
        type,
      });

      if (type === "login" || type === "register") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("tenantName", res.data.tenantName);
        localStorage.setItem("tenantId", res.data.tenantId);
        toast.success("User Verification Successful!");
        navigate("/dashboard");
        if (onClose) onClose();
      } else if (type === "forgotpassword") {
        toast.success("OTP Verified! Please reset your password.");
        if (onClose) onClose("verified");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "OTP Verification Failed");
    } finally {
      setLoader(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-gray-800"
          onClick={() => onClose()}
        >
          &times;
        </button>

        <h2 className="text-[#3aabb7] text-4xl font-bold text-center mb-6">
          {type === "forgot" ? "Verify OTP (Forgot Password)" : "Verify OTP"}
        </h2>

        <form onSubmit={handleVerify}>
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Enter OTP
          </label>
          <input
            type="text"
            placeholder="Enter your one-time password"
            onChange={(e) => setOTP(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border bg-gray-50"
            required
            disabled={isExpired}
          />
          <div className="mt-2 text-center text-sm text-gray-500">
            {isExpired ? <p>OTP Expired</p> : <p>Time Left: {formatTime(timer)}</p>}
          </div>

          <button
            type="submit"
            disabled={loader || isExpired}
            className="w-full bg-gradient-to-r from-[#48c4d3] to-[#3aabb7] text-white py-3 text-lg font-semibold mt-4 rounded-full shadow-md"
          >
            {loader ? "Please Wait..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

OTP.propTypes = {
  onClose: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  tenantName: PropTypes.string,
  tenantId: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(["login", "register", "forgotpassword"]).isRequired,
};

export default OTP;
