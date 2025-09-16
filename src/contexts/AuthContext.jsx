import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';

// Create the context
const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
axios.defaults.withCredentials = false;



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const verifyToken = useCallback(async () => {
    try {
      // Call Laravel backend to verify token
      const response = await authAPI.me();
      if (response) {
        setUser(response);
        localStorage.setItem('restaurant_user', JSON.stringify(response));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear auth data if token is invalid
      clearAuthData();
      return false;
    }
  }, [clearAuthData]);

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check for token in cookies
      const token = Cookies.get('authToken');
      
      if (token) {
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to verify token with backend
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

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);



  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Call Laravel backend API
      const response = await authAPI.login({ email, password });
      
      if (response.token && response.user) {
        // Store token in cookie
        Cookies.set('authToken', response.token, { expires: 7, secure: false, sameSite: 'lax' });
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        
        // Store user data
        setUser(response.user);
        localStorage.setItem('restaurant_user', JSON.stringify(response.user));
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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

      // Call Laravel backend API
      const response = await authAPI.signup(userData);
      
      if (response.token && response.user) {
        // Store token in cookie
        Cookies.set('authToken', response.token, { expires: 7, secure: false, sameSite: 'lax' });
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        
        // Store user data
        setUser(response.user);
        localStorage.setItem('restaurant_user', JSON.stringify(response.user));
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      let errorMessage = 'Signup failed';
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call Laravel backend logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

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
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
