import React, { useState, useEffect } from 'react';
import { useApiApp } from '../../contexts/ApiAppContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Clock, 
  DollarSign,
  Search,
  Users,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie
} from 'recharts';

export function ApiMenuManagement() {
  const { 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem,
    getMenuItems,
    getLoadingState,
    getError,
    hasError,
    clearError,
    apiConnected,
    useLocalData,
    retryOperation
  } = useApiApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'analytics'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [localMenuItems, setLocalMenuItems] = useState([]);

  // Loading states
  const isLoading = getLoadingState('menuItems');
  const error = getError('menuItems');

  // Load menu items on component mount
  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const result = await getMenuItems();
      if (result.success) {
        setLocalMenuItems(result.data);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  // Use local state if we have it, otherwise fall back to context
  const displayMenuItems = localMenuItems.length > 0 ? localMenuItems : menuItems;
  
  const categories = ['all', ...new Set(displayMenuItems.map(item => item.category))];
  
  const filteredItems = displayMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true,
    featured: false,
    ingredients: [],
    preparationTime: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime),
        ingredients: formData.ingredients.filter(ing => ing.trim() !== '')
      };

      let result;
      if (editingItem) {
        result = await retryOperation(() => updateMenuItem(editingItem.id, itemData));
      } else {
        result = await retryOperation(() => addMenuItem(itemData));
      }

      if (result.success) {
        // Refresh the local list
        await loadMenuItems();
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          image: '',
          available: true,
          featured: false,
          ingredients: [],
          preparationTime: ''
        });
        setShowAddForm(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      available: item.available,
      featured: item.featured || false,
      ingredients: item.ingredients || [],
      preparationTime: item.preparationTime?.toString() || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (item) => {
    setPendingDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      try {
        const result = await retryOperation(() => deleteMenuItem(pendingDelete.id));
        if (result.success) {
          await loadMenuItems(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
    setPendingDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleIngredientsChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // Analytics calculations
  const getMenuAnalytics = () => {
    const total = displayMenuItems.length;
    const available = displayMenuItems.filter(item => item.available).length;
    const featured = displayMenuItems.filter(item => item.featured).length;
    const categoryStats = {};
    
    displayMenuItems.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });

    const avgPrice = displayMenuItems.reduce((sum, item) => sum + item.price, 0) / total;
    
    return {
      total,
      available,
      featured,
      unavailable: total - available,
      categoryStats,
      avgPrice: avgPrice || 0
    };
  };

  const analytics = getMenuAnalytics();

  // Chart data
  const categoryChartData = Object.entries(analytics.categoryStats).map(([category, count]) => ({
    category,
    count,
    percentage: (count / analytics.total * 100).toFixed(1)
  }));

  const priceRangeData = [
    { range: '$0-$10', count: displayMenuItems.filter(item => item.price < 10).length },
    { range: '$10-$20', count: displayMenuItems.filter(item => item.price >= 10 && item.price < 20).length },
    { range: '$20-$30', count: displayMenuItems.filter(item => item.price >= 20 && item.price < 30).length },
    { range: '$30+', count: displayMenuItems.filter(item => item.price >= 30).length }
  ];

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];

  // Connection status component
  const ConnectionStatus = () => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
      apiConnected 
        ? 'bg-green-100 text-green-700' 
        : 'bg-yellow-100 text-yellow-700'
    }`}>
      {apiConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span>{apiConnected ? 'API Connected' : 'Using Local Data'}</span>
    </div>
  );

  // Error handling component
  const ErrorAlert = () => {
    if (!hasError('menuItems')) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span className="font-medium">Error Loading Menu Items</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={() => {
            clearError('menuItems');
            loadMenuItems();
          }}
          className="mt-2 flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu items and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw size={16} className="animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>
      </div>

      <ErrorAlert />

      {/* View Toggle and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="inline mr-2" size={16} />
            Menu Items
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'analytics'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="inline mr-2" size={16} />
            Analytics
          </button>
        </div>

        {viewMode === 'grid' && (
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingItem(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category: '',
                  image: '',
                  available: true,
                  featured: false,
                  ingredients: [],
                  preparationTime: ''
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>
        )}
      </div>

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.available}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-yellow-600">{analytics.featured}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Price</p>
                  <p className="text-2xl font-bold text-purple-600">${analytics.avgPrice.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart size={20} />
                Category Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Price Range Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Price Range Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      {viewMode === 'grid' && !showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={item.image || '/api/placeholder/300/200'}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {item.featured && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Star size={12} className="inline mr-1" />
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                  <span className="text-lg font-bold text-red-600">${item.price}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{item.category}</span>
                  {item.preparationTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {item.preparationTime}m
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors menu-delete-btn disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Pizza, Burgers, Appetizers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="15"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Describe the menu item..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ingredients
              </label>
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientsChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter ingredient"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Plus size={16} />
                  Add Ingredient
                </button>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Available</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured Item</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading && <RefreshCw size={16} className="animate-spin" />}
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{pendingDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setPendingDelete(null);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading && <RefreshCw size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
