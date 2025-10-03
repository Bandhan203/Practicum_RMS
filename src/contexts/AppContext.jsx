import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, subDays, subHours } from 'date-fns';
import { menuAPI, inventoryAPI } from '../services/api';
import settingsAPI from '../services/settingsAPI';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Mock Orders Data
const mockOrders = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    items: [
      { name: 'Chicken Burger', price: 12.99, quantity: 2 },
      { name: 'French Fries', price: 4.99, quantity: 1 },
      { name: 'Coca Cola', price: 2.99, quantity: 2 }
    ],
    total: 33.96,
    status: 'preparing',
    orderTime: format(new Date(), 'HH:mm'),
    estimatedTime: 15,
    tableNumber: 'T-05',
    paymentStatus: 'paid',
    paymentMethod: 'card'
  },
  {
    id: 'ORD-002',
    customerName: 'Sarah Wilson',
    items: [
      { name: 'Caesar Salad', price: 8.99, quantity: 1 },
      { name: 'Grilled Salmon', price: 18.99, quantity: 1 },
      { name: 'Iced Tea', price: 3.49, quantity: 1 }
    ],
    total: 31.47,
    status: 'completed',
    orderTime: format(subHours(new Date(), 1), 'HH:mm'),
    estimatedTime: 20,
    tableNumber: 'T-08',
    paymentStatus: 'paid',
    paymentMethod: 'cash'
  }
];

// Mock Menu Items
const mockMenuItems = [
  {
    id: 1,
    name: 'Chicken Burger',
    category: 'Burgers',
    price: 12.99,
    description: 'Grilled chicken breast with lettuce, tomato, and mayo',
    image: '/api/placeholder/300/200',
    available: true,
    ingredients: ['chicken', 'bun', 'lettuce', 'tomato', 'mayo'],
    allergens: ['gluten'],
    preparationTime: 12
  },
  {
    id: 2,
    name: 'Caesar Salad',
    category: 'Salads',
    price: 8.99,
    description: 'Fresh romaine lettuce with caesar dressing and croutons',
    image: '/api/placeholder/300/200',
    available: true,
    ingredients: ['lettuce', 'dressing', 'croutons', 'parmesan'],
    allergens: ['dairy'],
    preparationTime: 8
  }
];

// Simplified Analytics (no waste data)
const mockAnalytics = {
  totalRevenue: 15420.50,
  totalOrders: 127,
  avgOrderValue: 25.30,
  totalCustomers: 89,
  revenueTrend: [
    { date: format(subDays(new Date(), 6), 'MM/dd'), value: 1200 },
    { date: format(subDays(new Date(), 5), 'MM/dd'), value: 1450 },
    { date: format(subDays(new Date(), 4), 'MM/dd'), value: 1320 },
    { date: format(subDays(new Date(), 3), 'MM/dd'), value: 1680 },
    { date: format(subDays(new Date(), 2), 'MM/dd'), value: 1890 },
    { date: format(subDays(new Date(), 1), 'MM/dd'), value: 2100 },
    { date: format(new Date(), 'MM/dd'), value: 2250 }
  ],
  ordersTrend: [
    { date: format(subDays(new Date(), 6), 'MM/dd'), value: 48 },
    { date: format(subDays(new Date(), 5), 'MM/dd'), value: 52 },
    { date: format(subDays(new Date(), 4), 'MM/dd'), value: 45 },
    { date: format(subDays(new Date(), 3), 'MM/dd'), value: 67 },
    { date: format(subDays(new Date(), 2), 'MM/dd'), value: 72 },
    { date: format(subDays(new Date(), 1), 'MM/dd'), value: 78 },
    { date: format(new Date(), 'MM/dd'), value: 85 }
  ],
  topSellingItems: [
    { name: 'Chicken Burger', sales: 45 },
    { name: 'Caesar Salad', sales: 32 },
    { name: 'French Fries', sales: 67 },
    { name: 'Coca Cola', sales: 89 }
  ]
};

