// frontend/src/components/Navigation.tsx
import React from 'react';
import { ShoppingCartIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface NavigationProps {
  isSignedIn: boolean;
  isAdmin: boolean;
  totalItems: number;
  onCartToggle: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  onAdminPanel?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isSignedIn,
  isAdmin,
  totalItems,
  onCartToggle,
  onSignOut,
  onSignIn,
  onAdminPanel,
}) => {
  return (
    <nav className="bg-brand-bg-light/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
             <img src="/favicon.ico" alt="Mithai Palace logo" className="h-8 w-auto" />
            <div className="ml-3">
                <h1 className="text-xl font-bold text-brand-palace">Mithai Palace</h1>
                <p className="text-xs text-brand-palace/70">Traditional Indian Sweets</p>
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
                {isAdmin && onAdminPanel && (
                  <button
                    onClick={onAdminPanel}
                    className="text-sm font-semibold bg-brand-palace/10 text-brand-palace px-3 py-1 rounded-full hover:bg-brand-palace/20 transition-colors"
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={onSignOut}
                  className="flex items-center text-sm text-brand-palace/70 hover:text-brand-palace transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-1" />
                  Sign Out
                </button>
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