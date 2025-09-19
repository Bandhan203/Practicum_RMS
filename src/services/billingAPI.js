// Billing API Service - Connected to Backend
// Real-time integration with Order Management System

import api from './api.js';

class BillingAPI {
  constructor() {
    this.baseURL = '/bills';
  }

  /**
   * Get all bills with filtering options
   */
  async getBills(filters = {}) {
    try {
      const response = await api.get(this.baseURL, { params: filters });
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        meta: {}
      };
    }
  }

  /**
   * Get completed orders that don't have bills yet
   */
  async getCompletedOrders() {
    try {
      const response = await api.get(`${this.baseURL}/completed-orders`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to fetch completed orders:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  }

  /**
   * Get a specific bill by ID
   */
  async getBill(billId) {
    try {
      const response = await api.get(`${this.baseURL}/${billId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to fetch bill:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  /**
   * Generate a new bill from an order
   */
  async generateBill(billData) {
    try {
      const response = await api.post(this.baseURL, billData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to generate bill:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  /**
   * Update an existing bill
   */
  async updateBill(billId, billData) {
    try {
      const response = await api.put(`${this.baseURL}/${billId}`, billData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to update bill:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  /**
   * Process payment for a bill
   */
  async processPayment(billId, paymentData) {
    try {
      const response = await api.post(`${this.baseURL}/${billId}/payment`, paymentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        changeAmount: response.data.change_amount
      };
    } catch (error) {
      console.error('Failed to process payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  /**
   * Mark bill as printed
   */
  async markBillAsPrinted(billId) {
    try {
      const response = await api.post(`${this.baseURL}/${billId}/mark-printed`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to mark bill as printed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Delete a bill (only draft/cancelled bills)
   */
  async deleteBill(billId) {
    try {
      const response = await api.delete(`${this.baseURL}/${billId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to delete bill:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get billing statistics
   */
  async getBillingStatistics(dateRange = {}) {
    try {
      const response = await api.get(`${this.baseURL}/statistics`, { params: dateRange });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to fetch billing statistics:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {}
      };
    }
  }

  /**
   * Get bills for today
   */
  async getTodayBills() {
    const today = new Date().toISOString().split('T')[0];
    return this.getBills({
      date_from: today,
      date_to: today
    });
  }

  /**
   * Get pending bills
   */
  async getPendingBills() {
    return this.getBills({
      payment_status: 'pending'
    });
  }

  /**
   * Get paid bills
   */
  async getPaidBills() {
    return this.getBills({
      payment_status: 'paid'
    });
  }

  /**
   * Calculate bill totals from order
   */
  calculateBillTotals(orderItems, options = {}) {
    const {
      taxRate = 8.0,
      discountAmount = 0,
      serviceCharge = 0
    } = options;

    // Calculate subtotal
    const subtotal = orderItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Calculate tax
    const taxAmount = (subtotal * taxRate) / 100;

    // Calculate total
    const totalAmount = subtotal + taxAmount + serviceCharge - discountAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxRate: parseFloat(taxRate.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  /**
   * Format bill number
   */
  formatBillNumber(billNumber) {
    return billNumber || 'N/A';
  }

  /**
   * Get bill status color
   */
  getBillStatusColor(status) {
    const colors = {
      'draft': 'gray',
      'generated': 'blue',
      'paid': 'green',
      'cancelled': 'red',
      'refunded': 'yellow'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status) {
    const colors = {
      'pending': 'yellow',
      'paid': 'green',
      'partially_paid': 'blue',
      'refunded': 'red'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get payment methods list
   */
  getPaymentMethods() {
    return [
      { value: 'cash', label: 'Cash', icon: '💵' },
      { value: 'card', label: 'Card', icon: '💳' },
      { value: 'digital', label: 'Digital Wallet', icon: '📱' },
      { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' }
    ];
  }

  /**
   * Validate payment amount
   */
  validatePayment(paidAmount, totalAmount) {
    const errors = [];

    if (!paidAmount || paidAmount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (paidAmount < 0) {
      errors.push('Payment amount cannot be negative');
    }

    // Calculate change
    const changeAmount = Math.max(0, paidAmount - totalAmount);

    return {
      isValid: errors.length === 0,
      errors,
      changeAmount: parseFloat(changeAmount.toFixed(2))
    };
  }

  /**
   * Generate bill preview data
   */
  generateBillPreview(order, options = {}) {
    if (!order || !order.items) {
      return null;
    }

    const totals = this.calculateBillTotals(order.items, options);

    return {
      billNumber: 'PREVIEW',
      order: order,
      customer: {
        name: order.customer_name || 'Walk-in Customer',
        email: order.customer_email,
        phone: order.customer_phone
      },
      orderDetails: {
        type: order.order_type,
        tableNumber: order.table_number,
        waiter: order.waiter_name
      },
      items: order.items.map(item => ({
        name: item.name || item.menu_item?.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      totals,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export bill data for printing
   */
  prepareBillForPrint(bill) {
    if (!bill) return null;

    return {
      ...bill,
      formattedBillNumber: this.formatBillNumber(bill.bill_number),
      formattedTotal: this.formatCurrency(bill.total_amount),
      formattedSubtotal: this.formatCurrency(bill.subtotal),
      formattedTax: this.formatCurrency(bill.tax_amount),
      formattedDiscount: this.formatCurrency(bill.discount_amount),
      formattedServiceCharge: this.formatCurrency(bill.service_charge),
      formattedPaidAmount: this.formatCurrency(bill.paid_amount),
      formattedChangeAmount: this.formatCurrency(bill.change_amount),
      printTimestamp: new Date().toLocaleString()
    };
  }

  /**
   * Get date range filters
   */
  getDateRangeFilters() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      today: { date_from: today, date_to: today, label: 'Today' },
      yesterday: { date_from: yesterday, date_to: yesterday, label: 'Yesterday' },
      week: { date_from: weekAgo, date_to: today, label: 'Last 7 Days' },
      month: { date_from: monthAgo, date_to: today, label: 'Last 30 Days' }
    };
  }
}

// Create and export singleton instance
const billingAPI = new BillingAPI();
export default billingAPI;