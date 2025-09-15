
import React, { useEffect, useState } from 'react';
import { Users, ShoppingCart, Info } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { useApp } from '../../contexts/AppContext';

export function StaffDashboard() {
  const { appUsers } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Placeholder: In future, fetch tasks from backend
  const staffUser = appUsers.find(u => u.role === 'staff');
  const assignedTasks = [
    { id: 1, title: 'Clean dining area', status: 'pending' },
    { id: 2, title: 'Restock napkins', status: 'completed' },
    { id: 3, title: 'Assist with order #1234', status: 'pending' },
  ];
  // Placeholder: In future, fetch info/notices from backend
  const notices = [
    { id: 1, message: 'Staff meeting at 5 PM in the break room.' },
    { id: 2, message: 'Remember to sanitize your hands regularly.' },
  ];

  useEffect(() => {
    setLoading(true);
    orderAPI.getOrders()
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load orders');
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome! Here you can view your assigned tasks and orders.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Assigned Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Assigned Tasks</h3>
            </div>
            <ul className="space-y-2">
              {assignedTasks.map(task => (
                <li key={task.id} className="flex items-center justify-between">
                  <span className={task.status === 'completed' ? 'line-through text-gray-400' : ''}>{task.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.status}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Orders</h3>
            </div>
            {loading ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {orders.map(order => (
                  <li key={order.id} className="flex items-center justify-between border-b py-2">
                    <span>Order #{order.id} - {order.status}</span>
                    <span className="text-xs text-gray-500">৳{order.totalAmount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Information/Notices */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <Info className="w-8 h-8 text-yellow-600" />
              <h3 className="text-lg font-medium text-gray-900">Information & Notices</h3>
            </div>
            <ul className="space-y-2">
              {notices.map(notice => (
                <li key={notice.id} className="text-gray-700 flex items-center">
                  <span className="mr-2">•</span> {notice.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
