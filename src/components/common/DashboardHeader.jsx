import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("tenantName");
    localStorage.removeItem("tenantId");
    navigate("/");
  };

  return (
    <div className="w-full h-20 grid grid-cols-[auto,1fr,auto] items-center bg-white px-6 shadow-lg border-b-2 border-gray-300 relative">
      {/* Hamburger menu space placeholder for mobile */}
      <div className="lg:hidden w-12 flex-shrink-0" />

      {/* Logo */}
      <div className="text-center lg:text-left">
        <div className="text-3xl lg:text-4xl font-extrabold text-[#3AABB7] hover:text-[#2d9eab] transition-colors duration-300 ease-in-out cursor-pointer ml-16">
          InteractHub
        </div>
      </div>

      {/* Logout Button */}
      <button
        className="text-4xl text-[#3AABB7] hover:text-red-600 transition-colors duration-300 ease-in-out transform hover:scale-110 w-12 lg:w-auto lg:ml-auto lg:mr-6"
        onClick={handleLogout}
      >
        <IoLogOutOutline title="Logout" />
      </button>
    </div>
  );
}