import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  DollarSign, 
  Package,
  Search,
  Filter,
  Edit,
  X,
  Save,
  BarChart3,
  Eye,
  Download
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export function WasteManagement() {
  const { 
    wasteLogs, 
    logWaste, 
    updateWasteLog, 
    deleteWasteLog, 
    inventory,
    calculateLiveWasteAnalytics 
  } = useApp();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [reasonFilter, setReasonFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWaste, setEditingWaste] = useState(null);
  const [selectedWaste, setSelectedWaste] = useState(null);
  const [newWaste, setNewWaste] = useState({
    itemName: '',
    quantity: '',
    unit: '',
    reason: '',
    cost: '',
    category: '',
    loggedBy: user?.name || 'Current User'
  });

  // Get available categories and reasons from existing waste logs
  const categories = ['all', ...new Set(wasteLogs.map(waste => waste.category).filter(Boolean))];
  const reasons = ['all', ...new Set(wasteLogs.map(waste => waste.reason).filter(Boolean))];

  // Filter waste logs
  const filteredWasteLogs = useMemo(() => {
    const now = new Date();
    
    return wasteLogs.filter(waste => {
      const matchesSearch = waste.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          waste.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          waste.loggedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || waste.category === categoryFilter;
      const matchesReason = reasonFilter === 'all' || waste.reason === reasonFilter;
      
      let matchesDate = true;
      const wasteDate = new Date(waste.date);
      
      if (dateFilter === 'today') {
        matchesDate = isWithinInterval(wasteDate, { 
          start: startOfDay(now), 
          end: endOfDay(now) 
        });
      } else if (dateFilter === 'week') {
        matchesDate = isWithinInterval(wasteDate, { 
          start: startOfDay(subDays(now, 7)), 
          end: endOfDay(now) 
        });
      } else if (dateFilter === 'month') {
        matchesDate = isWithinInterval(wasteDate, { 
          start: startOfDay(subDays(now, 30)), 
          end: endOfDay(now) 
        });
      }
      
      return matchesSearch && matchesCategory && matchesReason && matchesDate;
    });
  }, [wasteLogs, searchTerm, categoryFilter, reasonFilter, dateFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const week = startOfDay(subDays(now, 7));
    const month = startOfDay(subDays(now, 30));

    const todayWaste = wasteLogs.filter(log => new Date(log.date) >= today);
    const weekWaste = wasteLogs.filter(log => new Date(log.date) >= week);
    const monthWaste = wasteLogs.filter(log => new Date(log.date) >= month);

    const todayCost = todayWaste.reduce((sum, log) => sum + log.cost, 0);
    const weekCost = weekWaste.reduce((sum, log) => sum + log.cost, 0);
    const monthCost = monthWaste.reduce((sum, log) => sum + log.cost, 0);

    // Top wasted items
    const wasteByItem = {};
    monthWaste.forEach(log => {
      if (!wasteByItem[log.itemName]) {
        wasteByItem[log.itemName] = { quantity: 0, cost: 0, count: 0 };
      }
      wasteByItem[log.itemName].quantity += log.quantity;
      wasteByItem[log.itemName].cost += log.cost;
      wasteByItem[log.itemName].count += 1;
    });

    const topWastedItems = Object.entries(wasteByItem)
      .map(([item, data]) => ({ item, ...data }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    // Waste by category
    const wasteByCategory = {};
    monthWaste.forEach(log => {
      if (!wasteByCategory[log.category]) {
        wasteByCategory[log.category] = 0;
      }
      wasteByCategory[log.category] += log.cost;
    });

    return {
      todayCost,
      weekCost,
      monthCost,
      todayCount: todayWaste.length,
      weekCount: weekWaste.length,
      monthCount: monthWaste.length,
      topWastedItems,
      wasteByCategory,
      totalWasteLogs: wasteLogs.length
    };
  }, [wasteLogs]);

  const handleAddWaste = (e) => {
    e.preventDefault();
    if (!newWaste.itemName || !newWaste.quantity || !newWaste.reason) return;

    logWaste({
      ...newWaste,
      quantity: parseFloat(newWaste.quantity),
      cost: parseFloat(newWaste.cost) || 0
    });

    setNewWaste({
      itemName: '',
      quantity: '',
      unit: '',
      reason: '',
      cost: '',
      category: '',
      loggedBy: user?.name || 'Current User'
    });
    setShowAddForm(false);
  };

  const handleUpdateWaste = (wasteId, updates) => {
    updateWasteLog(wasteId, updates);
    setEditingWaste(null);
  };

  const handleDeleteWaste = (wasteId) => {
    if (window.confirm('Are you sure you want to delete this waste log?')) {
      deleteWasteLog(wasteId);
      setSelectedWaste(null);
    }
  };

  const exportWasteData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      dateFilter,
      categoryFilter,
      reasonFilter,
      searchTerm,
      wasteLogs: filteredWasteLogs,
      summary: stats
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `waste-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const WasteForm = ({ waste, onSave, onCancel, isEdit = false }) => {
    const [formData, setFormData] = useState(waste || {
      itemName: '',
      quantity: '',
      unit: '',
      reason: '',
      cost: '',
      category: '',
      loggedBy: user?.name || 'Current User'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Waste Log' : 'Log New Waste'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({...formData, itemName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="e.g., Tomatoes"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Meat">Meat</option>
              <option value="Fish">Fish</option>
              <option value="Dairy">Dairy</option>
              <option value="Herbs">Herbs</option>
              <option value="Bakery">Bakery</option>
              <option value="Grains">Grains</option>
              <option value="Beverages">Beverages</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Wasted</label>
            <input
              type="number"
              step="0.1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="0.0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Select Unit</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="grams">Grams</option>
              <option value="liters">Liters</option>
              <option value="pieces">Pieces</option>
              <option value="portions">Portions</option>
              <option value="loaves">Loaves</option>
              <option value="bottles">Bottles</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Waste</label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Select Reason</option>
              <option value="Expired">Expired</option>
              <option value="Overripe">Overripe</option>
              <option value="Moldy">Moldy</option>
              <option value="Stale">Stale</option>
              <option value="Burnt">Burnt</option>
              <option value="Overcooked">Overcooked</option>
              <option value="Contaminated">Contaminated</option>
              <option value="Customer returned">Customer returned</option>
              <option value="Staff error">Staff error</option>
              <option value="Equipment failure">Equipment failure</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost (৳)</label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0.00"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Logged By</label>
            <input
              type="text"
              value={formData.loggedBy}
              onChange={(e) => setFormData({...formData, loggedBy: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Staff name"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 inline-block mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-dark text-white rounded-md hover:bg-brand-light transition-colors"
          >
            <Save className="w-4 h-4 inline-block mr-1" />
            {isEdit ? 'Update' : 'Log'} Waste
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waste Management</h1>
          <p className="text-gray-600">Track and analyze food waste to minimize costs</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportWasteData}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-brand-dark text-white px-4 py-2 rounded-md hover:bg-brand-light transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Waste
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Today's Waste</p>
              <p className="text-2xl font-bold text-red-600">৳{stats.todayCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{stats.todayCount} items</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-orange-600">৳{stats.weekCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{stats.weekCount} items</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-yellow-600">৳{stats.monthCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{stats.monthCount} items</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalWasteLogs}</p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Wasted Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Wasted Items (This Month)</h3>
        <div className="space-y-3">
          {stats.topWastedItems.map((item, index) => (
            <div key={item.item} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-semibold text-red-600">
                  {index + 1}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{item.item}</p>
                  <p className="text-sm text-gray-500">{item.quantity.toFixed(1)} units • {item.count} incidents</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">৳{item.cost.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search waste logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {reasons.map(reason => (
              <option key={reason} value={reason}>
                {reason === 'all' ? 'All Reasons' : reason}
              </option>
            ))}
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="w-4 h-4 mr-1" />
            {filteredWasteLogs.length} of {wasteLogs.length} logs
          </div>
        </div>
      </div>

      {/* Add Waste Form */}
      {showAddForm && (
        <WasteForm
          onSave={(data) => {
            logWaste({
              ...data,
              quantity: parseFloat(data.quantity),
              cost: parseFloat(data.cost) || 0
            });
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Waste Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logged By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWasteLogs.map((waste) => (
                <tr key={waste.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{waste.itemName}</div>
                      <div className="text-sm text-gray-500">{waste.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{waste.quantity} {waste.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      {waste.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">৳{waste.cost.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{format(new Date(waste.date), 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-gray-500">{format(new Date(waste.date), 'HH:mm')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{waste.loggedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedWaste(waste)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingWaste(waste.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Edit log"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWaste(waste.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredWasteLogs.length === 0 && (
        <div className="text-center py-12">
          <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No waste logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'all' || reasonFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Start logging waste to track and minimize food waste costs.'
            }
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingWaste && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <WasteForm
              waste={wasteLogs.find(w => w.id === editingWaste)}
              onSave={(data) => {
                updateWasteLog(editingWaste, {
                  ...data,
                  quantity: parseFloat(data.quantity),
                  cost: parseFloat(data.cost) || 0
                });
                setEditingWaste(null);
              }}
              onCancel={() => setEditingWaste(null)}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedWaste && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Waste Log Details</h3>
              <button
                onClick={() => setSelectedWaste(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Item:</label>
                <p className="text-sm text-gray-900">{selectedWaste.itemName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category:</label>
                <p className="text-sm text-gray-900">{selectedWaste.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity:</label>
                <p className="text-sm text-gray-900">{selectedWaste.quantity} {selectedWaste.unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Reason:</label>
                <p className="text-sm text-gray-900">{selectedWaste.reason}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cost:</label>
                <p className="text-sm text-gray-900">৳{selectedWaste.cost.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date & Time:</label>
                <p className="text-sm text-gray-900">{format(new Date(selectedWaste.date), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Logged By:</label>
                <p className="text-sm text-gray-900">{selectedWaste.loggedBy}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
