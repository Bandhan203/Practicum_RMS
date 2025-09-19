// Real-time Data Context for Smart Dine POS
// Provides live data updates across all modules

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import unifiedPOSAPI from '../services/unifiedPOSAPI.js';

// Action Types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_KPI_DATA: 'SET_KPI_DATA',
  UPDATE_ORDERS: 'UPDATE_ORDERS',
  UPDATE_INVENTORY: 'UPDATE_INVENTORY',
  UPDATE_MENU: 'UPDATE_MENU',
  UPDATE_ANALYTICS: 'UPDATE_ANALYTICS',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  SET_AUTO_REFRESH: 'SET_AUTO_REFRESH',
  CLEAR_DATA: 'CLEAR_DATA'
};

// Initial State
const initialState = {
  // Connection & Loading States
  isLoading: false,
  isConnected: true,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  lastUpdate: null,
  error: null,

  // Dashboard Overview
  dashboard: {
    kpis: {},
    charts: {},
    summary: {}
  },

  // Module Data
  orders: {
    list: [],
    stats: {},
    recent: [],
    pending: 0
  },

  inventory: {
    items: [],
    stats: {},
    alerts: {},
    lowStock: [],
    categories: []
  },

  menu: {
    items: [],
    categories: [],
    popularItems: [],
    availability: {}
  },

  analytics: {
    sales: {},
    revenue: {},
    trends: {},
    reports: {}
  },

  // Live KPIs
  liveKPIs: {
    revenue: 0,
    orders: 0,
    pending_orders: 0,
    inventory_value: 0,
    critical_stock: 0,
    low_stock: 0
  }
};

// Reducer
function realTimeDataReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case ACTIONS.SET_CONNECTION_STATUS:
      return {
        ...state,
        isConnected: action.payload
      };

    case ACTIONS.SET_AUTO_REFRESH:
      return {
        ...state,
        autoRefresh: action.payload
      };

    case ACTIONS.SET_DASHBOARD_DATA:
      return {
        ...state,
        dashboard: action.payload.analytics || {},
        orders: {
          ...state.orders,
          ...action.payload.orders
        },
        inventory: {
          ...state.inventory,
          ...action.payload.inventory
        },
        menu: {
          ...state.menu,
          ...action.payload.menu
        },
        lastUpdate: action.payload.timestamp,
        isLoading: false,
        error: null
      };

    case ACTIONS.SET_KPI_DATA:
      return {
        ...state,
        liveKPIs: {
          ...state.liveKPIs,
          ...action.payload
        },
        lastUpdate: new Date().toISOString()
      };

    case ACTIONS.UPDATE_ORDERS:
      return {
        ...state,
        orders: {
          ...state.orders,
          ...action.payload
        },
        lastUpdate: new Date().toISOString()
      };

    case ACTIONS.UPDATE_INVENTORY:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          ...action.payload
        },
        lastUpdate: new Date().toISOString()
      };

    case ACTIONS.UPDATE_MENU:
      return {
        ...state,
        menu: {
          ...state.menu,
          ...action.payload
        },
        lastUpdate: new Date().toISOString()
      };

    case ACTIONS.UPDATE_ANALYTICS:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload
        },
        dashboard: {
          ...state.dashboard,
          ...action.payload.dashboard
        },
        lastUpdate: new Date().toISOString()
      };

    case ACTIONS.CLEAR_DATA:
      return {
        ...initialState,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval
      };

    default:
      return state;
  }
}

// Context
const RealTimeDataContext = createContext();

