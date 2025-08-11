import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Plus, 
  Star, 
  Clock, 
  ShoppingCart,
  Search,
  Filter
} from 'lucide-react';

export function CustomerMenu() {
  const { menuItems, cart, addToCart } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const featuredItems = menuItems.filter(item => item.featured && item.available);

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cart.find(item => item.menuItemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
        <p className="text-gray-600">Discover our delicious selection of carefully crafted dishes</p>
      </div>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            Featured Dishes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{item.preparationTime} min</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item.id)}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                    {getItemQuantityInCart(item.id) > 0 && (
                      <span className="bg-orange-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getItemQuantityInCart(item.id)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items by Category */}
      <div className="space-y-8">
        {categories.filter(cat => cat !== 'all').map(category => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.featured && <Star className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
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
                      <button
                        onClick={() => addToCart(item.id)}
                        className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to Cart</span>
                        {getItemQuantityInCart(item.id) > 0 && (
                          <span className="bg-orange-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {getItemQuantityInCart(item.id)}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <div className="bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-3">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
            </span>
          </div>
        </div>
      )}
    </div>
  );
}