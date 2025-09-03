import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Star, Clock, ShoppingCart, Search, Filter, Heart, DollarSign } from '../common/Icons';
import { 
  addToCart, 
  removeFromCart,
  selectCart,
  selectCartTotal 
} from '../../store/features/orderSlice';
import { 
  fetchMenuItems,
  selectMenuItems,
  selectMenuLoading,
  selectMenuError 
} from '../../store/features/menuSlice';
import { CartCheckout } from '../Cart/CartCheckout';

export function CustomerMenuRedux() {
  const dispatch = useDispatch();
  const menuItems = useSelector(selectMenuItems);
  const cart = useSelector(selectCart);
  const cartTotal = useSelector(selectCartTotal);
  const loading = useSelector(selectMenuLoading);
  const error = useSelector(selectMenuError);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Fetch menu items on component mount
  useEffect(() => {
    dispatch(fetchMenuItems());
  }, [dispatch]);

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const isAvailable = item.available;
    return matchesSearch && matchesCategory && isAvailable;
  });

  const toggleFavorite = (itemId) => {
    setFavoriteItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getCartQuantity = (itemId) => {
    const cartItem = cart.find(item => item.menuItemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (itemId) => {
    dispatch(addToCart({ menuItemId: itemId, quantity: 1 }));
  };

  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Error loading menu</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header with Cart */}
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-gray-600">Discover our delicious offerings</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
        {filteredItems.map((item) => {
          const cartQuantity = getCartQuantity(item.id);
          const isFavorite = favoriteItems.includes(item.id);
          
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                    isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                {item.featured && (
                  <span className="absolute top-3 left-3 bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
                  <span className="text-xl font-bold text-orange-600 ml-2">৳{item.price.toFixed(2)}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{item.preparationTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>4.{Math.floor(Math.random() * 9) + 1}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {cartQuantity > 0 ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item.id)}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Cart Checkout Modal */}
      <CartCheckout 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />
    </div>
  );
}
