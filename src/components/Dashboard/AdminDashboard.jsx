import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, ShoppingCart, Users, Package, Star, RefreshCw } from 'lucide-react';

export function AdminDashboard() {
  const { orders = [], inventory = [] } = useApp();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch analytics data from backend
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/simple-analytics/dashboard-stats?period=all', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Analytics data fetched:', data);
        
        if (data.success && data.data && data.data.kpis) {
          setAnalytics({
            totalRevenue: data.data.kpis.total_revenue || 0,
            totalOrders: data.data.kpis.total_orders || 0,
            averageOrderValue: data.data.kpis.average_order_value || 0,
            totalMenuItems: data.data.kpis.total_menu_items || 0,
            lowStockItems: data.data.kpis.low_stock_items || 0
          });
        }
        setLastUpdate(new Date());
      } else {
        console.error('❌ Analytics API error:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and set up auto-refresh
  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Add loading state check
  if (loading && Object.keys(analytics).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Dashboard...</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  );
  
  const lowStockItems = inventory.filter(item => item.quantity <= item.threshold);
  const activeOrders = orders.filter(order =>
    ['pending', 'preparing', 'ready'].includes(order.status)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Admin User'}! Here's what's happening today.</p>
            </div>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">
              ৳{analytics.totalRevenue ? analytics.totalRevenue.toFixed(2) : '0.00'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-600">{analytics.totalOrders || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Order Value</h3>
            <p className="text-2xl font-bold text-purple-600">
              ৳{analytics.averageOrderValue ? analytics.averageOrderValue.toFixed(2) : '0.00'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Stock Items</h3>
            <p className="text-2xl font-bold text-orange-600">{analytics.lowStockItems || 2}</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {orders.slice(0, 3).map((order, index) => (
              <div key={order.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {order.order_number || `Order #${order.id}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.customer_name || 'Customer'} • ৳{(order.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                  </p>
                </div>
              </div>
            ))}
            
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Dish Name {item}</h3>
                  <p className="text-sm text-gray-600">Delicious description</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 ml-1">4.5</span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">৳{(150 + item * 50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
