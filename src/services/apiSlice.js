import { authAPI, userAPI, menuAPI, orderAPI, analyticsAPI, reservationAPI } from './api.js';

/**
 * API Slice - Centralized API management layer
 * Provides a clean interface for all API operations with error handling and loading states
 */

class ApiSlice {
  constructor() {
    this.loading = {};
    this.errors = {};
    this.cache = {};
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Utility methods
  setLoading(key, value) {
    this.loading[key] = value;
  }

  setError(key, error) {
    this.errors[key] = error;
  }

  clearError(key) {
    delete this.errors[key];
  }

  // Cache management
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  setCache(key, data) {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }

  getCache(key) {
    const cached = this.cache[key];
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      delete this.cache[key];
      return null;
    }
    
    return cached.data;
  }

  clearCache(pattern = null) {
    if (pattern) {
      Object.keys(this.cache).forEach(key => {
        if (key.includes(pattern)) {
          delete this.cache[key];
        }
      });
    } else {
      this.cache = {};
    }
  }

  // Generic API call wrapper
  async makeApiCall(apiCall, key, useCache = false, cacheKey = null) {
    this.setLoading(key, true);
    this.clearError(key);

    try {
      // Check cache first if enabled
      if (useCache && cacheKey) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          this.setLoading(key, false);
          return { success: true, data: cachedData };
        }
      }

      const response = await apiCall();
      
      // Cache the response if enabled
      if (useCache && cacheKey) {
        this.setCache(cacheKey, response);
      }

