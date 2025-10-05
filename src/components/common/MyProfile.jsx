import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { FaUserCircle } from "react-icons/fa";
import PropTypes from "prop-types";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.user) {
          setProfile(response.data.user);
        } else {
          console.error("Invalid profile data structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#3aabb7] font-semibold text-lg">
        Loading Profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
        Failed to load profile.
      </div>
    );
  }

  const { name, email, tenantName, role, createdAt, tenantId } = profile;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center border-t-8 border-[#3aabb7]">
        <div className="flex justify-center mb-4">
          <FaUserCircle className="text-[100px] text-[#3aabb7]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">{name}</h1>
        <p className="text-gray-600 mb-6">{email}</p>

        <div className="space-y-3 text-left mb-6">
          <ProfileField label="Organization Name" value={tenantName} />
          <ProfileField label="Role" value={role} />
          <ProfileField
            label="Joined In"
            value={new Date(createdAt).toLocaleDateString()}
          />
          <ProfileField label="Organization ID" value={tenantId} />
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg text-white font-medium bg-[#3aabb7] hover:bg-[#349aa5] transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-800 break-all">{value || "N/A"}</span>
    </div>
  );
}

ProfileField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
