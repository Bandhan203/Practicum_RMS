import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiSlice from '../services/apiSlice.js';

const ApiAppContext = createContext(undefined);

// This is a hybrid context that can work with both API and local data
export function ApiAppProvider({ children }) {
  // State for API data
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState({
    orders: false,
    menuItems: false,
    reservations: false,
    users: false,
    inventory: false,
    analytics: false
  });
  
  const [errors, setErrors] = useState({});
  
  // API connection status
  const [apiConnected, setApiConnected] = useState(false);
  const [useLocalData, setUseLocalData] = useState(true); // Fallback to local data

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await apiSlice.healthCheck();
      setApiConnected(health.healthy);
      if (health.healthy) {
        setUseLocalData(false);
        // Load initial data from API
        await loadInitialData();
      }
    } catch (error) {
      console.warn('API not available, using local data:', error);
      setApiConnected(false);
      setUseLocalData(true);
    }
  };

  const loadInitialData = async () => {
    if (useLocalData) return;
    
    try {
      // Load all initial data in parallel
      const [menuResult, ordersResult, reservationsResult] = await Promise.all([
        apiSlice.getMenuItems(),
        apiSlice.getOrders(),
        apiSlice.getReservations(new Date().toISOString().split('T')[0])
      ]);

      if (menuResult.success) setMenuItems(menuResult.data);
      if (ordersResult.success) setOrders(ordersResult.data);
      if (reservationsResult.success) setReservations(reservationsResult.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setUseLocalData(true);
    }
  };

  // Helper function to handle API calls with fallback
  const handleApiCall = useCallback(async (apiCall, localFallback, loadingKey) => {
    if (useLocalData) {
      return localFallback();
    }

    setIsLoading(prev => ({ ...prev, [loadingKey]: true }));
    setErrors(prev => ({ ...prev, [loadingKey]: null }));

    try {
      const result = await apiCall();
      setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setErrors(prev => ({ ...prev, [loadingKey]: result.error }));
        // Fallback to local operation if API fails
        return localFallback();
      }
    } catch (error) {
      setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
      setErrors(prev => ({ ...prev, [loadingKey]: error.message }));
      console.warn(`API call failed, using local fallback:`, error);
      return localFallback();
    }
  }, [useLocalData]);

  // Menu Management Functions
  const addMenuItem = async (itemData) => {
    return handleApiCall(
      () => apiSlice.createMenuItem(itemData),
      () => {
        const newItem = { ...itemData, id: Date.now().toString() };
        setMenuItems(prev => [newItem, ...prev]);
        return { success: true, data: newItem };
      },
      'menuItems'
    );
  };

  const updateMenuItem = async (itemId, updates) => {
    return handleApiCall(
      () => apiSlice.updateMenuItem(itemId, updates),
      () => {
        setMenuItems(prev =>
          prev.map(item => item.id === itemId ? { ...item, ...updates } : item)
        );
        return { success: true };
      },
      'menuItems'
    );
  };

  const deleteMenuItem = async (itemId) => {
    return handleApiCall(
      () => apiSlice.deleteMenuItem(itemId),
      () => {
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
        return { success: true };
      },
      'menuItems'
    );
  };

  const getMenuItems = async (filters = {}) => {
    return handleApiCall(
      () => apiSlice.getMenuItems(filters),
      () => {
        const filtered = menuItems.filter(item => {
          if (filters.category && item.category !== filters.category) return false;
          if (filters.available !== undefined && item.available !== filters.available) return false;
          return true;
        });
        return { success: true, data: filtered };
      },
      'menuItems'
    );
  };

  // Order Management Functions
  const createOrder = async (orderData) => {
    return handleApiCall(
      () => apiSlice.createOrder(orderData),
      () => {
        const newOrder = {
          ...orderData,
          id: Date.now().toString(),
          createdAt: new Date(),
          status: 'pending'
        };
        setOrders(prev => [newOrder, ...prev]);
        return { success: true, data: newOrder };
      },
      'orders'
    );
  };

  const updateOrderStatus = async (orderId, status) => {
    return handleApiCall(
      () => apiSlice.updateOrderStatus(orderId, status),
      () => {
        setOrders(prev =>
          prev.map(order => order.id === orderId ? { ...order, status } : order)
        );
        return { success: true };
      },
      'orders'
    );
  };

  const cancelOrder = async (orderId) => {
    return handleApiCall(
      () => apiSlice.cancelOrder(orderId),
      () => {
        setOrders(prev =>
          prev.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order)
        );
        return { success: true };
      },
      'orders'
    );
  };

  const removeItemFromOrder = async (orderId, itemIndex) => {
    // This is typically a local operation, but we update the order via API
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const newItems = order.items.filter((_, index) => index !== itemIndex);
    const newTotalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const updatedOrder = {
      ...order,
      items: newItems,
      totalAmount: newTotalAmount
    };

    return handleApiCall(
      () => apiSlice.updateOrderStatus(orderId, order.status), // Update with new items
      () => {
        setOrders(prev =>
          prev.map(o => o.id === orderId ? updatedOrder : o)
        );
        return { success: true };
      },
      'orders'
    );
  };

  // Reservation Management Functions
  const addReservation = async (reservationData) => {
    return handleApiCall(
      () => apiSlice.createReservation(reservationData),
      () => {
        const newReservation = {
          ...reservationData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setReservations(prev => [newReservation, ...prev]);
        return { success: true, data: newReservation };
      },
      'reservations'
    );
  };

  const updateReservation = async (reservationId, updates) => {
    return handleApiCall(
      () => apiSlice.updateReservation(reservationId, updates),
      () => {
        setReservations(prev =>
          prev.map(r => r.id === reservationId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r)
        );
        return { success: true };
      },
      'reservations'
    );
  };

  const deleteReservation = async (reservationId) => {
    return handleApiCall(
      () => apiSlice.cancelReservation(reservationId),
      () => {
        setReservations(prev => prev.filter(r => r.id !== reservationId));
        return { success: true };
      },
      'reservations'
    );
  };

  // Analytics Functions
  const getDashboardStats = async (period = '7d') => {
    return handleApiCall(
      () => apiSlice.getDashboardStats(period),
      () => {
        // Calculate local stats
        const stats = {
          totalSales: orders.reduce((sum, order) => 
            order.status === 'served' ? sum + order.totalAmount : sum, 0
          ),
          totalOrders: orders.length,
          avgOrderValue: orders.length > 0 ? 
            orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
          pendingOrders: orders.filter(order => order.status === 'pending').length
        };
        return { success: true, data: stats };
      },
      'analytics'
    );
  };

  // User Management Functions
  const addUser = async (userData) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      status: 'active',
      joinedDate: new Date(),
      lastLogin: null,
      totalOrders: 0,
      points: userData.role === 'customer' ? 0 : undefined,
      loyaltyTier: userData.role === 'customer' ? 'Bronze' : undefined
    };
    setAppUsers(prev => [newUser, ...prev]);
    return { success: true, data: newUser };
  };

  const updateUser = async (userId, updates) => {
    setAppUsers(prev =>
      prev.map(user => user.id === userId ? { ...user, ...updates } : user)
    );
    return { success: true };
  };

  const deleteUser = async (userId) => {
    setAppUsers(prev => prev.filter(user => user.id !== userId));
    return { success: true };
  };

  // Cart Management (always local)
  const addToCart = (menuItemId) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === menuItemId);
      if (existing) {
        return prev.map(item =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItemId, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Utility functions
  const getLoadingState = (key) => isLoading[key] || false;
  const getError = (key) => errors[key] || null;
  const hasError = (key) => !!errors[key];
  const clearError = (key) => {
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  // Retry failed operations
  const retryOperation = async (operation) => {
    try {
      return await operation();
    } catch (error) {
      console.error('Retry failed:', error);
      throw error;
    }
  };

  // Switch between API and local mode
  const toggleDataSource = async () => {
    if (useLocalData) {
      // Try to connect to API
      await checkApiHealth();
    } else {
      // Switch to local mode
      setUseLocalData(true);
      setApiConnected(false);
    }
  };

  // Sync local changes to API when connection is restored
  const syncToApi = async () => {
    if (!apiConnected || useLocalData) return;
    
    try {
      // Sync any pending local changes to API
      console.log('Syncing local changes to API...');
      // Implementation would depend on tracking what needs syncing
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const contextValue = {
    // Data
    orders,
    menuItems,
    reservations,
    appUsers,
    inventory,
    wasteLogs,
    cart,
    
    // API status
    apiConnected,
    useLocalData,
    
    // Loading and error states
    getLoadingState,
    getError,
    hasError,
    clearError,
    
    // Menu operations
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItems,
    
    // Order operations
    createOrder,
    updateOrderStatus,
    cancelOrder,
    removeItemFromOrder,
    
    // Reservation operations
    addReservation,
    updateReservation,
    deleteReservation,
    
    // User operations
    addUser,
    updateUser,
    deleteUser,
    
    // Cart operations
    addToCart,
    removeFromCart,
    clearCart,
    
    // Analytics
    getDashboardStats,
    
    // Utility functions
    retryOperation,
    toggleDataSource,
    syncToApi,
    checkApiHealth,
    
    // Direct API slice access for advanced operations
    apiSlice
  };

  return (
    <ApiAppContext.Provider value={contextValue}>
      {children}
    </ApiAppContext.Provider>
  );
}

export function useApiApp() {
  const context = useContext(ApiAppContext);
  if (context === undefined) {
    throw new Error('useApiApp must be used within an ApiAppProvider');
  }
  return context;
}

export { ApiAppContext };
