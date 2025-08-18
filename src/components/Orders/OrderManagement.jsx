import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  MapPin,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

export function OrderManagement() {
  const { orders, updateOrderStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

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

  // Allow all users to update orders in the simplified version
  const canUpdateOrders = true;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(order.createdAt), 'PPp')}
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
                  <span className="text-sm text-gray-600 flex-1 truncate">{order.customerName}</span>
                </div>
                {order.tableNumber && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600 flex-1">Table {order.tableNumber}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-600 flex-1 font-medium">৳ {order.totalAmount.toFixed(2)}</span>
                </div>
                {order.estimatedTime && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600 flex-1">{order.estimatedTime} min</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 pb-4 flex-1">
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Items ({order.items.length}):</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {item.quantity}
                        </span>
                        <span className="text-sm text-gray-800 truncate">{item.menuItemName}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 ml-2 whitespace-nowrap">৳ {(item.price * item.quantity).toFixed(2)}</span>
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
              <div className="p-6 pt-0 mt-auto">
                <div className={`grid gap-2 ${getAvailableActions(order.status).length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {getAvailableActions(order.status).map((action) => (
                    <button
                      key={action}
                      onClick={() => updateOrderStatus(order.id, action)}
                      className={`py-2.5 px-4 rounded-md text-sm font-medium transition-colors text-center focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        action === 'cancelled' 
                          ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
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
    </div>
  );
}
