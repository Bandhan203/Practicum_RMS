import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Clock, 
  DollarSign,
  Search,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity
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

export function MenuManagement() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, orders } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'analytics'

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Analytics data calculations
  const getMenuAnalytics = () => {
    // Category distribution
    const categoryData = categories.filter(cat => cat !== 'all').map(category => ({
      name: category,
      count: menuItems.filter(item => item.category === category).length,
      avgPrice: menuItems
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + item.price, 0) / 
        menuItems.filter(item => item.category === category).length || 0
    }));

    // Price range distribution
    const priceRanges = [
      { name: '৳0-100', min: 0, max: 100 },
      { name: '৳101-300', min: 101, max: 300 },
      { name: '৳301-500', min: 301, max: 500 },
      { name: '৳501-1000', min: 501, max: 1000 },
      { name: '৳1000+', min: 1001, max: Infinity }
    ];

    const priceDistribution = priceRanges.map(range => ({
      name: range.name,
      count: menuItems.filter(item => item.price >= range.min && item.price <= range.max).length
    }));

    // Preparation time analysis
    const prepTimeData = [
      { name: 'Quick (≤15 min)', count: menuItems.filter(item => item.preparationTime <= 15).length },
      { name: 'Medium (16-30 min)', count: menuItems.filter(item => item.preparationTime > 15 && item.preparationTime <= 30).length },
      { name: 'Long (31-60 min)', count: menuItems.filter(item => item.preparationTime > 30 && item.preparationTime <= 60).length },
      { name: 'Very Long (>60 min)', count: menuItems.filter(item => item.preparationTime > 60).length }
    ];

    // Popular items based on orders (mock data for demonstration)
    const popularItems = menuItems
      .map(item => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        orders: Math.floor(Math.random() * 100) + 10, // Mock order count
        revenue: (Math.floor(Math.random() * 100) + 10) * item.price
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 8);

    return { categoryData, priceDistribution, prepTimeData, popularItems };
  };

  const analytics = getMenuAnalytics();

  const COLORS = ['#6B0000', '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C', '#FF006E'];

  const MenuAnalytics = () => (
    <div className="space-y-6">
      {/* Menu Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-[#6B0000]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{menuItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Price</p>
              <p className="text-2xl font-semibold text-gray-900">
                ৳ {(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Prep Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(menuItems.reduce((sum, item) => sum + item.preparationTime, 0) / menuItems.length || 0)} min
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Featured Items</p>
              <p className="text-2xl font-semibold text-gray-900">
                {menuItems.filter(item => item.featured).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#6B0000]" />
            Items by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Items' : 'Avg Price (৳)']} />
              <Legend />
              <Bar dataKey="count" fill="#6B0000" name="Items" />
              <Bar dataKey="avgPrice" fill="#FF6B35" name="Avg Price (৳)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-[#6B0000]" />
            Price Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={analytics.priceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.priceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Preparation Time Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#6B0000]" />
            Preparation Time Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.prepTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#6B0000" fill="#6B0000" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Items */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[#6B0000]" />
            Popular Items (Mock Data)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.popularItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                name === 'orders' ? value : `৳ ${value.toFixed(2)}`,
                name === 'orders' ? 'Orders' : 'Revenue'
              ]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#6B0000" strokeWidth={2} name="Orders" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} name="Revenue (৳)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories by Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">Items</th>
                  <th className="text-right py-2">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {analytics.categoryData.map((category, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-medium">{category.name}</td>
                    <td className="py-2 text-right">{category.count}</td>
                    <td className="py-2 text-right">৳ {category.avgPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Most Expensive Item:</span>
              <span className="font-semibold">৳ {Math.max(...menuItems.map(item => item.price)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Least Expensive Item:</span>
              <span className="font-semibold">৳ {Math.min(...menuItems.map(item => item.price)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longest Prep Time:</span>
              <span className="font-semibold">{Math.max(...menuItems.map(item => item.preparationTime))} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shortest Prep Time:</span>
              <span className="font-semibold">{Math.min(...menuItems.map(item => item.preparationTime))} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available Items:</span>
              <span className="font-semibold text-green-600">{menuItems.filter(item => item.available).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unavailable Items:</span>
              <span className="font-semibold text-red-600">{menuItems.filter(item => !item.available).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleAddItem = (formData) => {
    addMenuItem({
      ...formData,
      price: parseFloat(formData.price),
      preparationTime: parseInt(formData.preparationTime),
      available: true,
      featured: false,
      ingredients: formData.ingredients.split(',').map(i => i.trim())
    });
    setShowAddForm(false);
  };

  const handleUpdateItem = (formData) => {
    updateMenuItem(editingItem.id, {
      ...formData,
      price: parseFloat(formData.price),
      preparationTime: parseInt(formData.preparationTime),
      ingredients: formData.ingredients.split(',').map(i => i.trim())
    });
    setEditingItem(null);
  };

  const MenuItemForm = ({ item, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      category: item?.category || '',
      image: item?.image || '',
      preparationTime: item?.preparationTime || '',
      ingredients: item?.ingredients?.join(', ') || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma-separated)</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.ingredients}
                onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#6B0000] text-white py-2 px-4 rounded-md hover:bg-[#5A0000] focus:ring-2 focus:ring-[#6B0000]"
              >
                {item ? 'Update' : 'Add'} Item
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <div className="flex space-x-3">
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-[#6B0000] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Menu Items
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'analytics'
                  ? 'bg-[#6B0000] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>
          {user?.role === 'admin' && viewMode === 'grid' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#6B0000] text-white px-4 py-2 rounded-md hover:bg-[#5A0000] focus:ring-2 focus:ring-[#6B0000] flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'analytics' ? (
        <MenuAnalytics />
      ) : (
        <>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center space-x-1">
                      {item.featured && <Star className="w-4 h-4 text-yellow-500" />}
                      <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-[#6B0000]">৳ {item.price.toFixed(2)}</span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{item.preparationTime} min</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                        {ingredient}
                      </span>
                    ))}
                    {item.ingredients.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                        +{item.ingredients.length - 3} more
                      </span>
                    )}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <MenuItemForm
          onSubmit={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      
      {editingItem && (
        <MenuItemForm
          item={editingItem}
          onSubmit={handleUpdateItem}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
