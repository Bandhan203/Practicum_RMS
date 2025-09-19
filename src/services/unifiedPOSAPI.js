// Unified API Service for Smart Dine POS
// Connects Orders, Menu, Inventory, and Analytics APIs dynamically

import api from './api.js';

class UnifiedPOSAPI {
  constructor() {
    this.baseURL = api.defaults.baseURL;
  }

  // ========== MENU API ==========
  async getMenuItems(filters = {}) {
    try {
      const response = await api.get('/menu-items', { params: filters });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  }

  async getMenuItem(id) {
    try {
      const response = await api.get(`/menu-items/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async createMenuItem(itemData) {
    try {
      const formData = new FormData();
      
      // Handle file upload
      Object.keys(itemData).forEach(key => {
        if (key === 'ingredients' && Array.isArray(itemData[key])) {
          formData.append(key, JSON.stringify(itemData[key]));
        } else if (itemData[key] !== null && itemData[key] !== undefined) {
          formData.append(key, itemData[key]);
        }
      });

      const response = await api.post('/menu-items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  async updateMenuItem(id, itemData) {
    try {
      const formData = new FormData();
      
      Object.keys(itemData).forEach(key => {
        if (key === 'ingredients' && Array.isArray(itemData[key])) {
          formData.append(key, JSON.stringify(itemData[key]));
        } else if (itemData[key] !== null && itemData[key] !== undefined) {
          formData.append(key, itemData[key]);
        }
      });

      // Add method override for PATCH
      formData.append('_method', 'PUT');

      const response = await api.post(`/menu-items/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  async deleteMenuItem(id) {
    try {
      const response = await api.delete(`/menu-items/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getMenuCategories() {
    try {
      const response = await api.get('/menu-categories');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  }

  // ========== ORDER API ==========
  async getOrders(filters = {}) {
    try {
      const response = await api.get('/orders', { params: filters });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  }

  async getOrder(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  async updateOrder(id, orderData) {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  async deleteOrder(id) {
    try {
      const response = await api.delete(`/orders/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getOrderStatistics() {
    try {
      const response = await api.get('/orders-statistics');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {}
      };
    }
  }

  // ========== INVENTORY API ==========
  async getInventory(filters = {}) {
    try {
      const response = await api.get('/inventory', { params: filters });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        stats: response.data.stats,
        categories: response.data.categories
      };
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        stats: {},
        categories: []
      };
    }
  }

  async getInventoryItem(id) {
    try {
      const response = await api.get(`/inventory/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async createInventoryItem(itemData) {
    try {
      const response = await api.post('/inventory', itemData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  async updateInventoryItem(id, itemData) {
    try {
      const response = await api.put(`/inventory/${id}`, itemData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  async deleteInventoryItem(id) {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async adjustInventoryStock(id, adjustment, reason = '') {
    try {
      const response = await api.post(`/inventory/${id}/adjust-stock`, {
        adjustment,
        reason
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getInventoryStats() {
    try {
      const response = await api.get('/inventory-stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {}
      };
    }
  }

  async getInventoryAlerts() {
    try {
      const response = await api.get('/inventory-alerts');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {}
      };
    }
  }

  // ========== BILLING API ==========
  async getBills(filters = {}) {
    try {
      const response = await api.get('/bills', { params: filters });
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        meta: {}
      };
    }
  }

  async generateBill(billData) {
    try {
      const response = await api.post('/bills', billData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  async getBill(billId) {
    try {
      const response = await api.get(`/bills/${billId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async processPayment(billId, paymentData) {
    try {
      const response = await api.post(`/bills/${billId}/payment`, paymentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        changeAmount: response.data.change_amount
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  async getCompletedOrders() {
    try {
      const response = await api.get('/bills/completed-orders');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  }

  async getBillingStatistics(dateRange = {}) {
    try {
      const response = await api.get('/bills/statistics', { params: dateRange });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {}
      };
    }
  }

  // ========== ANALYTICS API (Enhanced) ==========
  async getDashboardStats(period = 'today') {
    try {
      const response = await api.get('/analytics/dashboard-stats', {
        params: { period }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async getSalesReport(startDate, endDate) {
    try {
      const response = await api.get('/analytics/sales-report', {
        params: {
          start_date: this.formatDate(startDate),
          end_date: this.formatDate(endDate)
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async getInventoryReport() {
    try {
      const response = await api.get('/analytics/inventory-report');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async getMenuReport(startDate = null, endDate = null) {
    try {
      const params = {};
      if (startDate) params.start_date = this.formatDate(startDate);
      if (endDate) params.end_date = this.formatDate(endDate);

      const response = await api.get('/analytics/menu-report', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async getComprehensiveReport(startDate, endDate) {
    try {
      const response = await api.get('/analytics/comprehensive-report', {
        params: {
          start_date: this.formatDate(startDate),
          end_date: this.formatDate(endDate)
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  // ========== COMBINED DASHBOARD DATA ==========
  async getDashboardData(period = 'today') {
    try {
      // Fetch all dashboard data in parallel
      const [
        dashboardStats,
        orderStats,
        inventoryStats,
        inventoryAlerts,
        menuCategories
      ] = await Promise.all([
        this.getDashboardStats(period),
        this.getOrderStatistics(),
        this.getInventoryStats(),
        this.getInventoryAlerts(),
        this.getMenuCategories()
      ]);

      // Get recent orders
      const recentOrders = await this.getOrders({ 
        limit: 10, 
        sort: 'created_at',
        order: 'desc' 
      });

      return {
        success: true,
        data: {
          analytics: dashboardStats.data,
          orders: {
            stats: orderStats.data,
            recent: recentOrders.data
          },
          inventory: {
            stats: inventoryStats.data,
            alerts: inventoryAlerts.data
          },
          menu: {
            categories: menuCategories.data
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return {
        success: false,
        error: 'Failed to load dashboard data',
        data: null
      };
    }
  }

  // ========== REAL-TIME DATA METHODS ==========
  async refreshAllData(period = 'today') {
    return this.getDashboardData(period);
  }

  async getLiveKPIs(period = 'today') {
    try {
      const [analytics, orders, inventory] = await Promise.all([
        this.getDashboardStats(period),
        this.getOrderStatistics(),
        this.getInventoryStats()
      ]);

      const kpis = {
        revenue: analytics.data?.kpis?.total_revenue || 0,
        orders: orders.data?.total_orders || 0,
        pending_orders: orders.data?.pending_orders || 0,
        inventory_value: inventory.data?.total_value || 0,
        critical_stock: inventory.data?.critical_stock || 0,
        low_stock: inventory.data?.low_stock || 0
      };

      return {
        success: true,
        data: kpis
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  // ========== EXPORT FUNCTIONALITY ==========
  async exportData(type, format, startDate = null, endDate = null) {
    try {
      const params = {
        report_type: type,
        format: format
      };

      if (startDate) params.start_date = this.formatDate(startDate);
      if (endDate) params.end_date = this.formatDate(endDate);

      const response = await api.get(`/analytics/export/${format}`, {
        params,
        responseType: 'blob'
      });

      // Create download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${type}_${format}_${this.formatDate(new Date())}.${format}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        filename: filename
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ========== UTILITY METHODS ==========
  formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  // Get predefined date ranges
  getDateRanges() {
    const now = new Date();
    return {
      today: {
        start: this.formatDate(now),
        end: this.formatDate(now),
        label: 'Today'
      },
      week: {
        start: this.formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
        end: this.formatDate(now),
        label: 'Last 7 Days'
      },
      month: {
        start: this.formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
        end: this.formatDate(now),
        label: 'Last 30 Days'
      },
      quarter: {
        start: this.formatDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)),
        end: this.formatDate(now),
        label: 'Last 90 Days'
      }
    };
  }

  // Check API health
  async checkHealth() {
    try {
      const response = await api.get('/test-inventory');
      return {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export singleton instance
const unifiedPOSAPI = new UnifiedPOSAPI();
export default unifiedPOSAPI;