import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  isSignedIn: boolean;
  user: User | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (email: string) => {
    const isAdmin = email === 'wildrabit001@gmail.com';
    // Extract name from email (part before @)
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    setUser({
      id: '1',
      name: name,
      email,
      isAdmin
    });
  };

  const signOut = () => {
    setUser(null);
  };

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