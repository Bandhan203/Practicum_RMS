import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useMenuService } from '../../services/menuService';
import { useOrderService } from '../../services/orderService';
import { SimpleAddOrderModal } from './SimpleAddOrderModal';
import toast from 'react-hot-toast';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  DollarSign,
  Trash2,
  Package,
  Phone,
  Plus,
  Edit
} from 'lucide-react';

export function SimpleOrderManagement({ readOnly = false }) {
  const { menuItems } = useMenuService();
  const {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getOrdersByStatus,
    getTodaysOrders,
    stats
  } = useOrderService();
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const isReadOnly = readOnly;

  // Mock orders data if none exist
  const mockOrders = [
    {
      id: 'ORD-001',
      customerName: 'John Doe',
      customerPhone: '+880-1234567890',
      items: [
        { name: 'Chicken Burger', price: 12.99, quantity: 2 },
        { name: 'French Fries', price: 4.99, quantity: 1 }
      ],
      totalAmount: 30.97,
      status: 'pending',
      orderType: 'dine-in',
      tableNumber: 'T-05',
      createdAt: new Date(),
      notes: 'No onions please'
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Wilson',
      customerPhone: '+880-9876543210',
      items: [
        { name: 'Caesar Salad', price: 8.99, quantity: 1 },
        { name: 'Iced Tea', price: 3.49, quantity: 1 }
      ],
      totalAmount: 12.48,
      status: 'preparing',
      orderType: 'takeout',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    }
  ];

  const displayOrders = orders && orders.length > 0 ? orders : mockOrders;

  const filteredOrders = displayOrders.filter(order => {
    if (selectedStatus === 'all') return true;
    return order.status === selectedStatus;
  });

  const handleCreateOrder = async (orderData) => {
    // Create order using the service
    const result = await createOrder(orderData);

    if (result.success) {
      setShowAddOrderModal(false);
    }
    // Toast notifications are handled by the service
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Update order status using the service
    const result = await updateOrderStatus(orderId, newStatus);
    // Toast notifications are handled by the service
  };

  const handleDeleteClick = (order) => {
    setPendingDelete(order);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      // Delete order using the service
      const result = await deleteOrder(pendingDelete.id);
      // Toast notifications are handled by the service
    }
    setPendingDelete(null);
    setShowDeleteConfirm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      preparing: <Package className="w-4 h-4" />,
      ready: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.pending;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isReadOnly ? 'View Orders' : 'Order Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isReadOnly ? 'View and track customer orders.' : 'Manage customer orders and track their status.'}
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setShowAddOrderModal(true)}
            className="bg-brand-dark text-white px-6 py-2 rounded-lg hover:bg-brand-light focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 flex items-center space-x-2 shadow-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 group"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span className="transition-all duration-300 group-hover:tracking-wide">New Order</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['pending', 'preparing', 'ready', 'completed'].map((status) => (
          <div key={status} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 capitalize">{status}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredOrders.filter(order => order.status === status).length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-dark focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {displayOrders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Order Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{order.order_number || order.id}</h3>
                  <p className="text-sm text-gray-600">{new Date(order.created_at || order.createdAt).toLocaleString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </div>
              </div>
            </div>

            {/* Order Content */}
            <div className="p-4 space-y-4">
              {/* Customer Info */}
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{order.customer_name || order.customerName}</p>
                  {(order.customer_phone || order.customerPhone) && (
                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{order.customer_phone || order.customerPhone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium capitalize">{order.order_type || order.orderType}</span>
                </div>
                {(order.table_number || order.tableNumber) && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Table:</span>
                    <span className="text-sm font-medium">{order.table_number || order.tableNumber}</span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {(order.order_items || order.orderItems || order.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{item.quantity}x {item.item_name || item.name}</span>
                      <span>৳{(item.item_price || item.price) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total:</span>
                  <span className="font-bold text-brand-dark">৳{parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-yellow-50 p-2 rounded text-xs">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}
            </div>

            {/* Order Actions */}
            {!isReadOnly && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(order)}
                    className="bg-red-100 text-red-600 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {selectedStatus === 'all'
              ? "No orders have been created yet."
              : `No orders with status "${selectedStatus}" found.`
            }
          </p>
        </div>
      )}

      {/* Add Order Modal */}
      <SimpleAddOrderModal
        showModal={showAddOrderModal}
        onClose={() => setShowAddOrderModal(false)}
        onSubmit={handleCreateOrder}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full text-center border border-red-300">
            <div className="text-4xl mb-4">🗑️</div>
            <div className="text-xl font-bold mb-4 text-red-600">Delete Order?</div>
            <div className="text-lg mb-2 text-gray-700">
              Are you sure you want to delete order <span className="font-semibold text-gray-900">{pendingDelete?.id}</span>?
            </div>
            <div className="mb-6 text-sm text-red-500 font-medium">This action cannot be undone!</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
                onClick={confirmDelete}
              >
                Yes, Delete Order
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
