import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

function OTP({ onClose, email, tenantName, tenantId }) {
  const [loader, setLoader] = useState(false);
  const [otp, setOTP] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes timer in seconds
  const [isExpired, setIsExpired] = useState(false);

  const navigate = useNavigate();

  // Timer logic to countdown every second
  useEffect(() => {
    if (timer <= 0) {
      setIsExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [timer]);

  // Format the timer to display minutes and seconds
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
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("tenantName", res.data.tenantName);
      toast.success("User Registered Successfully!!!");
      navigate("/Dashboard");
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Registration Failed, please try again");
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
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-[#3aabb7] text-4xl font-bold text-center mb-6">
          Verify OTP
        </h2>
        <form onSubmit={handleVerify}>
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Enter OTP
          </label>
          <input
            type="text"
            placeholder="Enter your one-time password"
            onChange={(e) => setOTP(e.target.value)}
            className="w-full"
            required
            disabled={isExpired} // Disable input when OTP expires
          />
          <div className="mt-2 text-center text-sm text-gray-500">
            {isExpired ? (
              <p>OTP Expired</p>
            ) : (
              <p>Time Left: {formatTime(timer)}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loader || isExpired}
            className="w-full bg-gradient-to-r from-[#48c4d3] to-[#3aabb7] hover: from-[#3aabb7] hover:to-[#48c4d3] text-white py-3 text-lg font-semibold mt-4 rounded-full shadow-md"
          >
            {loader ? "Please Wait..." : "Login"}
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
};

export default OTP;
