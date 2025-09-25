/**
 * Navigation Header Component
 * 
 * Provides the top navigation bar with:
 * - Brand logo and company information
 * - Shopping cart with item count badge
 * - User authentication controls (sign in/out)
 * - Admin panel access for authorized users
 * 
 * Features:
 * - Sticky positioning with backdrop blur effect
 * - Responsive design for mobile and desktop
 * - Gradient brand styling and animations
 * - Role-based UI (admin vs regular user)
 * - User profile dropdown with email and sign out
 */

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCartIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

/**
 * Props interface for Navigation component
 * Contains all the necessary data and event handlers
 */
interface NavigationProps {
  isSignedIn: boolean;      // Current user authentication status
  isAdmin: boolean;         // Whether current user has admin privileges  
  userEmail?: string;       // User's email address for display
  userName?: string;        // User's name for display
  totalItems: number;       // Number of items in shopping cart
  onCartToggle: () => void; // Handler to open/close cart sidebar
  onSignOut: () => void;    // Handler for user logout
  onSignIn: () => void;     // Handler to open sign-in modal
  onAdminPanel?: () => void; // Optional handler for admin panel access
}

/**
 * Navigation Component
 * 
 * Renders the top navigation bar with responsive design
 * Adapts UI based on user authentication and admin status
 */
export const Navigation: React.FC<NavigationProps> = ({
  isSignedIn,
  isAdmin,
  userEmail,
  userName,
  totalItems,
  onCartToggle,
  onSignOut,
  onSignIn,
  onAdminPanel,
}) => {
  // State for user profile dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user initial for the circle
  const getUserInitial = (email?: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    onSignOut();
  };
  return (
    <nav className="bg-brand-bg-light/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              {/* Logo Icon */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-palace rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">🏰</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">👑</span>
                </div>
              </div>
              
              {/* Brand Text */}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-palace to-brand-orange bg-clip-text text-transparent">
                  Sweet Nirvana
                </h1>
                <p className="text-xs text-brand-palace/70 font-medium">
                  Traditional Indian Sweets Since 1947
                </p>
              </div>


            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onCartToggle}
              className="relative p-2 text-brand-palace/70 hover:text-brand-palace transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                {/* Welcome Message between Cart and User Circle */}
                {userName && (
                  <div className="hidden md:block">
                    <p className="text-brand-palace font-medium">
                      Welcome, <span className="font-semibold">{userName.split(' ')[0]}</span>!
                    </p>
                  </div>
                )}
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  {/* User Profile Button */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-1 rounded-full hover:bg-brand-palace/10 transition-colors"
                  >
                    {/* User Initial Circle */}
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-brand-palace rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                      <span className="text-white text-sm font-bold">
                        {getUserInitial(userEmail)}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-palace rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-lg font-bold">
                              {getUserInitial(userEmail)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {userName || 'User'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sign Out Button */}
                      <div className="px-2 py-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Panel Button - After user circle */}
                {isAdmin && onAdminPanel && (
                  <button
                    onClick={onAdminPanel}
                    className="hidden md:flex items-center text-sm font-semibold bg-brand-palace/10 text-brand-palace px-3 py-2 rounded-full hover:bg-brand-palace/20 transition-colors"
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={onSignIn}
                className="bg-brand-orange hover:bg-brand-orange-light text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};