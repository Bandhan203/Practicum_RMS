import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  MapPin,
  DollarSign,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

export function OrderManagement() {
  const { orders, updateOrderStatus } = useApp();
  const { user } = useAuth();
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

  const canUpdateOrders = user?.role === 'admin' || user?.role === 'chef' || user?.role === 'waiter';

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
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(order.createdAt), 'PPp')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{order.customerName}</span>
              </div>
              {order.tableNumber && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Table {order.tableNumber}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">${order.totalAmount.toFixed(2)}</span>
              </div>
              {order.estimatedTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.estimatedTime} min</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4 flex-grow">
              <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.quantity}x {item.menuItemName}</span>
                    <span className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.specialInstructions && (
              <div className="bg-yellow-50 p-3 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Special Instructions:</strong> {order.specialInstructions}
                </p>
              </div>
            )}

            {canUpdateOrders && getAvailableActions(order.status).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {getAvailableActions(order.status).map((action) => (
                  <button
                    key={action}
                    onClick={() => updateOrderStatus(order.id, action)}
                    className={`flex-1 min-w-0 py-2 px-3 rounded-md text-sm font-medium transition-colors text-center ${
                      action === 'cancelled' 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {action === 'preparing' && 'Start Preparing'}
                    {action === 'ready' && 'Mark Ready'}
                    {action === 'served' && 'Mark Served'}
                    {action === 'cancelled' && 'Cancel'}
                  </button>
                ))}
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
