import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Target,
  Trophy,
  Clock,
  TrendingDown,
  Loader2,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  FileText,
  Printer
} from 'lucide-react';
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  isWithinInterval,
  parseISO,
  isToday,
  isYesterday
} from 'date-fns';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export function ReportsManagement() {
  const { 
    orders, 
    analytics, 
    wasteLogs, 
    inventory, 
    reservations,
    appUsers,
    getLiveAnalytics,
    calculateLiveWasteAnalytics,
    calculateLiveStockAnalytics
  } = useApp();

  // Date Range State
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('last7days');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  // Date range calculations
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date(now.setHours(23, 59, 59, 999)) };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { start: new Date(yesterday.setHours(0, 0, 0, 0)), end: new Date(yesterday.setHours(23, 59, 59, 999)) };
      case 'last7days':
        return { start: subDays(now, 7), end: now };
      case 'last30days':
        return { start: subDays(now, 30), end: now };
      case 'thisWeek':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 7), end: now };
    }
  };

  // Comprehensive analytics calculations using real data
  const reportData = useMemo(() => {
    const { start, end } = getDateRange();
    
    // Filter data by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.timestamp || order.date || Date.now());
      return isWithinInterval(orderDate, { start, end });
    });
    
    const filteredWaste = wasteLogs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start, end });
    });
    
    const filteredReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return isWithinInterval(reservationDate, { start, end });
    });

    // Calculate revenue analytics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate daily revenue trend
    const revenueTrend = [];
    const daysBetween = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= daysBetween; i++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + i);
      
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.timestamp || order.date || Date.now());
        return orderDate.toDateString() === currentDay.toDateString();
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      
      revenueTrend.push({
        date: format(currentDay, 'MMM dd'),
        revenue: dayRevenue,
        orders: dayOrders.length,
        avgOrderValue: dayOrders.length > 0 ? dayRevenue / dayOrders.length : 0
      });
    }

    // Category performance analysis
    const categoryStats = {};
    filteredOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const category = item.category || 'Food'; // Default to 'Food' instead of 'Other'
          if (!categoryStats[category]) {
            categoryStats[category] = { revenue: 0, quantity: 0, orders: new Set() };
          }
          categoryStats[category].revenue += parseFloat(item.price || 0) * parseInt(item.quantity || 1);
          categoryStats[category].quantity += parseInt(item.quantity || 1);
          categoryStats[category].orders.add(order.id);
        });
      }
    });

    const categoryData = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      revenue: stats.revenue,
      quantity: stats.quantity,
      orders: stats.orders.size,
      percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue * 100).toFixed(1) : 0
    })).sort((a, b) => b.revenue - a.revenue);

    // Top items analysis
    const itemStats = {};
    filteredOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const itemName = item.menuItemName || item.name || 'Unknown Item';
          if (!itemStats[itemName]) {
            itemStats[itemName] = { 
              revenue: 0, 
              quantity: 0, 
              orders: new Set(), 
              category: item.category || 'Food',
              price: parseFloat(item.price || 0)
            };
          }
          itemStats[itemName].revenue += parseFloat(item.price || 0) * parseInt(item.quantity || 1);
          itemStats[itemName].quantity += parseInt(item.quantity || 1);
          itemStats[itemName].orders.add(order.id);
        });
      }
    });

    const topItems = Object.entries(itemStats).map(([name, stats]) => ({
      name,
      ...stats,
      orders: stats.orders.size
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    // Customer analytics
    const customerStats = {};
    filteredOrders.forEach(order => {
      const customerName = order.customerName || order.customer?.name || 'Walk-in Customer';
      if (!customerStats[customerName]) {
        customerStats[customerName] = {
          totalSpent: 0,
          orderCount: 0,
          lastOrder: null,
          email: order.customerEmail || order.customer?.email || '',
          phone: order.customerPhone || order.customer?.phone || ''
        };
      }
      customerStats[customerName].totalSpent += parseFloat(order.totalAmount || 0);
      customerStats[customerName].orderCount += 1;
      const orderDate = new Date(order.createdAt || order.timestamp || order.date || Date.now());
      if (!customerStats[customerName].lastOrder || orderDate > customerStats[customerName].lastOrder) {
        customerStats[customerName].lastOrder = orderDate;
      }
    });

    const topCustomers = Object.entries(customerStats).map(([name, stats]) => ({
      name,
      ...stats,
      avgOrderValue: stats.orderCount > 0 ? stats.totalSpent / stats.orderCount : 0
    })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

    // Inventory insights
    const lowStockItems = inventory.filter(item => 
      item.quantity <= (item.minimumStock || 10)
    ).length;

    const outOfStockItems = inventory.filter(item => item.quantity === 0).length;

    // Waste analytics
    const totalWasteValue = filteredWaste.reduce((sum, log) => sum + (parseFloat(log.value) || 0), 0);
    const wasteByCategory = {};
    filteredWaste.forEach(log => {
      const category = log.category || 'Other';
      wasteByCategory[category] = (wasteByCategory[category] || 0) + (parseFloat(log.value) || 0);
    });

    // Console log for debugging
    console.log('Report Data Debug:', {
      totalOrders: filteredOrders.length,
      totalRevenue,
      revenueTrendLength: revenueTrend.length,
      categoryDataLength: categoryData.length,
      topItemsLength: topItems.length,
      topCustomersLength: topCustomers.length
    });

    return {
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalCustomers: Object.keys(customerStats).length,
        totalReservations: filteredReservations.length,
        lowStockItems,
        outOfStockItems,
        totalWasteValue
      },
      revenueTrend,
      categoryData,
      topItems,
      topCustomers,
      wasteByCategory: Object.entries(wasteByCategory).map(([category, value]) => ({
        category,
        value,
        percentage: totalWasteValue > 0 ? (value / totalWasteValue * 100).toFixed(1) : 0
      }))
    };
  }, [orders, wasteLogs, inventory, reservations, dateRange]);

  // Export function
  const exportReport = () => {
    const dataToExport = {
      summary: reportData.summary,
      revenueTrend: reportData.revenueTrend,
      categories: reportData.categoryData,
      topItems: reportData.topItems,
      topCustomers: reportData.topCustomers,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `reports_${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const dateRangeOptions = [
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'last7days', name: 'Last 7 Days' },
    { id: 'last30days', name: 'Last 30 Days' },
    { id: 'thisWeek', name: 'This Week' },
    { id: 'thisMonth', name: 'This Month' }
  ];

  // Summary Cards Component
  const SummaryCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {change >= 0 ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs previous period</span>
        </div>
      )}
    </div>
  );

  // Chart Section Component
  const ChartSection = ({ title, children, expanded, onToggle, actions }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {actions}
          {expanded ? (
            <ArrowUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ArrowDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business intelligence and reporting with real data</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button
            onClick={exportReport}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              >
                <option value="overview">Overview</option>
                <option value="sales">Sales Analytics</option>
                <option value="inventory">Inventory Reports</option>
                <option value="waste">Waste Analysis</option>
                <option value="customers">Customer Analytics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${reportData.summary.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{dateRange} period</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">Avg: ${reportData.summary.avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalCustomers}</p>
              <p className="text-sm text-gray-500 mt-1">Unique customers</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.lowStockItems}</p>
              <p className="text-sm text-gray-500 mt-1">Low stock items</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Daily revenue analysis</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={reportData.revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'Revenue' ? `$${Number(value).toFixed(2)}` : Number(value),
                  name
                ]}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10B981"
                strokeWidth={2}
                name="Orders"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category and Items Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                >
                  {reportData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Items</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.topItems.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'quantity' ? `${value} sold` : `$${value.toFixed(2)}`,
                    name === 'quantity' ? 'Quantity' : 'Revenue'
                  ]}
                />
                <Legend />
                <Bar dataKey="quantity" fill="#3B82F6" name="Quantity" />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Customers</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.topCustomers.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'totalSpent' ? `$${value.toFixed(2)}` : value,
                    name === 'totalSpent' ? 'Total Spent' : 'Orders'
                  ]}
                />
                <Legend />
                <Bar dataKey="totalSpent" fill="#8B5CF6" name="Total Spent" />
                <Bar dataKey="orderCount" fill="#06B6D4" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {reportData.topCustomers.slice(0, 8).map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email || 'No email'}</p>
                  <p className="text-xs text-gray-500">
                    Last order: {customer.lastOrder ? format(customer.lastOrder, 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{customer.orderCount} orders</p>
                  <p className="text-xs text-gray-500">Avg: ${customer.avgOrderValue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waste Analysis */}
      {reportData.wasteByCategory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Waste Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.wasteByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                  >
                    {reportData.wasteByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Waste Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="mb-4">
                <p className="text-2xl font-bold text-red-600">${reportData.summary.totalWasteValue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total waste value</p>
              </div>
              <div className="space-y-3">
                {reportData.wasteByCategory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-900">{item.category}</span>
                    <div className="text-right">
                      <span className="font-semibold text-red-600">${item.value.toFixed(2)}</span>
                      <p className="text-xs text-gray-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}