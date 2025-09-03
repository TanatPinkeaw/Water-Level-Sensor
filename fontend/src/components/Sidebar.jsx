import React from "react";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { TfiDashboard } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, toggleSidebar, onLogout }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
    toggleSidebar();
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    toggleSidebar();
  };

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-500 opacity-25 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-sm border-r border-emerald-100 transition-transform duration-300 shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          zIndex: 50,
          width: "320px",
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaUser size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Dashboard</h2>
                <p className="text-emerald-100 text-sm">Navigation Menu</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="text-white hover:bg-white/20 transition-colors p-2 rounded-lg"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col space-y-2 p-6">
          <div
            onClick={handleProfileClick}
            className="flex items-center space-x-4 cursor-pointer hover:bg-emerald-50 p-4 rounded-xl transition-all duration-200 group"
            title="Profile"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <FaUser size={18} className="text-emerald-600" />
            </div>
            <span className="text-gray-700 font-medium group-hover:text-emerald-700">
              Profile & Settings
            </span>
          </div>

          <div
            onClick={handleDashboardClick}
            className="flex items-center space-x-4 cursor-pointer hover:bg-emerald-50 p-4 rounded-xl transition-all duration-200 group"
            title="Dashboard"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <TfiDashboard size={18} className="text-emerald-600" />
            </div>
            <span className="text-gray-700 font-medium group-hover:text-emerald-700">
              Dashboard
            </span>
          </div>

          <div
            className="flex items-center space-x-4 cursor-pointer hover:bg-red-50 p-4 rounded-xl transition-all duration-200 group"
            title="Logout"
            onClick={onLogout}
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <FaSignOutAlt size={18} className="text-red-600" />
            </div>
            <span className="text-gray-700 font-medium group-hover:text-red-700">
              Logout
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-emerald-100">
          <div className="text-center text-sm text-gray-500">
            <p>Sensor Dashboard v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
