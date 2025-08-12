
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trash2, 
  BarChart3, 
  PieChart, 
  Download,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  Target,
  Activity,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export function AnalyticsDashboard() {
  const { 
    analytics, 
    getLiveAnalytics, 
    orders, 
    inventory, 
    wasteLogs, 
    reservations,
    menuItems 
  } = useApp();
  
  const [liveAnalytics, setLiveAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);

  // Update live analytics
  useEffect(() => {
    const updateLiveAnalytics = () => {
      setIsLoading(true);
      try {
        if (typeof getLiveAnalytics === 'function') {
          const data = getLiveAnalytics();
          setLiveAnalytics(data);
        } else {
          setLiveAnalytics(analytics);
        }
      } catch (error) {
        console.error('Error updating analytics:', error);
        setLiveAnalytics(analytics);
      } finally {
        setIsLoading(false);
      }
    };

    updateLiveAnalytics();
    const interval = setInterval(updateLiveAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [analytics, getLiveAnalytics]);

  // Calculate real-time metrics from actual data
  const realTimeMetrics = useMemo(() => {
    const now = new Date();
    const daysBack = dateRange === '30days' ? 30 : dateRange === '7days' ? 7 : 1;
    const startDate = startOfDay(subDays(now, daysBack));
    const endDate = endOfDay(now);

    // Filter data by date range
    const filteredOrders = orders.filter(order => 
      isWithinInterval(new Date(order.createdAt), { start: startDate, end: endDate })
    );
    
    const filteredWaste = wasteLogs.filter(waste => 
      isWithinInterval(new Date(waste.date), { start: startDate, end: endDate })
    );

    const filteredReservations = reservations.filter(reservation => 
      isWithinInterval(new Date(reservation.date), { start: startDate, end: endDate })
    );

    // Calculate metrics
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalWaste = filteredWaste.reduce((sum, waste) => sum + waste.cost, 0);

    // Order status breakdown
    const orderStatusBreakdown = {
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      preparing: filteredOrders.filter(o => o.status === 'preparing').length,
      ready: filteredOrders.filter(o => o.status === 'ready').length,
      served: filteredOrders.filter(o => o.status === 'served').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
    };

    // Revenue trend data
    const revenueTrend = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayOrders = orders.filter(order => 
        isWithinInterval(new Date(order.createdAt), { start: dayStart, end: dayEnd })
      );
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      revenueTrend.push({
        date: format(date, 'MMM dd'),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Top selling items
    const itemSales = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        if (menuItem) {
          if (!itemSales[menuItem.name]) {
            itemSales[menuItem.name] = { quantity: 0, revenue: 0 };
          }
          itemSales[menuItem.name].quantity += item.quantity;
          itemSales[menuItem.name].revenue += item.quantity * menuItem.price;
        }
      });
    });

    const topSellingItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Waste by category
    const wasteByCategory = {};
    filteredWaste.forEach(waste => {
      const item = inventory.find(i => i.name === waste.item);
      const category = item ? item.category : 'Other';
      if (!wasteByCategory[category]) {
        wasteByCategory[category] = 0;
      }
      wasteByCategory[category] += waste.cost;
    });

    const wasteData = Object.entries(wasteByCategory)
      .map(([category, cost]) => ({ category, cost }))
      .sort((a, b) => b.cost - a.cost);

    // Stock alerts
    const stockAlerts = {
      critical: inventory.filter(item => item.quantity <= item.criticalLevel).length,
      low: inventory.filter(item => item.quantity <= item.threshold && item.quantity > item.criticalLevel).length,
      adequate: inventory.filter(item => item.quantity > item.threshold).length
    };

    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      totalWaste,
      orderStatusBreakdown,
      revenueTrend,
      topSellingItems,
      wasteData,
      stockAlerts,
      reservationsCount: filteredReservations.length
    };
  }, [orders, inventory, wasteLogs, reservations, menuItems, dateRange]);

  const COLORS = ['#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A', '#059669', '#0891B2', '#0284C7', '#2563EB'];

  const handleExportReport = (type) => {
    const reportData = {
      type,
      dateRange,
      generatedAt: new Date().toISOString(),
      metrics: realTimeMetrics,
      analytics: liveAnalytics
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${type}-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (typeof getLiveAnalytics === 'function') {
        setLiveAnalytics(getLiveAnalytics());
      }
      setIsLoading(false);
    }, 1000);
  };

  if (!liveAnalytics && !realTimeMetrics) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-gray-400 mx-auto animate-spin" />
          <p className="text-gray-500 mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your restaurant performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="1day">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleExportReport('comprehensive')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">৳{realTimeMetrics.totalSales.toFixed(2)}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {dateRange === '1day' ? 'Today' : `Last ${dateRange === '7days' ? '7' : '30'} days`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.totalOrders}</p>
              <p className="text-xs text-blue-600">Avg: ৳{realTimeMetrics.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waste Cost</p>
              <p className="text-2xl font-bold text-gray-900">৳{realTimeMetrics.totalWaste.toFixed(2)}</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingDown className="w-3 h-3 mr-1" />
                {((realTimeMetrics.totalWaste / realTimeMetrics.totalSales) * 100).toFixed(1)}% of revenue
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reservations</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.reservationsCount}</p>
              <p className="text-xs text-purple-600">Table bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={realTimeMetrics.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`৳${value.toFixed(2)}`, 'Revenue']} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#DC2626" 
                fill="#FEE2E2" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={Object.entries(realTimeMetrics.orderStatusBreakdown).map(([status, count]) => ({
              status: status.charAt(0).toUpperCase() + status.slice(1),
              count
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#DC2626" />
            </ReBarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-3">
            {realTimeMetrics.topSellingItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-semibold text-red-600">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">৳{item.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waste by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Waste by Category</h3>
            <PieChart className="w-5 h-5 text-red-600" />
          </div>
          {realTimeMetrics.wasteData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={realTimeMetrics.wasteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cost"
                >
                  {realTimeMetrics.wasteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`৳${value.toFixed(2)}`, 'Waste Cost']} />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Trash2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No waste data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Status Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
          <Package className="w-5 h-5 text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{realTimeMetrics.stockAlerts.critical}</p>
            <p className="text-sm text-red-600">Critical Stock</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <TrendingDown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{realTimeMetrics.stockAlerts.low}</p>
            <p className="text-sm text-yellow-600">Low Stock</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{realTimeMetrics.stockAlerts.adequate}</p>
            <p className="text-sm text-green-600">Adequate Stock</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExportReport('sales')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <DollarSign className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Sales Report</h4>
            <p className="text-sm text-gray-500">Revenue and order analytics</p>
          </button>
          <button
            onClick={() => handleExportReport('inventory')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Package className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Inventory Report</h4>
            <p className="text-sm text-gray-500">Stock levels and waste analysis</p>
          </button>
          <button
            onClick={() => handleExportReport('comprehensive')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Full Report</h4>
            <p className="text-sm text-gray-500">Complete analytics export</p>
          </button>
        </div>
      </div>
    </div>
  );
}
