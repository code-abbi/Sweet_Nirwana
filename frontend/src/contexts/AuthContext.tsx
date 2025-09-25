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

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  /**
   * Sign in a user with email
   * 
   * @param {string} email - User's email address
   */
  const signIn = (email: string) => {
    // Check if user has admin privileges (specific email)
    const isAdmin = email === 'wildrabit001@gmail.com';
    
    // Extract display name from email (part before @)
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    
    // Set user state
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
    setUser(null);
  };

  // Provide authentication context to children
  return (
    <AuthContext.Provider value={{
      isSignedIn: !!user,
      user,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};