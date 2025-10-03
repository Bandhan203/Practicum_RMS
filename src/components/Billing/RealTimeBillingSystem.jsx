// Enhanced Billing System with Real-Time Backend Integration
// Connected to Order Management and Real-Time Data Context

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  RefreshCw,
  Download,
  Receipt,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import billingAPI from '../../services/billingAPI';
import { useRealTimeData } from '../../contexts/RealTimeDataContext';
import { generateBillReceipt, downloadBillReceipt, printBillReceipt, printInvoice } from '../common/pdfGenerator';

function BillCard({ bill, onView, onPayment, onPrint, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'generated': 'bg-blue-100 text-blue-800',
      'paid': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'partially_paid': 'bg-blue-100 text-blue-800',
      'refunded': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{bill.bill_number}</h3>
          <p className="text-sm text-gray-600">{bill.customer_name}</p>
          <p className="text-sm text-gray-500">{bill.table_number || bill.order_type}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
            {bill.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(bill.payment_status)}`}>
            {bill.payment_status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Total:</span>
          <span className="font-medium ml-2">${bill.total_amount}</span>
        </div>
        <div>
          <span className="text-gray-500">Paid:</span>
          <span className="font-medium ml-2">${bill.paid_amount}</span>
        </div>
        <div>
          <span className="text-gray-500">Payment:</span>
          <span className="font-medium ml-2">{bill.payment_method}</span>
        </div>
        <div>
          <span className="text-gray-500">Date:</span>
          <span className="font-medium ml-2">
            {new Date(bill.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onView(bill)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </button>

        {bill.payment_status === 'pending' && (
          <button
            onClick={() => onPayment(bill)}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-1" />
            Pay
          </button>
        )}

        <button
          onClick={() => onPrint(bill)}
          className="bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <Printer className="w-4 h-4" />
        </button>

        {bill.status === 'draft' && (
          <button
            onClick={() => onDelete(bill)}
            className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onGenerateBill, isSelected }) {
  const calculateTotal = (items) => {
    return items?.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2) || '0.00';
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      }`}
      onClick={() => onGenerateBill(order)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">
            {order.table_number || `${order.order_type} Order`}
          </h4>
          <p className="text-sm text-gray-600">{order.customer_name}</p>
          <p className="text-sm text-gray-500">
            {order.items?.length || 0} items • ${calculateTotal(order.items)}
          </p>
        </div>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          {order.status}
        </span>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Created: {new Date(order.created_at).toLocaleString()}
      </div>

      <button className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center">
        <Plus className="w-4 h-4 mr-1" />
        Generate Bill
      </button>
    </div>
  );
}