      this.setLoading(key, false);
      return { success: true, data: response };
    } catch (error) {
      this.setLoading(key, false);
      this.setError(key, error.response?.data?.message || error.message);
      console.error(`API Error (${key}):`, error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  // Authentication Methods
  async login(credentials) {
    const result = await this.makeApiCall(
      () => authAPI.login(credentials),
      'auth.login'
    );
    
    if (result.success) {
      this.clearCache(); // Clear all cache on login
    }
    
    return result;
  }

  async signup(userData) {
    return this.makeApiCall(
      () => authAPI.signup(userData),
      'auth.signup'
    );
  }

  async logout() {
    const result = await this.makeApiCall(
      () => authAPI.logout(),
      'auth.logout'
    );
    
    if (result.success) {
      this.clearCache(); // Clear all cache on logout
    }
    
    return result;
  }

  async verifyToken() {
    return this.makeApiCall(
      () => authAPI.verifyToken(),
      'auth.verify'
    );
  }

  async refreshToken() {
    return this.makeApiCall(
      () => authAPI.refreshToken(),
      'auth.refresh'
    );
  }

  async forgotPassword(email) {
    return this.makeApiCall(
      () => authAPI.forgotPassword(email),
      'auth.forgotPassword'
    );
  }

  async resetPassword(token, password) {
    return this.makeApiCall(
      () => authAPI.resetPassword(token, password),
      'auth.resetPassword'
    );
  }

  // User Methods
  async getUserProfile() {
    return this.makeApiCall(
      () => userAPI.getProfile(),
      'user.profile',
      true,
      'user_profile'
    );
  }

  async updateUserProfile(profileData) {
    const result = await this.makeApiCall(
      () => userAPI.updateProfile(profileData),
      'user.updateProfile'
    );
    
    if (result.success) {
      this.clearCache('user_profile');
    }
    
    return result;
  }

  async changePassword(passwordData) {
    return this.makeApiCall(
      () => userAPI.changePassword(passwordData),
      'user.changePassword'
    );
  }

  async uploadAvatar(formData) {
    const result = await this.makeApiCall(
      () => userAPI.uploadAvatar(formData),
      'user.uploadAvatar'
    );
    
    if (result.success) {
      this.clearCache('user_profile');
    }
    
    return result;
  }

  // Menu Methods
  async getMenuItems(filters = {}) {
    const cacheKey = this.getCacheKey('menu_items', filters);
    return this.makeApiCall(
      () => menuAPI.getMenuItems(filters),
      'menu.getItems',
      true,
      cacheKey
    );
  }

  async getMenuItem(id) {
    return this.makeApiCall(
      () => menuAPI.getMenuItem(id),
      'menu.getItem',
      true,
      `menu_item_${id}`
    );
  }

  async createMenuItem(itemData) {
    const result = await this.makeApiCall(
      () => menuAPI.createMenuItem(itemData),
      'menu.createItem'
    );
    
    if (result.success) {
      this.clearCache('menu_items');
      this.clearCache('menu_categories');
    }
    
    return result;
  }

  async updateMenuItem(id, itemData) {
    const result = await this.makeApiCall(
      () => menuAPI.updateMenuItem(id, itemData),
      'menu.updateItem'
    );
    
    if (result.success) {
      this.clearCache('menu_items');
      this.clearCache(`menu_item_${id}`);
    }
    
    return result;
  }

  async deleteMenuItem(id) {
    const result = await this.makeApiCall(
      () => menuAPI.deleteMenuItem(id),
      'menu.deleteItem'
    );
    
    if (result.success) {
      this.clearCache('menu_items');
      this.clearCache(`menu_item_${id}`);
    }
    
    return result;
  }

  async getMenuCategories() {
    return this.makeApiCall(
      () => menuAPI.getCategories(),
      'menu.getCategories',
      true,
      'menu_categories'
    );
  }

  // Order Methods
  async getOrders(filters = {}) {
    const cacheKey = this.getCacheKey('orders', filters);
    return this.makeApiCall(
      () => orderAPI.getOrders(filters),
      'orders.getAll',
      true,
      cacheKey
    );
  }

  async getOrder(id) {
    return this.makeApiCall(
      () => orderAPI.getOrder(id),
      'orders.getOne',
      true,
      `order_${id}`
    );
  }

  async createOrder(orderData) {
    const result = await this.makeApiCall(
      () => orderAPI.createOrder(orderData),
      'orders.create'
    );
    
    if (result.success) {
      this.clearCache('orders');
    }
    
    return result;
  }

  async updateOrderStatus(id, status) {
    const result = await this.makeApiCall(
      () => orderAPI.updateOrderStatus(id, status),
      'orders.updateStatus'
    );
    
    if (result.success) {
      this.clearCache('orders');
      this.clearCache(`order_${id}`);
    }
    
    return result;
  }

  async cancelOrder(id) {
    const result = await this.makeApiCall(
      () => orderAPI.cancelOrder(id),
      'orders.cancel'
    );
    
    if (result.success) {
      this.clearCache('orders');
      this.clearCache(`order_${id}`);
    }
    
    return result;
  }

  async getOrderHistory(userId) {
    return this.makeApiCall(
      () => orderAPI.getOrderHistory(userId),
      'orders.history',
      true,
      `order_history_${userId}`
    );
  }

  // Analytics Methods
  async getDashboardStats(period = '7d') {
    return this.makeApiCall(
      () => analyticsAPI.getDashboardStats(period),
      'analytics.dashboard',
      true,
      `dashboard_stats_${period}`
    );
  }

  async getSalesReport(startDate, endDate) {
    const cacheKey = this.getCacheKey('sales_report', { startDate, endDate });
    return this.makeApiCall(
      () => analyticsAPI.getSalesReport(startDate, endDate),
      'analytics.sales',
      true,
      cacheKey
    );
  }

  async getPopularItems(period = '30d') {
    return this.makeApiCall(
      () => analyticsAPI.getPopularItems(period),
      'analytics.popularItems',
      true,
      `popular_items_${period}`
    );
  }

  async getCustomerAnalytics(period = '30d') {
    return this.makeApiCall(
      () => analyticsAPI.getCustomerAnalytics(period),
      'analytics.customers',
      true,
      `customer_analytics_${period}`
    );
  }

  // Reservation Methods
  async getReservations(date) {
    return this.makeApiCall(
      () => reservationAPI.getReservations(date),
      'reservations.getAll',
      true,
      `reservations_${date}`
    );
  }

  async createReservation(reservationData) {
    const result = await this.makeApiCall(
      () => reservationAPI.createReservation(reservationData),
      'reservations.create'
    );
    
    if (result.success) {
      this.clearCache('reservations');
    }
    
    return result;
  }

  async updateReservation(id, reservationData) {
    const result = await this.makeApiCall(
      () => reservationAPI.updateReservation(id, reservationData),
      'reservations.update'
    );
    
    if (result.success) {
      this.clearCache('reservations');
    }
    
    return result;
  }

  async cancelReservation(id) {
    const result = await this.makeApiCall(
      () => reservationAPI.cancelReservation(id),
      'reservations.cancel'
    );
    
    if (result.success) {
      this.clearCache('reservations');
    }
    
    return result;
  }

  async getAvailableTables(date, time, partySize) {
    const cacheKey = this.getCacheKey('available_tables', { date, time, partySize });
    return this.makeApiCall(
      () => reservationAPI.getAvailableTables(date, time, partySize),
      'reservations.availableTables',
      true,
      cacheKey
    );
  }

  // Utility methods for components
  isLoading(key) {
    return this.loading[key] || false;
  }

  getError(key) {
    return this.errors[key] || null;
  }

  hasError(key) {
    return !!this.errors[key];
  }

  // Batch operations
  async batchDelete(type, ids) {
    const results = [];
    
    for (const id of ids) {
      let result;
      switch (type) {
        case 'menu':
          result = await this.deleteMenuItem(id);
          break;
        case 'order':
          result = await this.cancelOrder(id);
          break;
        case 'reservation':
          result = await this.cancelReservation(id);
          break;
        default:
          throw new Error(`Unsupported batch delete type: ${type}`);
      }
      results.push({ id, ...result });
    }
    
    return results;
  }

  // Health check
  async healthCheck() {
    try {
      await this.verifyToken();
      return { healthy: true, timestamp: new Date().toISOString() };
    } catch (error) {
      return { healthy: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

// Create and export singleton instance
const apiSlice = new ApiSlice();

export default apiSlice;
