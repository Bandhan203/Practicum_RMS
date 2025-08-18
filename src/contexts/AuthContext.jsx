import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext(undefined);

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
axios.defaults.withCredentials = true;

// Mock users for demonstration (will be replaced with real API)
const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@restaurant.com', role: 'admin' },
  { id: '2', name: 'Chef Mario', email: 'chef@restaurant.com', role: 'chef' },
  { id: '3', name: 'Waiter John', email: 'waiter@restaurant.com', role: 'waiter' },
  { id: '4', name: 'Customer Jane', email: 'customer@restaurant.com', role: 'customer', points: 250 },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check for token in cookies
      const token = Cookies.get('authToken');
      
      if (token) {
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to verify token with backend (mock for now)
        await verifyToken();
      } else {
        // Check localStorage for demo purposes
        const storedUser = localStorage.getItem('restaurant_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('restaurant_user');
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [clearAuthData, verifyToken]);

  const verifyToken = useCallback(async () => {
    try {
      // Mock API call - replace with real API
      const storedUser = localStorage.getItem('restaurant_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Call clearAuthData directly since it's defined below
      Cookies.remove('authToken');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null);
      localStorage.removeItem('restaurant_user');
      return false;
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Mock authentication - replace with real API call
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser && password === 'password') {
        // Mock token generation
        const mockToken = `mock_token_${foundUser.id}_${Date.now()}`;
        
        // Store token in cookie
        Cookies.set('authToken', mockToken, { expires: 7, secure: true, sameSite: 'strict' });
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        
        // Store user data
        setUser(foundUser);
        localStorage.setItem('restaurant_user', JSON.stringify(foundUser));
        
        return { success: true, user: foundUser };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      const { name, email, password, confirmPassword } = userData;
      
      if (!name || !email || !password) {
        throw new Error('Please fill in all required fields');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user (mock)
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        role: userData.role || 'customer',
        points: userData.role === 'customer' ? 0 : undefined,
        createdAt: new Date().toISOString()
      };

      // Mock token generation
      const mockToken = `mock_token_${newUser.id}_${Date.now()}`;
      
      // Store token in cookie
      Cookies.set('authToken', mockToken, { expires: 7, secure: true, sameSite: 'strict' });
      
      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
      
      // Store user data
      setUser(newUser);
      localStorage.setItem('restaurant_user', JSON.stringify(newUser));
      
      // Add to mock users array (for demo)
      mockUsers.push(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const clearAuthData = useCallback(() => {
    // Remove token from cookies
    Cookies.remove('authToken');
    
    // Remove axios header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user data
    setUser(null);
    setError(null);
    localStorage.removeItem('restaurant_user');
  }, []);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user logged in');
      }

      // Mock profile update
      const updatedUser = { ...user, ...profileData };
      
      setUser(updatedUser);
      localStorage.setItem('restaurant_user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (role) => {
    if (user) {
      const newUser = { ...user, role };
      setUser(newUser);
      localStorage.setItem('restaurant_user', JSON.stringify(newUser));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    switchRole,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
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
