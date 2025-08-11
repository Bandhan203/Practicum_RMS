import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: User['role']) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@restaurant.com', role: 'admin' },
  { id: '2', name: 'Chef Mario', email: 'chef@restaurant.com', role: 'chef' },
  { id: '3', name: 'Waiter John', email: 'waiter@restaurant.com', role: 'waiter' },
  { id: '4', name: 'Customer Jane', email: 'customer@restaurant.com', role: 'customer', points: 250 },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('restaurant_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('restaurant_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('restaurant_user');
  };

  const switchRole = (role: User['role']) => {
    if (user) {
      const newUser = { ...user, role };
      setUser(newUser);
      localStorage.setItem('restaurant_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      switchRole,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}