export function RealTimeBillingSystem() {
  // State management
  const [bills, setBills] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showGenerateBillModal, setShowGenerateBillModal] = useState(false);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'cash',
    reference: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    payment_status: 'all',
    search: '',
    date_from: '',
    date_to: ''
  });

  // Statistics
  const [statistics, setStatistics] = useState({});

  // Real-time data context
  const { updateOrdersData, api } = useRealTimeData();

  // Load initial data
  useEffect(() => {
    loadBills();
    loadCompletedOrders();
    loadStatistics();
  }, [filters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadBills();
      loadCompletedOrders();
      loadStatistics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Load bills from backend
  const loadBills = async () => {
    setLoading(true);
    try {
      const result = await billingAPI.getBills(filters);
      if (result.success) {
        setBills(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  // Load completed orders without bills
  const loadCompletedOrders = async () => {
    try {
      const result = await billingAPI.getCompletedOrders();
      if (result.success) {
        setCompletedOrders(result.data);
      }
    } catch (err) {
      console.error('Failed to load completed orders:', err);
    }
  };

  // Load billing statistics
  const loadStatistics = async () => {
    try {
      const result = await billingAPI.getBillingStatistics();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  // Generate bill from order
  const handleGenerateBill = async (order) => {
    setLoading(true);
    try {
      const billData = {
        order_id: order.id,
        payment_method: 'cash',
        tax_rate: 8.0,
        discount_amount: 0,
        service_charge: 0,
        notes: ''
      };

      const result = await billingAPI.generateBill(billData);
      if (result.success) {
        await loadBills();
        await loadCompletedOrders();
        setSelectedOrder(null);
        alert('Bill generated successfully!');
      } else {
        alert(`Failed to generate bill: ${result.error}`);
      }
    } catch (err) {
      alert('Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  // Process payment
  const handlePayment = async (bill) => {
    setSelectedBill(bill);
    setPaymentForm({
      amount: bill.total_amount.toString(),
      method: bill.payment_method || 'cash',
      reference: ''
    });
    setShowPaymentModal(true);
  };

  // Submit payment
  const submitPayment = async () => {
    if (!selectedBill) return;

    // Validate payment amount
    const paidAmount = parseFloat(paymentForm.amount);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        paid_amount: paidAmount,
        payment_method: paymentForm.method,
        payment_reference: paymentForm.reference || ''
      };

      console.log('Processing payment:', paymentData);
      console.log('For bill:', selectedBill);

      const result = await billingAPI.processPayment(selectedBill.id, paymentData);
      console.log('Payment result:', result);

      if (result.success) {
        await loadBills();
        setShowPaymentModal(false);
        setSelectedBill(null);

        const changeAmount = result.changeAmount || 0;

        // Generate and print invoice
        await generateInvoice(result.data);

        if (changeAmount > 0) {
          alert(`✅ Payment processed successfully!\n💰 Change: $${changeAmount.toFixed(2)}\n📄 Invoice generated and ready to print!`);
        } else {
          alert('✅ Payment processed successfully!\n📄 Invoice generated and ready to print!');
        }
      } else {
        console.error('Payment failed:', result);
        setError(result.error || 'Payment processing failed');
        alert(`❌ Payment failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError('Failed to process payment');
      alert(`❌ Failed to process payment: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate Invoice
  const generateInvoice = async (bill) => {
    try {
      // Find the related order for the bill
      const relatedOrder = completedOrders.find(order => order.id === bill.order_id);

      // Generate and print invoice
      printInvoice(bill, relatedOrder);

      // Mark bill as printed
      await billingAPI.markBillAsPrinted(bill.id);

    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert('Failed to generate invoice');
    }
  };

  // Print bill
  const handlePrint = async (bill) => {
    try {
      // Find the related order for the bill
      const relatedOrder = completedOrders.find(order => order.id === bill.order_id);

      // Print the bill receipt
      printBillReceipt(bill, relatedOrder);

      // Mark as printed
      await billingAPI.markBillAsPrinted(bill.id);
      await loadBills();
    } catch (err) {
      alert('Failed to print bill');
    }
  };

  // View bill details
  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowBillModal(true);
  };

  // Delete bill
  const handleDeleteBill = async (bill) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    setLoading(true);
    try {
      const result = await billingAPI.deleteBill(bill.id);
      if (result.success) {
        await loadBills();
        alert('Bill deleted successfully');
      } else {
        alert(`Failed to delete bill: ${result.error}`);
      }
    } catch (err) {
      alert('Failed to delete bill');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    loadBills();
    loadCompletedOrders();
    loadStatistics();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Dine POS - Billing System</h1>
            <p className="text-gray-600">Generate bills and process payments with real-time data</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${statistics.today_revenue || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Bills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.today_bills || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Bills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.pending_bills || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Bills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.paid_bills || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">Error: {error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Completed Orders Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Completed Orders ({completedOrders.length})
              </h2>
              <p className="text-sm text-gray-600">Orders ready for billing</p>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {completedOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No completed orders available
                </div>
              ) : (
                completedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onGenerateBill={handleGenerateBill}
                    isSelected={selectedOrder?.id === order.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bills Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Bills ({bills.length})
                </h2>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="generated">Generated</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                  <select
                    value={filters.payment_status}
                    onChange={(e) => setFilters({...filters, payment_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Payments</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {loading && bills.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                  <span className="text-gray-600">Loading bills...</span>
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No bills found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bills.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      onView={handleViewBill}
                      onPayment={handlePayment}
                      onPrint={handlePrint}
                      onDelete={handleDeleteBill}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Process Payment</h3>
            <p className="text-gray-600 mb-4">
              Bill: {selectedBill.bill_number} - ${selectedBill.total_amount}
            </p>

            <div className="space-y-4">
              {/* Bill Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Bill Amount:</span>
                  <span className="text-lg font-bold text-gray-900">${selectedBill.total_amount}</span>
                </div>
                {selectedBill.paid_amount > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Already Paid:</span>
                    <span className="text-sm text-gray-600">${selectedBill.paid_amount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-300">
                  <span className="text-sm font-medium text-gray-700">Amount Due:</span>
                  <span className="text-lg font-bold text-red-600">${(selectedBill.total_amount - (selectedBill.paid_amount || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount received"
                />
                {parseFloat(paymentForm.amount) > 0 && parseFloat(paymentForm.amount) < (selectedBill.total_amount - (selectedBill.paid_amount || 0)) && (
                  <p className="text-yellow-600 text-sm mt-1">⚠️ Partial payment - remaining balance will be due</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="digital">Digital Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Transaction ID, Receipt #, etc."
                />
              </div>

              {/* Change Calculation */}
              {parseFloat(paymentForm.amount) > (selectedBill.total_amount - (selectedBill.paid_amount || 0)) && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">💰 Change to Return:</span>
                    <span className="text-green-800 font-bold text-lg">
                      ${(parseFloat(paymentForm.amount) - (selectedBill.total_amount - (selectedBill.paid_amount || 0))).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 text-sm">❌ {error}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={submitPayment}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Process Payment'}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
