import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Package, AlertTriangle, Plus, Edit, TrendingDown, Search, Filter, Save, X, Check, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function InventoryManagement() {
  const { 
    inventory, 
    inventoryLoading,
    inventoryError,
    updateInventory, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    adjustInventoryStock,
    refreshInventory 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, low, critical, adequate
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: '',
    threshold: '',
    cost: '',
    criticalLevel: ''
  });

  // Categories available in the system
  const categories = ['all', ...new Set(inventory.map(item => item.category))];

  // Filter and search inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'critical') {
        matchesStatus = item.quantity <= (item.critical_level || item.criticalLevel);
      } else if (statusFilter === 'low') {
        matchesStatus = item.quantity <= item.threshold && item.quantity > (item.critical_level || item.criticalLevel);
      } else if (statusFilter === 'adequate') {
        matchesStatus = item.quantity > item.threshold;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const critical = inventory.filter(item => item.quantity <= (item.critical_level || item.criticalLevel)).length;
    const low = inventory.filter(item => item.quantity <= item.threshold && item.quantity > (item.critical_level || item.criticalLevel)).length;
    const adequate = inventory.filter(item => item.quantity > item.threshold).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    
    return { critical, low, adequate, total: inventory.length, totalValue };
  }, [inventory]);

  const getStockStatus = (item) => {
    if (item.quantity <= (item.critical_level || item.criticalLevel)) return 'critical';
    if (item.quantity <= item.threshold) return 'low';
    return 'adequate';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'adequate': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity || !newItem.unit || !newItem.category) return;

    const result = await addInventoryItem({
      ...newItem,
      quantity: parseFloat(newItem.quantity),
      threshold: parseFloat(newItem.threshold) || 10,
      cost: parseFloat(newItem.cost) || 0,
      critical_level: parseFloat(newItem.criticalLevel) || 5
    });

    if (result.success) {
      setNewItem({
        name: '',
        quantity: '',
        unit: '',
        category: '',
        threshold: '',
        cost: '',
        criticalLevel: ''
      });
      setShowAddForm(false);
    } else {
      alert(`Error adding item: ${result.error}`);
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    const result = await updateInventoryItem(itemId, updates);
    if (result.success) {
      setEditingItem(null);
    } else {
      alert(`Error updating item: ${result.error}`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      const result = await deleteInventoryItem(itemId);
      if (!result.success) {
        alert(`Error deleting item: ${result.error}`);
      }
    }
  };

  const handleStockAdjustment = async (itemId, adjustment) => {
    const result = await adjustInventoryStock(itemId, adjustment);
    if (!result.success) {
      alert(`Error adjusting stock: ${result.error}`);
    }
  };

  const ItemForm = ({ item, onSave, onCancel, isEdit = false }) => {
    const [formData, setFormData] = useState(item || {
      name: '',
      quantity: '',
      unit: '',
      category: '',
      threshold: '',
      cost: '',
      criticalLevel: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
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
              <option value="Oils">Oils</option>
              <option value="Bakery">Bakery</option>
              <option value="Grains">Grains</option>
              <option value="Beverages">Beverages</option>
              <option value="Spices">Spices</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Quantity</label>
            <input
              type="number"
              step="0.1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
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
              <option value="liters">Liters</option>
              <option value="pieces">Pieces</option>
              <option value="grams">Grams</option>
              <option value="bottles">Bottles</option>
              <option value="cans">Cans</option>
              <option value="packets">Packets</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
            <input
              type="number"
              step="0.1"
              value={formData.threshold}
              onChange={(e) => setFormData({...formData, threshold: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Critical Level</label>
            <input
              type="number"
              step="0.1"
              value={formData.criticalLevel}
              onChange={(e) => setFormData({...formData, criticalLevel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="5"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (৳)</label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0.00"
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
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Save className="w-4 h-4 inline-block mr-1" />
            {isEdit ? 'Update' : 'Add'} Item
          </button>
        </div>
      </form>
    );
  };

  // Show loading state
  if (inventoryLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (inventoryError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-600 mb-2" />
          <h3 className="text-lg font-medium text-red-800">Error Loading Inventory</h3>
          <p className="text-red-600 mb-4">{inventoryError}</p>
          <button
            onClick={refreshInventory}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your restaurant inventory</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Critical Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.low}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Adequate Stock</p>
              <p className="text-2xl font-bold text-green-600">{stats.adequate}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">৳{stats.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Stock Levels</option>
            <option value="critical">Critical Stock</option>
            <option value="low">Low Stock</option>
            <option value="adequate">Adequate Stock</option>
          </select>
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="w-4 h-4 mr-1" />
            {filteredInventory.length} of {inventory.length} items
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <ItemForm
          onSave={async (data) => {
            const result = await addInventoryItem({
              ...data,
              quantity: parseFloat(data.quantity),
              threshold: parseFloat(data.threshold) || 10,
              cost: parseFloat(data.cost) || 0,
              critical_level: parseFloat(data.criticalLevel) || 5
            });
            if (result.success) {
              setShowAddForm(false);
            } else {
              alert(`Error adding item: ${result.error}`);
            }
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                const isEditing = editingItem === item.id;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          defaultValue={item.quantity}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                          onBlur={(e) => {
                            const newQuantity = parseFloat(e.target.value);
                            if (!isNaN(newQuantity)) {
                              updateInventory(item.id, newQuantity);
                            }
                          }}
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {item.quantity} {item.unit}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Threshold: {item.threshold} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(status)}`}>
                        {status === 'critical' ? 'Critical' : status === 'low' ? 'Low Stock' : 'Adequate'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">৳{(item.quantity * item.cost).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">৳{item.cost}/{item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {item.updated_at || item.lastUpdated ? 
                          format(new Date(item.updated_at || item.lastUpdated), 'MMM dd, HH:mm') : 
                          'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStockAdjustment(item.id, -1)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-300 rounded text-xs"
                          title="Decrease stock"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStockAdjustment(item.id, 1)}
                          className="text-green-600 hover:text-green-900 px-2 py-1 border border-green-300 rounded text-xs"
                          title="Increase stock"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => setEditingItem(isEditing ? null : item.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first inventory item.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
