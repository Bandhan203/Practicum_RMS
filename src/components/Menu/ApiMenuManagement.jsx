import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  selectMenuItems,
  selectMenuLoading,
  selectMenuError 
} from '../../store/features/menuSlice';
import { menuAPI } from '../../services/api';
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
  Activity,
  Save,
  X,
  Upload
} from 'lucide-react';

export function ApiMenuManagement() {
  // Redux state
  const dispatch = useDispatch();
  const menuItems = useSelector(selectMenuItems);
  const loading = useSelector(selectMenuLoading);
  const error = useSelector(selectMenuError);
  
  // Local state for UI
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
    preparation_time: 15,
    available: true,
    featured: false,
    ingredients: [],
    dietary_info: '',
    calories: '',
    rating: 4.5
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  // Load menu items on component mount using Redux
  useEffect(() => {
    dispatch(fetchMenuItems());
    loadCategories();
  }, [dispatch]);

  // loadMenuItems function removed - now using Redux fetchMenuItems

  const loadCategories = async () => {
    try {
      const response = await menuAPI.getCategories();
      setCategories(['all', ...(response.data || response)]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Image file size must not exceed 5MB. Please choose a smaller image.');
        e.target.value = ''; // Clear the file input
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, JPG, GIF, SVG).');
        e.target.value = ''; // Clear the file input
        return;
      }

      setError(''); // Clear any previous errors
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIngredientsChange = (e) => {
    const ingredients = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      ingredients
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: null,
      preparation_time: 15,
      available: true,
      featured: false,
      ingredients: [],
      dietary_info: '',
      calories: '',
      rating: 4.5
    });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all form fields with proper formatting
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price.toString());
      submitData.append('category', formData.category);
      submitData.append('preparation_time', formData.preparation_time.toString());
      
      // Convert booleans to string for FormData
      submitData.append('available', formData.available ? '1' : '0');
      submitData.append('featured', formData.featured ? '1' : '0');
      
      // Optional fields
      if (formData.dietary_info) {
        submitData.append('dietary_info', formData.dietary_info);
      }
      
      if (formData.calories) {
        submitData.append('calories', formData.calories.toString());
      }
      
      submitData.append('rating', formData.rating.toString());
      
      // Handle ingredients array
      if (formData.ingredients && formData.ingredients.length > 0) {
        // Send as JSON string for array data
        submitData.append('ingredients', JSON.stringify(formData.ingredients));
      }
      
      // Append image file if selected
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingItem) {
        await dispatch(updateMenuItem({ id: editingItem.id, updates: submitData }));
      } else {
        await dispatch(createMenuItem(submitData));
      }

      // Redux automatically updates the state, so no need to reload
      await loadCategories();
      resetForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        setError(`Validation errors:\n${errorMessages}`);
      } else {
        console.error('Error submitting form:', error);
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: null, // Reset file input, keep existing image path for display
      preparation_time: item.preparation_time,
      available: item.available,
      featured: item.featured,
      ingredients: item.ingredients || [],
      dietary_info: item.dietary_info || '',
      calories: item.calories?.toString() || '',
      rating: item.rating
    });
    
    // Set preview for existing image
    if (item.image) {
      setImagePreview(`http://localhost:8000/storage/${item.image}`);
    } else {
      setImagePreview(null);
    }
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDeleteClick = (item) => {
    setPendingDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      try {
        await dispatch(deleteMenuItem(pendingDelete.id));
        await loadCategories();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
    setPendingDelete(null);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
    setEditingItem(null);
  };

  if (loading && menuItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant's menu items</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'analytics' : 'grid')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{viewMode === 'grid' ? 'Analytics' : 'Grid View'}</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <pre className="text-red-600 text-sm whitespace-pre-wrap">{error}</pre>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {viewMode === 'grid' && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <img
                  src={item.image ? `http://localhost:8000/storage/${item.image}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                {item.featured && (
                  <span className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
                {!item.available && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Unavailable
                  </span>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
                  <span className="text-xl font-bold text-red-600 ml-2">৳{parseFloat(item.price).toFixed(2)}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{item.preparation_time} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{parseFloat(item.rating).toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
              <p className="text-gray-500">Try adjusting your search or add new menu items.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Menu Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{menuItems.length}</div>
              <div className="text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ৳{menuItems.length > 0 ? (menuItems.reduce((sum, item) => sum + parseFloat(item.price), 0) / menuItems.length).toFixed(2) : '0.00'}
              </div>
              <div className="text-gray-600">Average Price</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {menuItems.filter(item => item.available).length}
              </div>
              <div className="text-gray-600">Available Items</div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Time (minutes)</label>
                    <input
                      type="number"
                      name="preparation_time"
                      value={formData.preparation_time}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Upload</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    name="ingredients"
                    value={formData.ingredients.join(', ')}
                    onChange={handleIngredientsChange}
                    placeholder="tomato, cheese, basil"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Info</label>
                    <input
                      type="text"
                      name="dietary_info"
                      value={formData.dietary_info}
                      onChange={handleInputChange}
                      placeholder="vegetarian, vegan, gluten-free"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Available</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Featured</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{pendingDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
