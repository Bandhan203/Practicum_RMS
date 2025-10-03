import React from 'react';
import { orderAPI } from './api';
import toast from 'react-hot-toast';

/**
 * Simple Order Service
 * Handles all order-related database operations independently
 */
class OrderService {
  constructor() {
    this.orders = [];
    this.loading = false;
    this.listeners = [];
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(listener => listener(this.orders, this.loading));
  }

  // Get all orders from backend
  async getOrders() {
    this.loading = true;
    this.notify();

    try {
      console.log('OrderService: Fetching orders from backend...');
      const response = await orderAPI.getOrders();

      if (response.data) {
        this.orders = response.data;
        console.log('OrderService: Successfully loaded', this.orders.length, 'orders');
      } else {
        this.orders = [];
        console.log('OrderService: No orders found');
      }

      return { success: true, data: this.orders };
    } catch (error) {
      console.error('OrderService: Error fetching orders:', error);
      // Don't show error toast for orders as they might not exist yet
      this.orders = [];
      return { success: false, error: error.message };
    } finally {
      this.loading = false;
      this.notify();
    }
  }

  // Create new order
  async createOrder(orderData) {
    try {
      console.log('OrderService: Creating new order:', orderData);

      // Prepare order data for backend (using camelCase as expected by backend)
      const orderForBackend = {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail || '',
        orderType: orderData.orderType,
        tableNumber: orderData.tableNumber || null,
        notes: orderData.notes || '',
        items: orderData.items.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await orderAPI.createOrder(orderForBackend);

      if (response.data) {
        // Add to local array
        this.orders.unshift(response.data);
        this.notify();

        console.log('OrderService: Successfully created order:', response.data);
        toast.success('Order created successfully!');
        return { success: true, data: response.data };
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('OrderService: Error creating order:', error);
      const errorMessage = this.getErrorMessage(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Update order status
  async updateOrderStatus(id, status) {
    try {
      console.log('OrderService: Updating order status:', id, status);
      const response = await orderAPI.updateOrder(id, { status });

      if (response.data) {
        // Update in local array
        this.orders = this.orders.map(order =>
          order.id === id ? { ...order, status } : order
        );
        this.notify();

        console.log('OrderService: Successfully updated order status:', response.data);
        toast.success(`Order status updated to ${status}`);
        return { success: true, data: response.data };
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('OrderService: Error updating order:', error);
      const errorMessage = this.getErrorMessage(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Delete order
  async deleteOrder(id) {
    try {
      console.log('OrderService: Deleting order:', id);
      const response = await orderAPI.deleteOrder(id);

      // Remove from local array
      this.orders = this.orders.filter(order => order.id !== id);
      this.notify();

      console.log('OrderService: Successfully deleted order:', id);
      toast.success('Order deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('OrderService: Error deleting order:', error);
      const errorMessage = this.getErrorMessage(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Get single order by ID
  getOrder(id) {
    return this.orders.find(order => order.id === id);
  }

  // Get orders by status
  getOrdersByStatus(status) {
    if (status === 'all') return this.orders;
    return this.orders.filter(order => order.status === status);
  }

  // Get orders by type
  getOrdersByType(type) {
    if (type === 'all') return this.orders;
    return this.orders.filter(order => order.order_type === type);
  }

  // Get today's orders
  getTodaysOrders() {
    const today = new Date().toDateString();
    return this.orders.filter(order => {
      const orderDate = new Date(order.created_at).toDateString();
      return orderDate === today;
    });
  }

  // Get order statistics
  getOrderStats() {
    const total = this.orders.length;
    const pending = this.orders.filter(o => o.status === 'pending').length;
    const preparing = this.orders.filter(o => o.status === 'preparing').length;
    const ready = this.orders.filter(o => o.status === 'ready').length;
    const completed = this.orders.filter(o => o.status === 'completed').length;
    const cancelled = this.orders.filter(o => o.status === 'cancelled').length;

    const totalRevenue = this.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

    return {
      total,
      pending,
      preparing,
      ready,
      completed,
      cancelled,
      totalRevenue
    };
  }

  // Helper method to extract error messages
  getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors);
      return errors.flat().join(', ');
    }
    return error.message || 'An error occurred';
  }

  // Get current state
  getCurrentState() {
    return {
      orders: this.orders,
      loading: this.loading,
      stats: this.getOrderStats()
    };
  }
}

// Create a singleton instance
const orderService = new OrderService();

// Export the service
export default orderService;

// Export hook for React components
export const useOrderService = () => {
  const [state, setState] = React.useState(orderService.getCurrentState());

  React.useEffect(() => {
    const unsubscribe = orderService.subscribe((orders, loading) => {
      setState({
        orders,
        loading,
        stats: orderService.getOrderStats()
      });
    });

    // Load orders on mount
    orderService.getOrders();

    return unsubscribe;
  }, []);

  return {
    ...state,

    // Actions
    createOrder: orderService.createOrder.bind(orderService),
    updateOrderStatus: orderService.updateOrderStatus.bind(orderService),
    deleteOrder: orderService.deleteOrder.bind(orderService),
    getOrder: orderService.getOrder.bind(orderService),
    getOrdersByStatus: orderService.getOrdersByStatus.bind(orderService),
    getOrdersByType: orderService.getOrdersByType.bind(orderService),
    getTodaysOrders: orderService.getTodaysOrders.bind(orderService),
    refreshOrders: orderService.getOrders.bind(orderService)
  };
};
