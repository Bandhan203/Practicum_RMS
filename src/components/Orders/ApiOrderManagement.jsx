import React, { useState, useEffect } from 'react';
import { useApiApp } from '../../contexts/ApiAppContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  MapPin,
  DollarSign,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

export function ApiOrderManagement() {
  const { 
    orders, 
    updateOrderStatus, 
    cancelOrder, 
    removeItemFromOrder,
    getLoadingState,
    getError,
    hasError,
    clearError,
    apiConnected,
    retryOperation
  } = useApiApp();

  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showItemDeleteConfirm, setShowItemDeleteConfirm] = useState(false);
  const [pendingItemDelete, setPendingItemDelete] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Loading states
  const isLoading = getLoadingState('orders');
  const error = getError('orders');

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  // Handle order status changes with confirmation for cancel/delete actions
  const handleOrderAction = async (orderId, action) => {
    if (action === 'cancelled') {
      // Show confirmation for cancel (delete-like) actions
      setPendingAction({ orderId, action });
      setShowDeleteConfirm(true);
    } else {
      // For non-destructive actions, proceed normally
      try {
        const result = await retryOperation(() => updateOrderStatus(orderId, action));
        if (!result.success) {
          console.error('Failed to update order status:', result.error);
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    }
  };

  // Handle individual item deletion from cart
  const handleItemDelete = (orderId, itemIndex) => {
    setPendingItemDelete({ orderId, itemIndex });
    setShowItemDeleteConfirm(true);
  };

  const confirmItemDelete = async () => {
    if (pendingItemDelete) {
      try {
        const result = await retryOperation(() => 
          removeItemFromOrder(pendingItemDelete.orderId, pendingItemDelete.itemIndex)
        );
        if (!result.success) {
          console.error('Failed to remove item from order:', result.error);
        }
      } catch (error) {
        console.error('Error removing item from order:', error);
      }
    }
    setPendingItemDelete(null);
    setShowItemDeleteConfirm(false);
  };

  const confirmOrderAction = async () => {
    if (pendingAction) {
      try {
        let result;
        if (pendingAction.action === 'cancelled') {
          result = await retryOperation(() => cancelOrder(pendingAction.orderId));
        } else {
          result = await retryOperation(() => updateOrderStatus(pendingAction.orderId, pendingAction.action));
        }
        
        if (!result.success) {
          console.error('Failed to perform order action:', result.error);
        }
      } catch (error) {
        console.error('Error performing order action:', error);
      }
    }
    setPendingAction(null);
    setShowDeleteConfirm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      preparing: 'bg-blue-100 text-blue-800 border-blue-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      served: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: AlertCircle,
      preparing: Clock,
      ready: CheckCircle,
      served: CheckCircle,
      cancelled: XCircle
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon size={16} />;
  };

  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Connection status component
  const ConnectionStatus = () => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
      apiConnected 
        ? 'bg-green-100 text-green-700' 
        : 'bg-yellow-100 text-yellow-700'
    }`}>
      {apiConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span>{apiConnected ? 'API Connected' : 'Using Local Data'}</span>
    </div>
  );

  // Error handling component
  const ErrorAlert = () => {
    if (!hasError('orders')) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span className="font-medium">Error Loading Orders</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={() => {
            clearError('orders');
            // Trigger a refresh of orders data
          }}
          className="mt-2 flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all restaurant orders</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw size={16} className="animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>
      </div>

      <ErrorAlert />

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'preparing', 'ready', 'served', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filterStatus === status
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All Orders' : status}
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
              {status === 'all' 
                ? orders.length 
                : orders.filter(order => order.status === status).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? 'No orders have been placed yet.' 
                : `No ${filterStatus} orders found.`
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={16} />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span>Table {order.tableNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={16} />
                      <span className="font-medium">${order.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span>{format(new Date(order.createdAt), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Items ({order.items?.length || 0})</h4>
                      <button
                        onClick={() => showOrderDetailsModal(order)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                    <div className="space-y-2">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{item.menuItemName}</span>
                            <span className="text-gray-600 ml-2">x{item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleItemDelete(order.id, index)}
                                disabled={isLoading}
                                className="p-1 text-red-600 hover:bg-red-100 rounded order-status-actions disabled:opacity-50"
                                title="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="text-sm text-gray-600 text-center py-2">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {order.specialInstructions && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">Special Instructions:</span>
                      <p className="text-sm text-blue-800 mt-1">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 lg:ml-6">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleOrderAction(order.id, 'preparing')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Clock size={16} />
                        Start Preparing
                      </button>
                      <button
                        onClick={() => handleOrderAction(order.id, 'cancelled')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors order-status-actions disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {order.status === 'preparing' && (
                    <>
                      <button
                        onClick={() => handleOrderAction(order.id, 'ready')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        Mark Ready
                      </button>
                      <button
                        onClick={() => handleOrderAction(order.id, 'cancelled')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors order-status-actions disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleOrderAction(order.id, 'served')}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Mark Served
                    </button>
                  )}

                  {(order.status === 'served' || order.status === 'cancelled') && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      Order {order.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{selectedOrder.id} Details
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Customer:</span>
                  <p className="text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Table:</span>
                  <p className="text-gray-900">Table {selectedOrder.tableNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Order Time:</span>
                  <p className="text-gray-900">{format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              {/* All Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{item.menuItemName}</span>
                        <span className="text-gray-600 ml-2">x{item.quantity}</span>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-red-600">
                      ${selectedOrder.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.specialInstructions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {selectedOrder.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Order Cancellation
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel Order #{pendingAction?.orderId}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setPendingAction(null);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={confirmOrderAction}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading && <RefreshCw size={16} className="animate-spin" />}
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Delete Confirmation Modal */}
      {showItemDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Remove Item from Order
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this item from the order? This will update the order total.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setPendingItemDelete(null);
                  setShowItemDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmItemDelete}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading && <RefreshCw size={16} className="animate-spin" />}
                Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
