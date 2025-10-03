import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  Star
} from 'lucide-react';

export function ProfessionalAnalytics() {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      customerCount: 0
    },
    revenueData: [],
    orderTypeData: [],
    topItems: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch comprehensive analytics data with date range
      const response = await fetch(`http://localhost:8000/api/analytics?range=${dateRange}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();

      if (result.success) {
        // Transform the data to match our component structure
        const transformedAnalytics = {
          overview: {
            totalRevenue: result.data.overview.total_revenue,
            totalOrders: result.data.overview.total_orders,
            avgOrderValue: result.data.overview.avg_order_value,
            customerCount: result.data.overview.unique_customers
          },
          revenueData: result.data.revenue_trend,
          orderTypeData: result.data.order_distribution,
          topItems: result.data.top_items,
          recentActivity: result.data.recent_activity
        };

        setAnalytics(transformedAnalytics);
      } else {
        throw new Error(result.message || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to demo data
      setAnalytics(getDemoAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (dashboardStats, orders, menuItems, bills) => {
    const ordersData = orders.data || [];
    const menuData = menuItems.data || [];
    const billsData = bills.data || [];

    // Calculate overview metrics
    const totalRevenue = billsData.reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);
    const totalOrders = ordersData.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = new Set(ordersData.map(order => order.customer_name)).size;

    // Generate revenue trend data (last 7 days)
    const revenueData = generateRevenueTrend(ordersData, billsData);

    // Calculate order type distribution
    const orderTypeData = calculateOrderTypeDistribution(ordersData);

    // Get top selling items
    const topItems = calculateTopItems(ordersData, menuData);

    // Generate recent activity
    const recentActivity = generateRecentActivity(ordersData, billsData);

    return {
      overview: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        customerCount: uniqueCustomers
      },
      revenueData,
      orderTypeData,
      topItems,
      recentActivity
    };
  };

  const generateRevenueTrend = (orders, bills) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayRevenue = bills
        .filter(bill => bill.created_at?.startsWith(dateStr))
        .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: orders.filter(order => order.created_at?.startsWith(dateStr)).length
      });
    }
    return last7Days;
  };

  const calculateOrderTypeDistribution = (orders) => {
    const distribution = orders.reduce((acc, order) => {
      const type = order.order_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: orders.length > 0 ? ((count / orders.length) * 100).toFixed(1) : 0
    }));
  };

  const calculateTopItems = (orders, menuItems) => {
    const itemCounts = {};

    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const itemId = item.menu_item_id || item.id;
          itemCounts[itemId] = (itemCounts[itemId] || 0) + (item.quantity || 1);
        });
      }
    });

    return Object.entries(itemCounts)
      .map(([itemId, count]) => {
        const menuItem = menuItems.find(item => item.id == itemId);
        return {
          id: itemId,
          name: menuItem?.name || `Item ${itemId}`,
          count,
          revenue: count * (parseFloat(menuItem?.price) || 0)
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const generateRecentActivity = (orders, bills) => {
    const activities = [];

    // Add recent orders
    orders.slice(0, 3).forEach(order => {
      activities.push({
        type: 'order',
        message: `New order ${order.order_number} from ${order.customer_name}`,
        time: new Date(order.created_at).toLocaleTimeString(),
        amount: `৳${parseFloat(order.total_amount || 0).toFixed(2)}`
      });
    });

    // Add recent bills
    bills.slice(0, 2).forEach(bill => {
      activities.push({
        type: 'payment',
        message: `Payment received for ${bill.bill_number}`,
        time: new Date(bill.created_at).toLocaleTimeString(),
        amount: `৳${parseFloat(bill.total_amount || 0).toFixed(2)}`
      });
    });

    return activities.slice(0, 5);
  };

  const getDemoAnalytics = () => ({
    overview: {
      totalRevenue: 25000,
      totalOrders: 150,
      avgOrderValue: 166.67,
      customerCount: 85
    },
    revenueData: [
      { date: 'Sep 15', revenue: 3200, orders: 18 },
      { date: 'Sep 16', revenue: 2800, orders: 15 },
      { date: 'Sep 17', revenue: 4100, orders: 22 },
      { date: 'Sep 18', revenue: 3600, orders: 19 },
      { date: 'Sep 19', revenue: 4500, orders: 25 },
      { date: 'Sep 20', revenue: 3800, orders: 21 },
      { date: 'Sep 21', revenue: 3000, orders: 16 }
    ],
    orderTypeData: [
      { type: 'Dine-in', count: 95, percentage: '63.3' },
      { type: 'Pickup', count: 55, percentage: '36.7' }
    ],
    topItems: [
      { name: 'Chicken Burger', count: 45, revenue: 1350 },
      { name: 'Fish Fry', count: 38, revenue: 950 },
      { name: 'Dal', count: 32, revenue: 640 },
      { name: 'Rice', count: 28, revenue: 420 },
      { name: 'Naan', count: 25, revenue: 375 }
    ],
    recentActivity: [
      { type: 'order', message: 'New order ORD-001 from John Doe', time: '2:30 PM', amount: '৳450' },
      { type: 'payment', message: 'Payment received for BILL-001', time: '2:15 PM', amount: '৳320' },
      { type: 'order', message: 'New order ORD-002 from Jane Smith', time: '1:45 PM', amount: '৳280' }
    ]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600 mt-1">Real-time insights and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1day">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Revenue</p>
              <p className="text-3xl font-bold">৳{analytics.overview.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Orders</p>
              <p className="text-3xl font-bold">{analytics.overview.totalOrders}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg Order Value</p>
              <p className="text-3xl font-bold">৳{analytics.overview.avgOrderValue.toFixed(0)}</p>
            </div>
            <Target className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Customers</p>
              <p className="text-3xl font-bold">{analytics.overview.customerCount}</p>
            </div>
            <Users className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Revenue Trend
          </h3>
          <div className="h-64 flex items-end space-x-2">
            {analytics.revenueData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-500 rounded-t w-full transition-all duration-500 hover:bg-blue-600"
                  style={{
                    height: `${Math.max((day.revenue / Math.max(...analytics.revenueData.map(d => d.revenue))) * 200, 10)}px`
                  }}
                  title={`৳${day.revenue} - ${day.orders} orders`}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Type Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Order Type Distribution
          </h3>
          <div className="space-y-4">
            {analytics.orderTypeData.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                  ></div>
                  <span className="font-medium">{type.type}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{type.count}</div>
                  <div className="text-sm text-gray-500">{type.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Top Selling Items
          </h3>
          <div className="space-y-3">
            {analytics.topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.count} sold</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">৳{item.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
                <div>
                  <div className="font-medium text-sm">{activity.message}</div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
                <div className="font-semibold text-green-600">{activity.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
