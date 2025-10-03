import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useMenuService } from '../../services/menuService';
import toast from 'react-hot-toast';
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
  Loader,
  Save,
  X
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

// Helper function to get proper image URL (moved outside component to prevent re-creation)
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/api/placeholder/300/200';
  
  // If it's already a full URL or data URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Get base URL from environment or default
  const baseUrl = 'http://localhost:8000';
  
  // If it starts with 'storage/', construct full URL
  if (imagePath.startsWith('storage/')) {
    return `${baseUrl}/${imagePath}`;
  }
  
  // If it starts with 'menu-images/', it's in storage/app/public/
  if (imagePath.startsWith('menu-images/')) {
    const imageUrl = `${baseUrl}/storage/${imagePath}`;
    return imageUrl;
  }
  
  // For other paths, try to construct storage URL
  const imageUrl = `${baseUrl}/storage/menu-images/${imagePath}`;
  return imageUrl;
};

export function BackendMenuManagement({ readOnly = false }) {
  const { 
    menuItems, 
    loading, 
    createMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    categories,
    searchItems,
    getItemsByCategory 
  } = useMenuService();
  const isReadOnly = readOnly; // Admin has full access
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'analytics'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use categories from service, fallback to calculated categories (memoized to prevent re-calculations)
  const allCategories = useMemo(() => {
    return categories && categories.length > 0 
      ? ['all', ...categories.filter(cat => cat !== 'all')] 
      : ['all', ...new Set(menuItems.map(item => item.category).filter(cat => cat && cat !== 'all'))];
  }, [categories, menuItems]);
  
  // Memoize filtered items to prevent unnecessary recalculations
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  // Menu items are automatically loaded by useMenuService hook
  // No need for manual loadMenuItems call

  // Delete confirmation handlers
  const handleDeleteClick = (item) => {
    setPendingDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    
    setIsLoading(true);
    try {
      const result = await deleteMenuItem(pendingDelete.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete menu item');
    } finally {
      setIsLoading(false);
      setPendingDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
    setShowDeleteConfirm(false);
  };

  // Enhanced Analytics data with comprehensive demo data (memoized to prevent recalculation)
  const analytics = useMemo(() => {
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
  }, []); // Empty dependency array since it's static demo data

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
                ৳{(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length || 0).toFixed(2)}
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
                {Math.round(menuItems.reduce((sum, item) => sum + (item.preparation_time || 0), 0) / menuItems.length || 0)} min
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
      </div>
    </div>
  );

  const handleAddItem = async (formData) => {
    setIsLoading(true);
    try {
      let submitData;
      
      if (formData instanceof FormData) {
        // Handle file upload
        submitData = formData;
      } else {
        // Handle regular form data
        submitData = {
          ...formData,
          price: parseFloat(formData.price),
          preparation_time: parseInt(formData.preparationTime),
          available: true,
          featured: false,
          ingredients: formData.ingredients ? JSON.stringify(formData.ingredients.split(',').map(i => i.trim())) : JSON.stringify([])
        };
      }
      
      const result = await createMenuItem(submitData);
      
      if (result.success) {
        toast.success(result.message || 'Menu item created successfully!');
        setShowAddForm(false);
        // No need to reload - service automatically updates
      } else {
        toast.error(result.message || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (formData) => {
    if (!editingItem) return;
    
    setIsLoading(true);
    try {
      let submitData;
      
      if (formData instanceof FormData) {
        // Handle file upload - append the method override for Laravel
        formData.append('_method', 'PUT');
        submitData = formData;
      } else {
        // Handle regular form data
        submitData = {
          ...formData,
          price: parseFloat(formData.price),
          preparation_time: parseInt(formData.preparationTime),
          ingredients: formData.ingredients ? JSON.stringify(formData.ingredients.split(',').map(i => i.trim())) : JSON.stringify([])
        };
      }
      
      const result = await updateMenuItem(editingItem.id, submitData);
      
      if (result.success) {
        toast.success(result.message || 'Menu item updated successfully!');
        setEditingItem(null);
        // No need to reload - service automatically updates
      } else {
        toast.error(result.message || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const MenuItemForm = ({ item, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      category: item?.category || '',
      preparationTime: item?.preparation_time || item?.preparationTime || '',
      ingredients: Array.isArray(item?.ingredients) ? item.ingredients.join(', ') : 
                    (typeof item?.ingredients === 'string' ? 
                      JSON.parse(item.ingredients).join(', ') : '') || ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [dragActive, setDragActive] = useState(false);



    // Sample data for auto-fill
    const sampleMenuItems = [
      {
        name: 'Chicken Burger',
        description: 'Juicy grilled chicken breast with lettuce, tomato, and special sauce',
        price: '12.99',
        category: 'Main Course',
        preparationTime: '15',
        ingredients: 'chicken breast, lettuce, tomato, sauce, bun'
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing',
        price: '8.99',
        category: 'Salads',
        preparationTime: '10',
        ingredients: 'romaine lettuce, parmesan cheese, croutons, caesar dressing'
      },
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil',
        price: '14.99',
        category: 'Pizza',
        preparationTime: '20',
        ingredients: 'pizza dough, tomato sauce, mozzarella, basil, olive oil'
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich and moist chocolate cake with chocolate frosting',
        price: '6.99',
        category: 'Desserts',
        preparationTime: '5',
        ingredients: 'chocolate cake, chocolate frosting, cocoa powder'
      }
    ];

    // Auto-fill function with guaranteed working image
    const handleAutoFill = () => {
      const randomItem = sampleMenuItems[Math.floor(Math.random() * sampleMenuItems.length)];
      setFormData(randomItem);
      // Set guaranteed working image URLs
      const workingImages = [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format'
      ];
      const randomImage = workingImages[Math.floor(Math.random() * workingImages.length)];
      setImagePreview(randomImage);
      setSelectedFile(null);
      toast.success('Form auto-filled with working image!');
    };

    // Set initial image preview when editing an item
    useEffect(() => {
      if (item?.image) {
        const imageUrl = getImageUrl(item.image);
        setImagePreview(imageUrl);
      } else {
        setImagePreview('');
      }
    }, [item]);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageFile(file);
      }
    };

    const handleImageFile = (file) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview with force update
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        console.log('✅ Image loaded successfully, length:', imageDataUrl.length);
        setImagePreview(imageDataUrl);
        // Force component update
        setTimeout(() => {
          setImagePreview(imageDataUrl);
        }, 100);
      };
      reader.onerror = (e) => {
        console.error('FileReader error:', e);
        toast.error('Error reading file');
        setImagePreview('');
      };
      reader.readAsDataURL(file);
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
      
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Description is required');
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Valid price is required');
        return;
      }
      if (!formData.category.trim()) {
        toast.error('Category is required');
        return;
      }
      if (!imagePreview && !selectedFile) {
        toast.error('Image is required - please upload an image or provide URL');
        return;
      }
      
      // Create FormData for file upload if file is selected
      if (selectedFile) {
        const submitData = new FormData();
        submitData.append('name', formData.name.trim());
        submitData.append('description', formData.description.trim());
        submitData.append('price', formData.price);
        submitData.append('category', formData.category.trim());
        submitData.append('preparation_time', formData.preparationTime || '10');
        submitData.append('ingredients', JSON.stringify(formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : []));
        submitData.append('image', selectedFile);
        submitData.append('available', '1');
        submitData.append('featured', '0');
        
        onSubmit(submitData);
      } else if (imagePreview) {
        // Handle data URL or HTTP URL - simplified approach
        if (imagePreview.startsWith('data:')) {
          // Convert data URL to blob and create file
          handleDataUrlSubmit();
        } else {
          // HTTP URL - create FormData
          const submitData = new FormData();
          submitData.append('name', formData.name.trim());
          submitData.append('description', formData.description.trim());
          submitData.append('price', formData.price);
          submitData.append('category', formData.category.trim());
          submitData.append('preparation_time', formData.preparationTime || '10');
          submitData.append('ingredients', JSON.stringify(formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : []));
          submitData.append('available', '1');
          submitData.append('featured', '0');
          submitData.append('image_url', imagePreview);
          
          onSubmit(submitData);
        }
      } else {
        toast.error('Please select an image or provide image URL');
      }
    };

    // Separate async function for handling data URL
    const handleDataUrlSubmit = async () => {
      try {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const file = new File([blob], 'uploaded-image.jpg', { type: blob.type });
        
        const submitData = new FormData();
        submitData.append('name', formData.name.trim());
        submitData.append('description', formData.description.trim());
        submitData.append('price', formData.price);
        submitData.append('category', formData.category.trim());
        submitData.append('preparation_time', formData.preparationTime || '10');
        submitData.append('ingredients', JSON.stringify(formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : []));
        submitData.append('image', file);
        submitData.append('available', '1');
        submitData.append('featured', '0');
        
        onSubmit(submitData);
      } catch (error) {
        console.error('Error converting data URL to file:', error);
        toast.error('Error processing image');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {item ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            <div className="flex items-center space-x-2">
              {!item && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    title="Fill form with sample data"
                  >
                    Auto Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Simulate clicking the file input
                      const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
                      if (fileInput) {
                        fileInput.click();
                        toast.success('Click to upload your local image file!');
                      }
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                    title="Upload local image file"
                  >
                    📁 Local File
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
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
              <div className="space-y-4">
                {/* Simple File Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload image</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setSelectedFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {/* Alternative: Image URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or paste image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
                      onChange={(e) => {
                        const url = e.target.value.trim();
                        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                          console.log('✅ Setting image URL:', url);
                          setImagePreview(url);
                          setSelectedFile(null);
                        }
                      }}
                    />
                    {/* Enhanced test buttons with more options */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format&q=80';
                          setImagePreview(testUrl);
                          setSelectedFile(null);
                          const urlInput = document.querySelector('input[type="url"]');
                          if (urlInput) urlInput.value = testUrl;
                          console.log('✅ Burger image set:', testUrl);
                          toast.success('Burger image loaded!');
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        🍔 Burger
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format&q=80';
                          setImagePreview(testUrl);
                          setSelectedFile(null);
                          const urlInput = document.querySelector('input[type="url"]');
                          if (urlInput) urlInput.value = testUrl;
                          console.log('✅ Pizza image set:', testUrl);
                          toast.success('Pizza image loaded!');
                        }}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        🍕 Pizza
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop&auto=format&q=80';
                          setImagePreview(testUrl);
                          setSelectedFile(null);
                          const urlInput = document.querySelector('input[type="url"]');
                          if (urlInput) urlInput.value = testUrl;
                          console.log('✅ Curry image set:', testUrl);
                          toast.success('Curry image loaded!');
                        }}
                        className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                      >
                        🍛 Curry
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format&q=80';
                          setImagePreview(testUrl);
                          setSelectedFile(null);
                          const urlInput = document.querySelector('input[type="url"]');
                          if (urlInput) urlInput.value = testUrl;
                          console.log('✅ Rice image set:', testUrl);
                          toast.success('Rice image loaded!');
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                      >
                        🍚 Rice
                      </button>
                    </div>
                  </div>
                </div>

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
                disabled={isLoading}
                className="flex-1 bg-brand-dark text-white py-3 px-4 rounded-lg hover:bg-brand-light focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isLoading ? 'Saving...' : (item ? 'Update' : 'Add')} Item</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
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
              disabled={isLoading}
              className="bg-brand-dark text-white px-6 py-2 rounded-lg hover:bg-brand-light focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 flex items-center space-x-2 shadow-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />}
              <span className="transition-all duration-300 group-hover:tracking-wide">
                {isLoading ? 'Loading...' : 'Add Item'}
              </span>
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
                  {allCategories.map(category => (
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
                      src={
                        item.image && item.image !== 'null'
                          ? item.image.startsWith('http') || item.image.startsWith('data:')
                            ? item.image 
                            : `http://localhost:8000/storage/${item.image}?t=${Date.now()}`
                          : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format&q=80'
                      }
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                      onError={(e) => {
                        console.log('❌ Image failed to load:', e.target.src);
                        console.log('⚠️ Item data:', item);
                        console.log('🔍 Image path:', item.image);
                        // Try without cache busting first
                        if (e.target.src.includes('?t=')) {
                          e.target.src = `http://localhost:8000/storage/${item.image}`;
                        } else {
                          e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format&q=80';
                        }
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully for:', item.name, 'Path:', item.image);
                      }}
                      style={{ display: 'block' }}
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
                      <span className="text-xl font-bold text-brand-dark whitespace-nowrap">৳{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{item.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{item.preparation_time || item.preparationTime || 0} min</span>
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
                      {(Array.isArray(item.ingredients) ? item.ingredients : 
                        (typeof item.ingredients === 'string' ? JSON.parse(item.ingredients || '[]') : []))
                        .slice(0, 3).map((ingredient, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600 truncate">
                            {ingredient}
                          </span>
                        ))}
                      {(Array.isArray(item.ingredients) ? item.ingredients : 
                        (typeof item.ingredients === 'string' ? JSON.parse(item.ingredients || '[]') : [])).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                          +{(Array.isArray(item.ingredients) ? item.ingredients : 
                            (typeof item.ingredients === 'string' ? JSON.parse(item.ingredients || '[]') : [])).length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {!isReadOnly && (
                      <div className="flex space-x-2 mt-auto opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
                        <button
                          onClick={() => setEditingItem(item)}
                          disabled={isLoading}
                          className="flex-1 bg-brand-dark text-white py-2 px-3 rounded-lg hover:bg-brand-light focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 flex items-center justify-center space-x-1 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          disabled={isLoading}
                          className="flex-1 bg-brand-light text-white py-2 px-3 rounded-lg hover:bg-brand-dark focus:ring-2 focus:ring-brand-light focus:ring-offset-2 flex items-center justify-center space-x-1 transition-all duration-300 transform hover:scale-105 active:scale-95 menu-delete-btn disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                onClick={confirmDelete}
                disabled={isLoading}
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                <span>{isLoading ? 'Deleting...' : 'Yes, Delete Item'}</span>
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={cancelDelete}
                disabled={isLoading}
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