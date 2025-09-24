import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BellIcon, UserIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { state, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold sweet-gradient bg-clip-text text-transparent">
              Sweet Shop Pro
            </h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
                <UserIcon className="w-6 h-6" />
                <span className="text-sm font-medium">{state.user?.full_name}</span>
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                    <div className="font-medium">{state.user?.full_name}</div>
                    <div className="text-xs text-gray-500">{state.user?.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{state.user?.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;