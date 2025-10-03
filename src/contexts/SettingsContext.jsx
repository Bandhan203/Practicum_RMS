import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    restaurant_name: 'Smart Dine',
    restaurant_phone: '+880 1234567890',
    restaurant_email: 'info@smartdine.com',
    restaurant_address: '123 Main Street, Dhaka, Bangladesh',
    currency: 'BDT (৳)',
    timezone: 'Asia/Dhaka',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    tax_rate: '15',
    service_charge: '10',
    theme: 'light',
    language: 'en'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings from backend
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      
      if (response.success) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      
      // Prepare settings for API
      const settingsToUpdate = {};
      Object.entries(newSettings).forEach(([key, value]) => {
        settingsToUpdate[key] = {
          value: value,
          type: typeof value === 'number' ? 'number' : 'string',
          category: getCategoryForKey(key)
        };
      });

      const response = await settingsAPI.updateBatch({ settings: settingsToUpdate });
      
      if (response.success) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...newSettings
        }));
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to update settings');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update single setting
  const updateSetting = async (key, value) => {
    try {
      const response = await settingsAPI.updateSingle(key, {
        value: value,
        type: typeof value === 'number' ? 'number' : 'string',
        category: getCategoryForKey(key)
      });
      
      if (response.success) {
        setSettings(prevSettings => ({
          ...prevSettings,
          [key]: value
        }));
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to update setting');
      }
    } catch (err) {
      console.error('Failed to update setting:', err);
      return { success: false, error: err.message };
    }
  };

  // Get category for setting key
  const getCategoryForKey = (key) => {
    if (key.startsWith('restaurant_')) return 'restaurant';
    if (['currency', 'timezone', 'date_format', 'time_format'].includes(key)) return 'regional';
    if (['tax_rate', 'service_charge'].includes(key)) return 'business';
    if (['theme', 'language'].includes(key)) return 'display';
    return 'general';
  };

  // Get setting value
  const getSetting = (key, defaultValue = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  // Initialize settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    settings,
    loading,
    error,
    updateSettings,
    updateSetting,
    getSetting,
    loadSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
