import React from "react";
import { FaBars } from "react-icons/fa";

const Navbar = ({ onLogout, toggleSidebar }) => {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 p-4 shadow-lg border-b border-emerald-500/20">
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="text-white focus:outline-none hover:bg-white/20 transition-all duration-200 p-3 rounded-xl backdrop-blur-sm"
      >
        <FaBars size={24} />
      </button>

      {/* Title - Hidden on small screens */}
      <h1 className="hidden md:block text-xl font-bold text-white">
        Dashboard
      </h1>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;