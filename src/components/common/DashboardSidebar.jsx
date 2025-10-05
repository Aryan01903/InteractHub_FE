import {
  IoHomeOutline,
  IoCreateOutline,
  IoVideocamOutline,
  IoMenuOutline,
} from "react-icons/io5";
import { PiUsersThree } from "react-icons/pi";
import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function DashboardSidebar({ headerHeight }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false); 
  };

  return (
    <>
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
        className={`lg:w-64 w-64 h-screen bg-white shadow-lg border-r-2 border-[#e2e2e2] 
        transform transition-transform duration-300 ease-in-out z-40
        fixed left-0 pt-[70px] lg:pt-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static`}
        style={{
          top: `${headerHeight}px`,
        }}
      >
        <div className="flex flex-col items-start p-6 space-y-8">
          {/* Sidebar Links */}
          <div className="w-full flex flex-col space-y-6 mt-8">
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
              onClick={() => handleNavigate("/video-conference")}
            />
            <SidebarLink
              icon={<PiUsersThree/>}
              label="Chat With Others"
              onClick={() => handleNavigate("/chat")}
            />
          </div>
        </div>
      </div>
    </>
  );
}

DashboardSidebar.propTypes = {
  headerHeight: PropTypes.number.isRequired,
};

function SidebarLink({ icon, label, onClick }) {
  return (
    <div
      className="flex items-center space-x-5 text-lg font-medium text-[#333333] 
      hover:bg-[#f1f1f1] hover:text-[#3AABB7] p-4 rounded-lg cursor-pointer 
      transition-all duration-200"
      onClick={onClick}
    >
      <div className="text-2xl">{icon}</div>
      <span>{label}</span>
    </div>
  );
}

SidebarLink.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};
