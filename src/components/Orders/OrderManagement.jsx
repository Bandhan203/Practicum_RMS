import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchOrders, 
  updateOrderStatus, 
  removeItemFromOrder,
  createOrder,
  deleteOrder,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError 
} from '../../store/features/orderSlice';
import { 
  fetchMenuItems
} from '../../store/features/menuSlice';
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
  Mail,
  Plus
} from '../common/Icons';
import { format } from 'date-fns';
import { AddOrderModal } from './AddOrderModal';

export function OrderManagement({ readOnly = false }) {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  
  const isReadOnly = readOnly; // Admin has full access
  
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrderType, setSelectedOrderType] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showItemDeleteConfirm, setShowItemDeleteConfirm] = useState(false);
  const [pendingItemDelete, setPendingItemDelete] = useState(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderType: 'dine-in',
    tableNumber: '',
    pickupTime: '',
    items: [],
    notes: ''
  });

  // Fetch orders and menu items on component mount
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchMenuItems());
  }, [dispatch]);

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true;
    return order.status === selectedStatus;
  }).filter(order => {
    if (selectedOrderType === 'all') return true;
    return order.order_type === selectedOrderType;
  });

  // Handle order status changes with confirmation for cancel/delete actions
  const handleOrderAction = (orderId, action) => {
    if (action === 'cancelled' || action === 'delete') {
      // Show confirmation for cancel/delete actions
      setPendingAction({ orderId, action });
      setShowDeleteConfirm(true);
    } else {
      // For non-destructive actions, proceed normally
      dispatch(updateOrderStatus({ id: orderId, status: action }));
    }
  };

  // Handle individual item deletion from cart
  const handleItemDelete = (orderId, itemIndex) => {
    setPendingItemDelete({ orderId, itemIndex });
    setShowItemDeleteConfirm(true);
  };

  const confirmItemDelete = () => {
    if (pendingItemDelete) {
      dispatch(removeItemFromOrder(pendingItemDelete));
    }
    setPendingItemDelete(null);
    setShowItemDeleteConfirm(false);
  };

  const cancelItemDelete = () => {
    setPendingItemDelete(null);
    setShowItemDeleteConfirm(false);
  };

  const confirmDeleteAction = () => {
    if (pendingAction) {
      if (pendingAction.action === 'delete') {
        dispatch(deleteOrder(pendingAction.orderId));
      } else {
        dispatch(updateOrderStatus({ id: pendingAction.orderId, status: pendingAction.action }));
      }
      setPendingAction(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDeleteAction = () => {
    setPendingAction(null);
    setShowDeleteConfirm(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'preparing': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'served': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOrderTypeIcon = (orderType) => {
    switch (orderType) {
      case 'dine-in': return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'pickup': return <Package className="w-4 h-4 text-orange-500" />;
      default: return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOrderTypeColor = (orderType) => {
    switch (orderType) {
      case 'dine-in': return 'bg-blue-100 text-blue-800';
      case 'pickup': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-green-200 text-green-900';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return ['preparing', 'cancelled'];
      case 'preparing':
        return ['ready', 'cancelled'];
      case 'ready':
        return ['served'];
      default:
        return [];
    }
  };

  // Role-based order update permission
  const canUpdateOrders = !isReadOnly;

  // Add Order Modal Functions
  const handleAddOrder = async (e) => {
    e.preventDefault();
    
    if (!newOrder.customerName || newOrder.items.length === 0) {
      return;
    }

    try {
      const orderData = {
        customerName: newOrder.customerName,
        customerEmail: newOrder.customerEmail,
        customerPhone: newOrder.customerPhone,
        orderType: newOrder.orderType,
        tableNumber: newOrder.orderType === 'dine-in' ? parseInt(newOrder.tableNumber) || null : null,
        pickupTime: newOrder.orderType === 'pickup' ? newOrder.pickupTime : null,
        items: newOrder.items,
        notes: newOrder.notes
      };

      await dispatch(createOrder(orderData)).unwrap();
      
      // Reset form and close modal
      setNewOrder({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        orderType: 'dine-in',
        tableNumber: '',
        pickupTime: '',
        items: [],
        notes: ''
      });
      setShowAddOrderModal(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      // You could add error handling UI here
    }
  };

  const addItemToOrder = (menuItem) => {
    const existingItemIndex = newOrder.items.findIndex(item => item.id === menuItem.id);
    
    if (existingItemIndex >= 0) {
      // Item already exists, increase quantity
      updateItemQuantity(existingItemIndex, newOrder.items[existingItemIndex].quantity + 1);
    } else {
      // Add new item
      setNewOrder(prev => ({
        ...prev,
        items: [...prev.items, { ...menuItem, quantity: 1 }]
      }));
    }
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(index);
      return;
    }

    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const removeItemFromOrder = (index) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {isReadOnly ? 'View Orders' : 'Order Management'}
            </h1>
            {!isReadOnly && (
              <button
                onClick={() => setShowAddOrderModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Order</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={selectedOrderType}
              onChange={(e) => setSelectedOrderType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="dine-in">Dine In</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">Order #{order.id}</h3>
                    {order.order_type && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderTypeColor(order.order_type)}`}>
                        {getOrderTypeIcon(order.order_type)}
                        <span className="ml-1">{order.order_type === 'dine-in' ? 'Dine In' : 'Pickup'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.created_at ? format(new Date(order.created_at), 'PPp') : 'Just now'}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50">
                    {getStatusIcon(order.status)}
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="px-6 pb-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-600 flex-1 truncate">{order.customer_name}</span>
                </div>
                {order.order_type === 'dine-in' && order.table_number && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600 flex-1">Table {order.table_number}</span>
                  </div>
                )}
                {order.order_type === 'pickup' && order.customer_phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600 flex-1">{order.customer_phone}</span>
                  </div>
                )}
                {order.order_type === 'pickup' && order.customer_email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600 flex-1 truncate">{order.customer_email}</span>
                  </div>
                )}
                {order.order_type === 'pickup' && order.pickup_time && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600 flex-1">Pickup: {format(new Date(order.pickup_time), 'h:mm a')}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-600 flex-1 font-medium">৳ {order.total_amount}</span>
                </div>
                {order.estimated_time && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600 flex-1">Est. {order.estimated_time} min</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 pb-4 flex-1">
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Items <span className='text-gray-400'>({order.order_items?.length || 0})</span></h4>
                <div className="space-y-1 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded group hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="w-5 h-5 bg-gray-100 text-gray-700 rounded flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {item.quantity}
                        </span>
                        <span className="text-xs text-gray-900 truncate">{item.item_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-800 whitespace-nowrap">৳ {item.subtotal}</span>
                        <button
                          onClick={() => handleItemDelete(order.id, idx)}
                          data-action="delete"
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all delete-btn"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="px-6 pb-4">
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Special Instructions:</strong> {order.specialInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {canUpdateOrders && getAvailableActions(order.status).length > 0 && (
              <div className="p-6 pt-0 mt-auto order-status-actions">
                <div className={`grid gap-2 ${getAvailableActions(order.status).length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {getAvailableActions(order.status).map((action) => (
                    <button
                      key={action}
                      onClick={() => handleOrderAction(order.id, action)}
                      data-action={action === 'cancelled' ? 'delete' : action}
                      className={`py-2.5 px-4 rounded-md text-sm font-medium transition-colors text-center focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        action === 'cancelled' 
                          ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 delete-btn' 
                          : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                      }`}
                    >
                      {action === 'preparing' && 'Start Preparing'}
                      {action === 'ready' && 'Mark Ready'}
                      {action === 'served' && 'Mark Served'}
                      {action === 'cancelled' && 'Cancel'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">No orders match your current filter criteria.</p>
        </div>
      )}

      {/* Order-Specific Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full text-center border border-red-300">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-xl font-bold mb-4 text-red-600">Cancel Order?</div>
            <div className="text-lg mb-2 text-gray-700">Are you sure you want to cancel this order?</div>
            <div className="mb-6 text-sm text-red-500 font-medium">This action cannot be undone!</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
                onClick={confirmDeleteAction}
              >
                Yes, Cancel Order
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                onClick={cancelDeleteAction}
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Delete Confirmation Modal */}
      {showItemDeleteConfirm && (
        <div className="fixed inset-0 z-[99997] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full text-center border border-red-300">
            <div className="text-4xl mb-4">🗑️</div>
            <div className="text-xl font-bold mb-4 text-red-600">Remove Item?</div>
            <div className="text-lg mb-2 text-gray-700">Are you sure you want to remove this item from the order?</div>
            <div className="mb-6 text-sm text-red-500 font-medium">This action cannot be undone!</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
                onClick={confirmItemDelete}
              >
                Yes, Remove Item
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                onClick={cancelItemDelete}
              >
                Keep Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {!isReadOnly && (
        <AddOrderModal
          showModal={showAddOrderModal}
          onClose={() => setShowAddOrderModal(false)}
          newOrder={newOrder}
          setNewOrder={setNewOrder}
          onSubmit={handleAddOrder}
        />
      )}
        </>
      )}
    </div>
  );
}
