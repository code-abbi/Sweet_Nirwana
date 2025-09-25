/**
 * Sweet Nirvana - Authentication Context
 * 
 * This context provides authentication state and functions throughout
 * the application. It manages user sign-in/sign-out and determines
 * admin privileges.
 * 
 * Features:
 * - User authentication state management
 * - Admin privilege detection
 * - Email-based sign-in simulation
 * - Global authentication context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * User interface for authenticated users
 */
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Authentication context type definition
 */
interface AuthContextType {
  isSignedIn: boolean;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Custom hook to access authentication context
 * 
 * @throws {Error} When used outside AuthProvider
 * @returns {AuthContextType} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and functions to all child components.
 * Manages user sign-in/sign-out and admin privilege detection.
 * 
 * @param {ReactNode} children - Child components to wrap with auth context
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('sweet_shop_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Force refresh if old data format (no proper name)
        if (parsedUser.email && parsedUser.name && parsedUser.name.includes('abhi2018')) {
          console.log('Clearing old user data format');
          localStorage.removeItem('sweet_shop_user');
          setUser(null);
        } else {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
      localStorage.removeItem('sweet_shop_user'); // Clear corrupted data
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (!isLoading) {
      try {
        if (user) {
          localStorage.setItem('sweet_shop_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('sweet_shop_user');
        }
      } catch (error) {
        console.error('Failed to save user to localStorage:', error);
      }
    }
  }, [user, isLoading]);

  /**
   * Sign in a user with email
   * 
   * @param {string} email - User's email address
   */
  const signIn = (email: string) => {
    // Check if user has admin privileges (specific email)
    const isAdmin = email === 'wildrabit001@gmail.com';
    
    // Map of known Google accounts with their proper names
    const knownAccounts: { [key: string]: string } = {
      'tomar.abhi2018@gmail.com': 'Abbi Tomar',
      'abittomar001@gmail.com': 'Abi tomar', 
      'wildrabit001@gmail.com': 'wild raBit',
      'atomar003.mca2023@cca.nittr.ac.in': 'Abhishek Tomar',
      'lto3.fake@gmail.com': 'one last'
    };
    
    // Use proper name if known, otherwise extract from email
    const name = knownAccounts[email] || email.split('@')[0].replace(/[._]/g, ' ');
    
    // Set user state (this will trigger localStorage save)
    setUser({
      id: '1',
      name: name,
      email,
      isAdmin
    });
  };

  /**
   * Sign out the current user
   */
  const signOut = () => {
    setUser(null); // This will trigger localStorage removal
  };

  // Show loading screen while checking for saved user
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-orange border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Sweet Nirvana...</p>
        </div>
      </div>
    );
  }

  // Provide authentication context to children
  return (
    <AuthContext.Provider value={{
      isSignedIn: !!user,
      user,
      isLoading,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};