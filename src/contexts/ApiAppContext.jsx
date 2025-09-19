import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// Create the context
export const ApiAppContext = createContext();

// API base configuration
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// API Provider Component
export const ApiAppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API methods
  const apiMethods = {
    get: async (endpoint, config = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(endpoint, config);
        return response.data;
      } catch (err) {
        setError(err.message || 'An error occurred');
        console.error('API GET Error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },

    post: async (endpoint, data = {}, config = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post(endpoint, data, config);
        return response.data;
      } catch (err) {
        setError(err.message || 'An error occurred');
        console.error('API POST Error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },

    put: async (endpoint, data = {}, config = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.put(endpoint, data, config);
        return response.data;
      } catch (err) {
        setError(err.message || 'An error occurred');
        console.error('API PUT Error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },

    delete: async (endpoint, config = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.delete(endpoint, config);
        return response.data;
      } catch (err) {
        setError(err.message || 'An error occurred');
        console.error('API DELETE Error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  const contextValue = {
    api: apiMethods,
    loading,
    error,
    setError,
    baseURL: API_BASE_URL
  };

  return (
    <ApiAppContext.Provider value={contextValue}>
      {children}
    </ApiAppContext.Provider>
  );
};

// Custom hook to use the API context
export const useApiApp = () => {
  const context = useContext(ApiAppContext);
  if (!context) {
    throw new Error('useApiApp must be used within an ApiAppProvider');
  }
  return context;
};