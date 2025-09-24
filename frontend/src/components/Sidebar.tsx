import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  CakeIcon,
  ArchiveBoxIcon,
  UserIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { state } = useAuth();
  const isAdmin = state.user?.role === 'admin';

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Sweets',
      href: '/sweets',
      icon: CakeIcon,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: ArchiveBoxIcon,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
    },
  ];

  if (isAdmin) {
    navItems.push({
      name: 'Admin',
      href: '/admin',
      icon: CogIcon,
    });
  }

  return (
    <div className="fixed left-0 top-16 w-64 h-full bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Sweet Shop Pro v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;