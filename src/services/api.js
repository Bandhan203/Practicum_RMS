import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  withCredentials: false, // Using Bearer token authentication, no need for credentials
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (!token && config.url.includes('menu-items')) {
      console.warn('API Request: No auth token found for menu-items request:', config.url);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('authToken');
      localStorage.removeItem('restaurant_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/signup', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  me: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/user/change-password', passwordData);
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Menu API calls
export const menuAPI = {
  getMenuItems: async (filters = {}) => {
    console.log('menuAPI.getMenuItems: Making API request...');
    const response = await api.get('/menu-items', { params: filters });
    console.log('menuAPI.getMenuItems: Success, response status:', response.status);
    return response.data;
  },

  getMenuItem: async (id) => {
    const response = await api.get(`/menu-items/${id}`);
    return response.data;
  },

  createMenuItem: async (itemData) => {
    const response = await api.post('/menu-items', itemData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateMenuItem: async (id, itemData) => {
    const response = await api.post(`/menu-items/${id}`, itemData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-HTTP-Method-Override': 'PUT'
      },
    });
    return response.data;
  },

  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu-items/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/menu-categories');
    return response.data;
  },
};

// Order API calls
export const orderAPI = {
  getOrders: async (filters = {}) => {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  },

  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id, updateData) => {
    const response = await api.put(`/orders/${id}`, updateData);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  getOrderStatistics: async () => {
    const response = await api.get('/orders-statistics');
    return response.data;
  },
};

// Analytics API calls
export const analyticsAPI = {
  getDashboardStats: async (period = '7d') => {
    const response = await api.get('/analytics/dashboard', { params: { period } });
    return response.data;
  },

  getSalesReport: async (startDate, endDate) => {
    const response = await api.get('/analytics/sales', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  getPopularItems: async (period = '30d') => {
    const response = await api.get('/analytics/popular-items', { params: { period } });
    return response.data;
  },

  getCustomerAnalytics: async (period = '30d') => {
    const response = await api.get('/analytics/customers', { params: { period } });
    return response.data;
  },
};

// Reservation API calls
export const reservationAPI = {
  getReservations: async (date) => {
    const response = await api.get('/reservations', { params: { date } });
    return response.data;
  },

  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  updateReservation: async (id, reservationData) => {
    const response = await api.put(`/reservations/${id}`, reservationData);
    return response.data;
  },

  cancelReservation: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },

  getAvailableTables: async (date, time, partySize) => {
    const response = await api.get('/reservations/available-tables', {
      params: { date, time, partySize }
    });
    return response.data;
  },
};

export default api;
