import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
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

export function MenuManagement({ readOnly = false }) {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();
  const isReadOnly = readOnly; // Admin has full access
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'analytics'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Delete confirmation handlers
  const handleDeleteClick = (item) => {
    setPendingDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteMenuItem(pendingDelete.id);
    }
    setPendingDelete(null);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
    setShowDeleteConfirm(false);
  };

  // Enhanced Analytics data with comprehensive demo data
  const getMenuAnalytics = () => {
    // Rich category distribution with performance metrics
    const categoryData = [
      { name: 'Main Courses', count: 18, avgPrice: 450, sales: 2250, popularity: 92 },
      { name: 'Appetizers', count: 12, avgPrice: 180, sales: 1680, popularity: 78 },
      { name: 'Beverages', count: 15, avgPrice: 120, sales: 1890, popularity: 85 },
      { name: 'Desserts', count: 8, avgPrice: 200, sales: 945, popularity: 68 },
      { name: 'Specials', count: 6, avgPrice: 650, sales: 1425, popularity: 75 },
    ];

    // Enhanced price range distribution with revenue insights
    const priceDistribution = [
      { name: '৳0-150', count: 22, revenue: 18450, margin: 65 },
      { name: '৳151-300', count: 15, revenue: 24800, margin: 58 },
      { name: '৳301-500', count: 12, revenue: 32100, margin: 62 },
      { name: '৳501-800', count: 8, revenue: 28600, margin: 70 },
      { name: '৳800+', count: 4, revenue: 19250, margin: 75 },
    ];

    // Detailed preparation time analysis with efficiency metrics
    const prepTimeData = [
      { name: 'Quick (≤10 min)', count: 18, efficiency: 95, customerSat: 4.6 },
      { name: 'Fast (11-20 min)', count: 22, efficiency: 88, customerSat: 4.5 },
      { name: 'Medium (21-35 min)', count: 15, efficiency: 82, customerSat: 4.3 },
      { name: 'Slow (36-50 min)', count: 6, efficiency: 75, customerSat: 4.1 },
      { name: 'Very Slow (50+ min)', count: 3, efficiency: 68, customerSat: 3.9 },
    ];

    // Enhanced popular items with comprehensive metrics
    const popularItems = [
      { name: 'Chicken Biryani', orders: 145, revenue: 65250, rating: 4.8, profit: 28600 },
      { name: 'Beef Curry', orders: 128, revenue: 51200, rating: 4.6, profit: 22540 },
      { name: 'Fish Fry', orders: 112, revenue: 33600, rating: 4.7, profit: 14784 },
      { name: 'Mutton Korma', orders: 98, revenue: 58800, rating: 4.5, profit: 25872 },
      { name: 'Prawn Masala', orders: 89, revenue: 53400, rating: 4.4, profit: 23496 },
      { name: 'Vegetable Curry', orders: 76, revenue: 15200, rating: 4.3, profit: 6688 },
      { name: 'Dal Fry', orders: 68, revenue: 10200, rating: 4.2, profit: 4488 },
      { name: 'Fried Rice', orders: 61, revenue: 18300, rating: 4.4, profit: 8052 },
    ];

    // Weekly performance trends
    const weeklyTrends = [
      { week: 'Week 1', orders: 456, revenue: 182400, newItems: 2 },
      { week: 'Week 2', orders: 523, revenue: 209200, newItems: 1 },
      { week: 'Week 3', orders: 498, revenue: 199200, newItems: 3 },
      { week: 'Week 4', orders: 612, revenue: 244800, newItems: 0 },
      { week: 'Week 5', orders: 578, revenue: 231200, newItems: 2 },
      { week: 'Week 6', orders: 634, revenue: 253600, newItems: 1 },
      { week: 'Week 7', orders: 689, revenue: 275600, newItems: 4 },
      { week: 'Week 8', orders: 712, revenue: 284800, newItems: 1 },
    ];

    // Customer preference analysis
    const customerPreferences = [
      { preference: 'Spicy', percentage: 68, trend: '+5%' },
      { preference: 'Mild', percentage: 45, trend: '+2%' },
      { preference: 'Vegetarian', percentage: 32, trend: '+12%' },
      { preference: 'Gluten-Free', percentage: 18, trend: '+8%' },
      { preference: 'Low-Carb', percentage: 25, trend: '+15%' },
    ];

    return { 
      categoryData, 
      priceDistribution, 
      prepTimeData, 
      popularItems, 
      weeklyTrends, 
      customerPreferences 
    };
  };

  const analytics = getMenuAnalytics();

  const COLORS = ['#6B0000', '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C', '#FF006E'];

  const MenuAnalytics = () => (
    <div className="space-y-6">
      {/* Menu Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-brand-dark/10 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-brand-dark" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ৳{(menuItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) / menuItems.length || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Prep Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(menuItems.reduce((sum, item) => sum + item.preparationTime, 0) / menuItems.length || 0)} min
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Featured Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {menuItems.filter(item => item.featured).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Performance Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-dark/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-dark" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
                <p className="text-sm text-gray-500">Sales and popularity metrics</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'sales' ? `৳${value}` : `${value}${name === 'popularity' ? '%' : ''}`,
                name === 'sales' ? 'Revenue' : name === 'popularity' ? 'Popularity' : 'Items Count'
              ]} />
              <Legend />
              <Bar dataKey="count" fill="#C92E33" name="Items" />
              <Bar dataKey="sales" fill="#E6353B" name="Revenue (৳)" />
              <Bar dataKey="popularity" fill="#22C55E" name="Popularity %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-dark/10 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-brand-dark" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue by Price Range</h3>
                <p className="text-sm text-gray-500">Income distribution analysis</p>
              </div>
            </div>
          </div>
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
                dataKey="revenue"
              >
                {analytics.priceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`৳${value}`, 'Revenue']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Preparation Efficiency Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kitchen Efficiency</h3>
                <p className="text-sm text-gray-500">Prep time vs satisfaction</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.prepTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                `${value}${name === 'efficiency' || name === 'customerSat' ? '%' : ''}`,
                name === 'efficiency' ? 'Efficiency' : name === 'customerSat' ? 'Customer Rating' : 'Items Count'
              ]} />
              <Legend />
              <Area type="monotone" dataKey="count" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Items" />
              <Area type="monotone" dataKey="efficiency" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.4} name="Efficiency %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Items Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
                <p className="text-sm text-gray-500">Orders, revenue & profitability</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.popularItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                name === 'orders' ? value : name === 'rating' ? `${value}/5.0` : `৳${value.toLocaleString()}`,
                name === 'orders' ? 'Orders' : name === 'rating' ? 'Rating' : name === 'revenue' ? 'Revenue' : 'Profit'
              ]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#C92E33" strokeWidth={3} name="Orders" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#E6353B" strokeWidth={2} name="Revenue (৳)" />
              <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit (৳)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trends Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
                <p className="text-sm text-gray-500">Order trends and new items</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? `৳${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'New Items'
              ]} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="orders" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Orders" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} name="Revenue (৳)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Customer Preferences</h3>
                <p className="text-sm text-gray-500">Trending dietary preferences</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.customerPreferences} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="preference" type="category" />
              <Tooltip formatter={(value) => [`${value}%`, 'Preference Rate']} />
              <Bar dataKey="percentage" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories by Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Category Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Category</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Items</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {analytics.categoryData.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 font-medium text-gray-900">{category.name}</td>
                    <td className="py-3 px-2 text-right text-gray-600">{category.count}</td>
                    <td className="py-3 px-2 text-right font-semibold text-brand-dark">৳{category.avgPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Quick Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Most Expensive Item:</span>
              <span className="font-bold text-brand-dark">৳{Math.max(...menuItems.map(item => parseFloat(item.price || 0))).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Least Expensive Item:</span>
              <span className="font-bold text-green-600">৳{Math.min(...menuItems.map(item => parseFloat(item.price || 0))).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Longest Prep Time:</span>
              <span className="font-bold text-blue-600">{Math.max(...menuItems.map(item => item.preparationTime))} min</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Shortest Prep Time:</span>
              <span className="font-bold text-blue-600">{Math.min(...menuItems.map(item => item.preparationTime))} min</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Available Items:</span>
              <span className="font-bold text-green-600">{menuItems.filter(item => item.available).length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Unavailable Items:</span>
              <span className="font-bold text-red-600">{menuItems.filter(item => !item.available).length}</span>
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
      preparation_time: parseInt(formData.preparationTime),
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
      preparation_time: parseInt(formData.preparationTime),
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
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(item?.image || '');
    const [dragActive, setDragActive] = useState(false);

    // Handle image file selection
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageFile(file);
      }
    };

    const handleImageFile = (file) => {
      if (file && file.type.startsWith('image/')) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          return;
        }
        
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          setImagePreview(imageUrl);
          setFormData({...formData, image: imageUrl});
        };
        reader.onerror = (e) => {
          console.error('FileReader error:', e);
          alert('Error reading file');
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file');
      }
    };

    // Handle drag and drop
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (min)</label>
                <input
                  type="number"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              
              {/* Image Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-brand-dark bg-brand-light/10' 
                    : 'border-gray-300 hover:border-brand-dark hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setFormData({...formData, image: ''});
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium text-brand-dark cursor-pointer hover:underline">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              {/* Alternative: Image URL Input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Or enter image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                  value={formData.image.startsWith('data:') ? '' : formData.image}
                  onChange={(e) => {
                    const url = e.target.value;
                    setFormData({...formData, image: url});
                    setImagePreview(url);
                    setImageFile(null);
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (comma-separated)</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                value={formData.ingredients}
                onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
              />
            </div>
            <div className="flex space-x-3 pt-6">
              <button
                type="submit"
                className="flex-1 bg-brand-dark text-white py-3 px-4 rounded-lg hover:bg-brand-light focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 transition-all font-medium"
              >
                {item ? 'Update' : 'Add'} Item
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-medium"
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
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen font-inter">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isReadOnly ? 'Menu Items' : 'Menu Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isReadOnly 
              ? 'Browse available menu items and their details.'
              : 'Manage your restaurant\'s menu items and track performance analytics.'
            }
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 overflow-hidden">
            {/* Animated background slider */}
            <div 
              className={`absolute top-1 bottom-1 bg-brand-dark rounded-md transition-all duration-300 ease-in-out z-0 ${
                viewMode === 'grid' ? 'left-1 right-1/2 mr-0.5' : 'right-1 left-1/2 ml-0.5'
              }`}
            />
            <button
              onClick={() => setViewMode('grid')}
              className={`relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                viewMode === 'grid'
                  ? 'text-white scale-105 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>Menu Items</span>
                {viewMode === 'grid' && (
                  <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                viewMode === 'analytics'
                  ? 'text-white scale-105 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>Analytics</span>
                {viewMode === 'analytics' && (
                  <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </span>
            </button>
          </div>
          {viewMode === 'grid' && !isReadOnly && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-brand-dark text-white px-6 py-2 rounded-lg hover:bg-brand-light focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 flex items-center space-x-2 shadow-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 group"
            >
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              <span className="transition-all duration-300 group-hover:tracking-wide">Add Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Content with smooth transitions */}
      <div className="relative overflow-hidden">
        {viewMode === 'analytics' ? (
          <div className="animate-slideInRight">
            <MenuAnalytics />
          </div>
        ) : (
          <div className="animate-slideInLeft">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover-scale">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all min-w-[160px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-brand-light transition-all duration-500 group flex flex-col h-full transform hover:-translate-y-2 hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="relative flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image || '/api/placeholder/300/200'}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      if (e.target.src !== '/api/placeholder/300/200') {
                        e.target.src = '/api/placeholder/300/200';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 flex items-center space-x-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {item.featured && (
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`w-3 h-3 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg flex-1 min-w-0 truncate pr-2">{item.name}</h3>
                    <span className="text-xl font-bold text-brand-dark whitespace-nowrap">৳{parseFloat(item.price || 0).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{item.preparationTime} min</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      item.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600 truncate">
                        {ingredient}
                      </span>
                    ))}
                    {item.ingredients.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                        +{item.ingredients.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  {!isReadOnly && (
                    <div className="flex space-x-2 mt-auto opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
                      <button
                        onClick={() => setEditingItem(item)}
                          className="flex-1 bg-brand-dark text-white py-2 px-3 rounded-lg hover:bg-brand-light focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 flex items-center justify-center space-x-1 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                          <Edit className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="flex-1 bg-brand-light text-white py-2 px-3 rounded-lg hover:bg-brand-dark focus:ring-2 focus:ring-brand-light focus:ring-offset-2 flex items-center justify-center space-x-1 transition-all duration-300 transform hover:scale-105 active:scale-95 menu-delete-btn"
                        >
                          <Trash2 className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                          <span>Delete</span>
                        </button>
                      </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && !isReadOnly && (
        <MenuItemForm
          onSubmit={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      
      {editingItem && !isReadOnly && (
        <MenuItemForm
          item={editingItem}
          onSubmit={handleUpdateItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && !isReadOnly && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full text-center border border-red-300">
            <div className="text-4xl mb-4">🗑️</div>
            <div className="text-xl font-bold mb-4 text-red-600">Delete Menu Item?</div>
            <div className="text-lg mb-2 text-gray-700">
              Are you sure you want to delete <span className="font-semibold text-gray-900">&ldquo;{pendingDelete?.name}&rdquo;</span>?
            </div>
            <div className="mb-6 text-sm text-red-500 font-medium">This action cannot be undone!</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
                onClick={confirmDelete}
              >
                Yes, Delete Item
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                onClick={cancelDelete}
              >
                Keep Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
