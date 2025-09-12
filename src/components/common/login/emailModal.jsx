import { useState } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../api/axios";
import { toast } from "react-toastify";

function EmailModal({ type, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email!");
      return;
    }

    setLoading(true);
    try {
      if (type === "login") {
        await axiosInstance.post("/auth/generate-otp", { email });
        toast.success("OTP sent for login");
      } else if (type === "forgotpassword") {
        await axiosInstance.post("/auth/forgot-password", { email });
        toast.success("OTP sent for password reset");
      }

      if (onSuccess) onSuccess(email); // pass email to parent
    } catch (err) {
      console.error("EmailModal error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-[#3aabb7] text-2xl font-bold text-center mb-6">
          {type === "login" ? "Login with OTP" : "Forgot Password"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-[#3aabb7] text-lg font-bold mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your registered email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border bg-gray-50 mb-4"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] text-white py-3 rounded-full text-lg font-semibold mt-2 shadow-md"
          >
            {loading ? "Please wait..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

EmailModal.propTypes = {
  type: PropTypes.oneOf(["login", "forgotpassword"]).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default EmailModal;