// Default settings structure
const defaultSettings = {
  general: {
    restaurantName: 'My Restaurant',
    restaurantPhone: '+880 1234567890',
    restaurantEmail: 'info@myrestaurant.com',
    restaurantAddress: '123 Main Street, Dhaka, Bangladesh',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h'
  },
  business: {
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    maxTableCapacity: 8,
    reservationAdvanceDays: 30,
    serviceCharge: 10,
    vatRate: 8,
    minimumOrderAmount: 100,
    loyaltyPointsRate: 1
  },
  notifications: {
    orderNotifications: true,
    lowStockAlerts: true,
    paymentAlerts: true,
    customerFeedback: true,
    systemUpdates: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  },
  security: {
    passwordMinLength: 8,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    dataBackupFrequency: 'daily',
    twoFactorAuth: false,
    auditLogging: true,
    encryptData: true
  },
  display: {
    theme: 'light',
    fontSize: 'medium',
    brandColor: '#DC2626',
    showAnimations: true,
    compactMode: false,
    showTooltips: true
  },
  payment: {
    acceptCash: true,
    acceptCard: true,
    acceptMobile: true,
    minimumCardAmount: 50,
    refundPolicy: '7 days',
    tipSuggestions: [10, 15, 20],
    autoCalculateTip: false,
    splitBillEnabled: true
  },
  inventory: {
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    autoReorder: false,
    trackExpiry: true,
    wasteTracking: false
  }
};