// Provider Component
export function RealTimeDataProvider({ children }) {
  const [state, dispatch] = useReducer(realTimeDataReducer, initialState);

  // Auto-refresh interval
  useEffect(() => {
    let interval;

    if (state.autoRefresh && state.isConnected) {
      interval = setInterval(() => {
        refreshKPIs();
      }, state.refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.autoRefresh, state.isConnected, state.refreshInterval]);

  // API Health Check
  const checkConnection = useCallback(async () => {
    try {
      const health = await unifiedPOSAPI.checkHealth();
      dispatch({
        type: ACTIONS.SET_CONNECTION_STATUS,
        payload: health.success
      });
      return health.success;
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_CONNECTION_STATUS,
        payload: false
      });
      return false;
    }
  }, []);

  // Load Initial Dashboard Data
  const loadDashboardData = useCallback(async (period = 'today') => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await unifiedPOSAPI.getDashboardData(period);
      
      if (result.success) {
        dispatch({
          type: ACTIONS.SET_DASHBOARD_DATA,
          payload: result.data
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message
      });
    }
  }, []);

  // Refresh Live KPIs
  const refreshKPIs = useCallback(async (period = 'today') => {
    if (!state.isConnected) return;

    try {
      const result = await unifiedPOSAPI.getLiveKPIs(period);
      
      if (result.success) {
        dispatch({
          type: ACTIONS.SET_KPI_DATA,
          payload: result.data
        });
      }
    } catch (error) {
      console.error('Failed to refresh KPIs:', error);
      // Don't show error for background KPI updates
    }
  }, [state.isConnected]);

  // Update Orders Data
  const updateOrdersData = useCallback(async (filters = {}) => {
    try {
      const [orders, stats] = await Promise.all([
        unifiedPOSAPI.getOrders({ ...filters, limit: 20 }),
        unifiedPOSAPI.getOrderStatistics()
      ]);

      const updateData = {};
      if (orders.success) updateData.list = orders.data;
      if (stats.success) updateData.stats = stats.data;

      dispatch({
        type: ACTIONS.UPDATE_ORDERS,
        payload: updateData
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to update orders data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update Inventory Data
  const updateInventoryData = useCallback(async (filters = {}) => {
    try {
      const [inventory, stats, alerts] = await Promise.all([
        unifiedPOSAPI.getInventory(filters),
        unifiedPOSAPI.getInventoryStats(),
        unifiedPOSAPI.getInventoryAlerts()
      ]);

      const updateData = {};
      if (inventory.success) {
        updateData.items = inventory.data;
        updateData.categories = inventory.categories;
      }
      if (stats.success) updateData.stats = stats.data;
      if (alerts.success) updateData.alerts = alerts.data;

      dispatch({
        type: ACTIONS.UPDATE_INVENTORY,
        payload: updateData
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to update inventory data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update Menu Data
  const updateMenuData = useCallback(async (filters = {}) => {
    try {
      const [items, categories] = await Promise.all([
        unifiedPOSAPI.getMenuItems(filters),
        unifiedPOSAPI.getMenuCategories()
      ]);

      const updateData = {};
      if (items.success) updateData.items = items.data;
      if (categories.success) updateData.categories = categories.data;

      dispatch({
        type: ACTIONS.UPDATE_MENU,
        payload: updateData
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to update menu data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update Analytics Data
  const updateAnalyticsData = useCallback(async (startDate, endDate) => {
    try {
      const [dashboard, sales, inventory, menu] = await Promise.all([
        unifiedPOSAPI.getDashboardStats('today'),
        startDate && endDate ? unifiedPOSAPI.getSalesReport(startDate, endDate) : Promise.resolve({ success: true, data: {} }),
        unifiedPOSAPI.getInventoryReport(),
        unifiedPOSAPI.getMenuReport(startDate, endDate)
      ]);

      const updateData = {
        dashboard: dashboard.success ? dashboard.data : {},
        sales: sales.success ? sales.data : {},
        inventory: inventory.success ? inventory.data : {},
        menu: menu.success ? menu.data : {}
      };

      dispatch({
        type: ACTIONS.UPDATE_ANALYTICS,
        payload: updateData
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to update analytics data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Full Data Refresh
  const refreshAllData = useCallback(async (period = 'today') => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      await Promise.all([
        loadDashboardData(period),
        updateOrdersData(),
        updateInventoryData(),
        updateMenuData(),
        updateAnalyticsData()
      ]);
    } catch (error) {
      console.error('Failed to refresh all data:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Failed to refresh data'
      });
    }
  }, [loadDashboardData, updateOrdersData, updateInventoryData, updateMenuData, updateAnalyticsData]);

  // Toggle Auto Refresh
  const toggleAutoRefresh = useCallback(() => {
    dispatch({
      type: ACTIONS.SET_AUTO_REFRESH,
      payload: !state.autoRefresh
    });
  }, [state.autoRefresh]);

  // Clear All Data
  const clearData = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_DATA });
  }, []);

  // Context Value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    loadDashboardData,
    refreshKPIs,
    updateOrdersData,
    updateInventoryData,
    updateMenuData,
    updateAnalyticsData,
    refreshAllData,
    checkConnection,
    toggleAutoRefresh,
    clearData,
    
    // API Instance
    api: unifiedPOSAPI
  };

  return (
    <RealTimeDataContext.Provider value={contextValue}>
      {children}
    </RealTimeDataContext.Provider>
  );
}

// Custom Hook
export function useRealTimeData() {
  const context = useContext(RealTimeDataContext);
  
  if (!context) {
    throw new Error('useRealTimeData must be used within a RealTimeDataProvider');
  }
  
  return context;
}

// Specialized Hooks for Different Modules
export function useOrdersData() {
  const { orders, updateOrdersData, isLoading, error } = useRealTimeData();
  
  return {
    orders: orders.list,
    stats: orders.stats,
    recent: orders.recent,
    pending: orders.pending,
    updateData: updateOrdersData,
    isLoading,
    error
  };
}

export function useInventoryData() {
  const { inventory, updateInventoryData, isLoading, error } = useRealTimeData();
  
  return {
    items: inventory.items,
    stats: inventory.stats,
    alerts: inventory.alerts,
    categories: inventory.categories,
    updateData: updateInventoryData,
    isLoading,
    error
  };
}

export function useMenuData() {
  const { menu, updateMenuData, isLoading, error } = useRealTimeData();
  
  return {
    items: menu.items,
    categories: menu.categories,
    popular: menu.popularItems,
    availability: menu.availability,
    updateData: updateMenuData,
    isLoading,
    error
  };
}

export function useAnalyticsData() {
  const { 
    analytics, 
    dashboard, 
    liveKPIs, 
    updateAnalyticsData, 
    refreshKPIs,
    isLoading, 
    error,
    lastUpdate 
  } = useRealTimeData();
  
  return {
    analytics,
    dashboard,
    kpis: liveKPIs,
    updateData: updateAnalyticsData,
    refreshKPIs,
    isLoading,
    error,
    lastUpdate
  };
}

export default RealTimeDataContext;