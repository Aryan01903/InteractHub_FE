import { useState, useEffect } from "react";
import { IoLogOutOutline, IoPersonCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function DashboardHeader() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res?.status === 200) {
          setProfile(res?.data);
        }
      } catch (error) {
        console.log("Error fetching profile data:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("tenantName");
    localStorage.removeItem("tenantId");
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/my-profile", { state: { profile } });
  };

  return (
    <div className="w-full h-16 md:h-20 flex items-center justify-between bg-white px-4 sm:px-6 md:px-8 lg:px-12 shadow-lg border-b-2 border-gray-200 relative">
      <div className="hidden md:flex md:items-center md:flex-1">
        <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#3AABB7] hover:text-[#2d9eab] transition-colors duration-300 ease-in-out cursor-pointer">
          InteractHub
        </div>
      </div>

      <div className="flex md:hidden justify-center flex-1">
        <div className="text-2xl font-extrabold text-[#3AABB7] hover:text-[#2d9eab] transition-colors duration-300 ease-in-out cursor-pointer">
          InteractHub
        </div>
      </div>

      <div className="flex items-center space-x-8 sm:space-x-10 md:space-x-12">
        <button
          className="text-3xl sm:text-4xl text-[#3AABB7] hover:text-[#2d9eab] transition-colors duration-300 ease-in-out transform hover:scale-110 focus:outline-none"
          onClick={handleProfileClick}
          title="View Profile"
        >
          <IoPersonCircleSharp />
        </button>
        <button
          className="text-3xl sm:text-4xl text-[#3AABB7] hover:text-red-600 transition-colors duration-300 ease-in-out transform hover:scale-110 focus:outline-none"
          onClick={handleLogout}
          title="Logout"
        >
          <IoLogOutOutline />
        </button>
      </div>
    </div>
  );
}