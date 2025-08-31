import { IoHomeOutline, IoCreateOutline, IoVideocamOutline, IoInformationCircleOutline, IoMenuOutline } from "react-icons/io5";
import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function DashboardSidebar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-[#3AABB7] text-white rounded-md shadow-lg"
        >
          <IoMenuOutline className="text-2xl" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`lg:w-64 w-64 h-screen bg-white text-white-800 shadow-lg border-r-2 border-[#e2e2e2] fixed lg:relative transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-all duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col items-start p-6 space-y-6">
          {/* Sidebar Links */}
          <div className="w-full flex flex-col space-y-4">
            <SidebarLink
              icon={<IoHomeOutline />}
              label="Dashboard"
              onClick={() => handleNavigate("/dashboard")}
            />
            <SidebarLink
              icon={<IoCreateOutline />}
              label="WhiteBoard"
              onClick={() => handleNavigate("/whiteboard")}
            />
            <SidebarLink 
              icon={<IoVideocamOutline />}
              label="Video Interaction"
              onClick={()=> handleNavigate("/video-call")}  
            />
            <SidebarLink icon={<IoInformationCircleOutline />} label="About InteractHub" />
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarLink({ icon, label, onClick }) {
  return (
    <div
      className="flex items-center space-x-4 text-xl font-medium text-[#333333] hover:bg-[#f1f1f1] hover:text-[#3AABB7] p-3 rounded-md cursor-pointer transition-all duration-200 mt-20"
      onClick={onClick} // Handle click here
    >
      <div className="text-2xl">{icon}</div>
      <span>{label}</span>
    </div>
  );
}

// PropTypes validation
SidebarLink.propTypes = {
  icon: PropTypes.element.isRequired, // Icon should be a React element
  label: PropTypes.string.isRequired, // Label should be a string
  onClick: PropTypes.func.isRequired, // Click handler
};