export function AppProvider({ children }) {
  const [orders, setOrders] = useState(mockOrders);
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);
  const [analytics] = useState(mockAnalytics);
  const [cart, setCart] = useState([]);
  const [appSettings, setAppSettings] = useState(defaultSettings);

  // Load inventory and settings from API on component mount
  useEffect(() => {
    loadInventory();
    loadMenuItems();
    loadSettings();
  }, []);

  const loadMenuItems = async () => {
    try {
      const response = await menuAPI.getMenuItems();
      if (response.data && response.data.length > 0) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  // Menu Item Management Functions
  const addMenuItem = async (itemData) => {
    try {
      const response = await menuAPI.createMenuItem(itemData);
      if (response.data) {
        setMenuItems(prev => [response.data, ...prev]);
        return { success: true, data: response.data, message: response.message || 'Menu item created successfully' };
      }
      return { success: false, message: 'No data received from server' };
    } catch (error) {
      console.error('Error adding menu item:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors ?
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Failed to create menu item';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const updateMenuItem = async (id, itemData) => {
    try {
      const response = await menuAPI.updateMenuItem(id, itemData);
      if (response.data) {
        setMenuItems(prev => prev.map(item =>
          item.id === id ? response.data : item
        ));
        return { success: true, data: response.data, message: response.message || 'Menu item updated successfully' };
      }
      return { success: false, message: 'No data received from server' };
    } catch (error) {
      console.error('Error updating menu item:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors ?
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Failed to update menu item';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      const response = await menuAPI.deleteMenuItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
      return { success: true, message: response.message || 'Menu item deleted successfully' };
    } catch (error) {
      console.error('Error deleting menu item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete menu item';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const loadInventory = async () => {
    setInventoryLoading(true);
    setInventoryError(null);

    try {
      const response = await inventoryAPI.getInventoryItems();
      if (response.data) {
        setInventory(response.data);
      }
    } catch (error) {
      setInventoryError(error.message);
      console.error('Error loading inventory:', error);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Inventory Management Functions
  const addInventoryItem = async (itemData) => {
    try {
      const response = await inventoryAPI.createInventoryItem(itemData);
      if (response.data) {
        setInventory(prev => [response.data, ...prev]);
        return { success: true, data: response.data, message: response.message || 'Inventory item created successfully' };
      }
      return { success: false, message: 'No data received from server' };
    } catch (error) {
      console.error('Error adding inventory item:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors ?
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Failed to create inventory item';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const updateInventoryItem = async (id, itemData) => {
    try {
      const response = await inventoryAPI.updateInventoryItem(id, itemData);
      if (response.data) {
        setInventory(prev => prev.map(item =>
          item.id === id ? response.data : item
        ));
        return { success: true, data: response.data, message: response.message || 'Inventory item updated successfully' };
      }
      return { success: false, message: 'No data received from server' };
    } catch (error) {
      console.error('Error updating inventory item:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors ?
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Failed to update inventory item';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      const response = await inventoryAPI.deleteInventoryItem(id);
      setInventory(prev => prev.filter(item => item.id !== id));
      return { success: true, message: response.message || 'Inventory item deleted successfully' };
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete inventory item';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const adjustInventoryStock = async (id, adjustment, reason = null) => {
    try {
      const response = await inventoryAPI.adjustStock(id, adjustment, reason);
      if (response.data) {
        setInventory(prev => prev.map(item =>
          item.id === id ? { ...item, quantity: response.data.quantity } : item
        ));
        return { success: true, data: response.data, message: response.message || 'Stock adjusted successfully' };
      }
      return { success: false, message: 'No data received from server' };
    } catch (error) {
      console.error('Error adjusting stock:', error);
      const errorMessage = error.response?.data?.message || 'Failed to adjust stock';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const refreshInventory = async () => {
    await loadInventory();
  };

  // Load settings from API
  const loadSettings = async () => {
    try {
      const result = await settingsAPI.getAllSettings();
      if (result.success && result.data) {
        // Transform API data to match expected structure
        const transformedSettings = { ...defaultSettings };

        // If API returns settings, merge them with defaults
        if (typeof result.data === 'object') {
          Object.keys(result.data).forEach(key => {
            const category = settingsAPI.getCategoryFromKey(key);
            const settingKey = key.replace(`${category}_`, '');

            if (!transformedSettings[category]) {
              transformedSettings[category] = {};
            }
            transformedSettings[category][settingKey] = result.data[key];
          });
        }

        setAppSettings(transformedSettings);
      } else {
        // If no settings from API, use defaults
        setAppSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Fallback to defaults on error
      setAppSettings(defaultSettings);
    }
  };

  // Settings Management Functions
  const updateSettings = async (category, newSettings) => {
    try {
      // Convert settings to array format for batch update
      const settingsArray = Object.entries(newSettings).map(([key, value]) => ({
        key: `${category}_${key}`,
        value,
        type: settingsAPI.detectType(value),
        category,
        description: `${category} setting: ${key}`,
        is_public: false
      }));

      const result = await settingsAPI.updateBatchSettings(settingsArray);
      if (result.success) {
        // Update local state
        setAppSettings(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            ...newSettings
          }
        }));
        return { success: true, message: 'Settings updated successfully' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  };

  const resetSettings = async () => {
    try {
      setAppSettings(defaultSettings);
      // You could also implement a backend reset endpoint here
      return { success: true, message: 'Settings reset to defaults' };
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return { success: false, error: 'Failed to reset settings' };
    }
  };

  const exportSettings = async () => {
    try {
      const result = await settingsAPI.exportSettings();
      return result;
    } catch (error) {
      console.error('Failed to export settings:', error);
      return { success: false, error: 'Failed to export settings' };
    }
  };

  const importSettings = async (file) => {
    try {
      const result = await settingsAPI.importSettings(file);
      if (result.success) {
        // Reload settings after import
        await loadSettings();
      }
      return result;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return { success: false, error: 'Failed to import settings' };
    }
  };

  const generateSettingsPDF = async () => {
    try {
      const result = await settingsAPI.generateSettingsPDF();
      return result;
    } catch (error) {
      console.error('Failed to generate settings PDF:', error);
      return { success: false, error: 'Failed to generate settings PDF' };
    }
  };

  // Order functions
  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      orderTime: format(new Date(), 'HH:mm'),
      status: 'pending'
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (orderId, updates) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    ));
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  // Cart functions
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    // State
    orders,
    menuItems,
    inventory,
    inventoryLoading,
    inventoryError,
    analytics,
    cart,
    appSettings,

    // Order functions
    addOrder,
    updateOrder,
    deleteOrder,

    // Menu functions
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,

    // Inventory functions
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustInventoryStock,
    refreshInventory,

    // Settings functions
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    generateSettingsPDF,
    loadSettings,

    // Cart functions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,

    // Utility functions
    loadInventory,
    loadMenuItems
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
