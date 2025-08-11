import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Trash2,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Printer
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export function ReportsManagement() {
  const { orders, analytics, wasteLogs, inventory } = useApp();
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign, color: 'text-green-600' },
    { id: 'orders', name: 'Orders Report', icon: ShoppingCart, color: 'text-blue-600' },
    { id: 'waste', name: 'Food Waste Report', icon: Trash2, color: 'text-red-600' },
    { id: 'inventory', name: 'Inventory Report', icon: BarChart3, color: 'text-purple-600' },
    { id: 'customers', name: 'Customer Report', icon: Users, color: 'text-orange-600' },
    { id: 'analytics', name: 'Analytics Summary', icon: LineChart, color: 'text-indigo-600' }
  ];

  const dateRanges = [
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'thisWeek', name: 'This Week' },
    { id: 'lastWeek', name: 'Last Week' },
    { id: 'thisMonth', name: 'This Month' },
    { id: 'lastMonth', name: 'Last Month' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: now, end: now };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { start: yesterday, end: yesterday };
      case 'thisWeek':
        const startOfWeek = subDays(now, now.getDay());
        return { start: startOfWeek, end: now };
      case 'lastWeek':
        const lastWeekStart = subDays(now, now.getDay() + 7);
        const lastWeekEnd = subDays(now, now.getDay() + 1);
        return { start: lastWeekStart, end: lastWeekEnd };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(now), 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'custom':
        return { 
          start: startDate ? new Date(startDate) : now, 
          end: endDate ? new Date(endDate) : now 
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const generateReportData = () => {
    const { start, end } = getDateRange();
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });

    const filteredWaste = wasteLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= start && logDate <= end;
    });

    const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const totalWaste = filteredWaste.reduce((sum, log) => sum + log.cost, 0);
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      period: `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`,
      totalSales,
      totalOrders,
      totalWaste,
      avgOrderValue,
      orders: filteredOrders,
      wasteLogs: filteredWaste,
      topItems: analytics.popularItems,
      wasteByCategory: analytics.topWastedItems
    };
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const reportData = generateReportData();
    console.log(`Exporting ${selectedReport} report as ${format}:`, reportData);
    
    // Mock export functionality
    const fileName = `${selectedReport}_report_${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    alert(`Report "${fileName}" has been exported successfully!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const ReportPreview = () => {
    const reportData = generateReportData();
    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b'];

    const renderSalesReport = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900">Total Sales</h4>
            <p className="text-2xl font-bold text-green-600">${reportData.totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Total Orders</h4>
            <p className="text-2xl font-bold text-blue-600">{reportData.totalOrders}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900">Avg Order Value</h4>
            <p className="text-2xl font-bold text-purple-600">${reportData.avgOrderValue.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900">Growth Rate</h4>
            <p className="text-2xl font-bold text-orange-600">+12.5%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold mb-4">Sales Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={analytics.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold mb-4">Top Selling Items</h4>
          <div className="space-y-3">
            {reportData.topItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{item.item}</span>
                <span className="text-green-600 font-semibold">{item.orders} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const renderWasteReport = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900">Total Waste Cost</h4>
            <p className="text-2xl font-bold text-red-600">${reportData.totalWaste.toFixed(2)}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900">Waste Entries</h4>
            <p className="text-2xl font-bold text-yellow-600">{reportData.wasteLogs.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900">Avg Daily Waste</h4>
            <p className="text-2xl font-bold text-orange-600">${(reportData.totalWaste / 30).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold mb-4">Waste by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={reportData.wasteByCategory.map((item, index) => ({
                  name: item.item,
                  value: item.cost,
                  color: COLORS[index % COLORS.length]
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => `${name}: $${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportData.wasteByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold mb-4">Recent Waste Logs</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                  <th className="px-4 py-2 text-left">Cost</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.wasteLogs.slice(0, 10).map((log, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{log.itemName}</td>
                    <td className="px-4 py-2">{log.quantity} {log.unit}</td>
                    <td className="px-4 py-2">{log.reason}</td>
                    <td className="px-4 py-2">${log.cost.toFixed(2)}</td>
                    <td className="px-4 py-2">{format(new Date(log.date), 'MMM dd, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    const renderInventoryReport = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Total Items</h4>
            <p className="text-2xl font-bold text-blue-600">{inventory.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900">Low Stock Items</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {inventory.filter(item => item.quantity <= item.threshold).length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900">Total Value</h4>
            <p className="text-2xl font-bold text-green-600">
              ${inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold mb-4">Inventory Status</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Threshold</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.category}</td>
                    <td className="px-4 py-2">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-2">{item.threshold} {item.unit}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.quantity <= item.threshold 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.quantity <= item.threshold ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-2">${(item.quantity * item.cost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    const renderContent = () => {
      switch (selectedReport) {
        case 'sales':
          return renderSalesReport();
        case 'waste':
          return renderWasteReport();
        case 'inventory':
          return renderInventoryReport();
        default:
          return renderSalesReport();
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {reportTypes.find(r => r.id === selectedReport)?.name}
              </h3>
              <p className="text-gray-600">Period: {reportData.period}</p>
              <p className="text-sm text-gray-500">Generated on {format(new Date(), 'PPP')}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 flex items-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
        {renderContent()}
      </div>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className="space-y-2">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label key={type.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value={type.id}
                      checked={selectedReport === type.id}
                      onChange={(e) => setSelectedReport(e.target.value)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <Icon className={`w-4 h-4 ${type.color}`} />
                    <span className="text-sm text-gray-900">{type.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>

            {dateRange === 'custom' && (
              <div className="mt-3 space-y-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="End Date"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{showPreview ? 'Hide Preview' : 'Generate Preview'}</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && <ReportPreview />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports Generated</p>
              <p className="text-2xl font-semibold text-gray-900">247</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">23</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Most Popular</p>
              <p className="text-lg font-semibold text-gray-900">Sales Report</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Generated</p>
              <p className="text-sm font-semibold text-gray-900">2 hours ago</p>
            </div>
            <Download className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}