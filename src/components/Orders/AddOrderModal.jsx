import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectMenuItems, selectMenuLoading, selectMenuError, fetchMenuItems } from '../../store/features/menuSlice';
import { useAuth } from '../../contexts/AuthContext';
import { X, Trash2 } from '../common/Icons';
import Cookies from 'js-cookie';
import { menuAPI } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

export function AddOrderModal({ 
  showModal, 
  onClose, 
  newOrder, 
  setNewOrder, 
  onSubmit 
}) {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const menuItems = useSelector(selectMenuItems);
  const menuLoading = useSelector(selectMenuLoading);
  const menuError = useSelector(selectMenuError);
  
  // Local state for direct API fetch
  const [directMenuItems, setDirectMenuItems] = useState([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState(null);

  // Autocomplete state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Direct API fetch method using GET request
  const fetchMenuItemsDirect = async () => {
    setDirectLoading(true);
    setDirectError(null);
    
    try {
      const token = Cookies.get('authToken');
      console.log('Direct fetch: Token available:', !!token);
      
      const response = await fetch('http://localhost:8000/api/menu-items', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Direct fetch: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Direct fetch: Full response:', data);
      
      // Handle different response structures
      let items = [];
      if (data.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data)) {
        items = data;
      } else {
        throw new Error('Unexpected response format');
      }
      
      console.log('Direct fetch: Extracted items:', items);
      setDirectMenuItems(items);
      setDirectError(null);
      
    } catch (error) {
      console.error('Direct fetch error:', error);
      setDirectError(error.message);
      setDirectMenuItems([]);
    } finally {
      setDirectLoading(false);
    }
  };

  // Fetch menu items when modal opens - try both Redux and direct methods
  useEffect(() => {
    if (showModal && isAuthenticated) {
      console.log('Fetching menu items for order modal...', { user, isAuthenticated });
      // Try Redux first
      dispatch(fetchMenuItems());
      // Also try direct fetch as backup
      fetchMenuItemsDirect();
    }
  }, [showModal, isAuthenticated, dispatch, user]);

  // Debug log for menu items (only when there are issues)
  useEffect(() => {
    console.log('Menu State Debug:', {
      redux: {
        menuItems: menuItems || 'undefined',
        menuItemsLength: menuItems ? menuItems.length : 'N/A',
        menuLoading,
        menuError
      },
      direct: {
        directMenuItems: directMenuItems || 'undefined',
        directItemsLength: directMenuItems ? directMenuItems.length : 'N/A',
        directLoading,
        directError
      },
      auth: {
        user: user ? 'User found' : 'No user',
        isAuthenticated
      }
    });
  }, [menuItems, menuLoading, menuError, directMenuItems, directLoading, directError, isAuthenticated, user]);

  // Fetch suggestions when user types in search
  useEffect(() => {
    let active = true;

    async function fetchSuggestions() {
      if (!debouncedSearch || debouncedSearch.trim().length === 0) {
        setSuggestions([]);
        setSuggestError(null);
        setSuggestLoading(false);
        return;
      }

      try {
        setSuggestLoading(true);
        setSuggestError(null);
        const res = await menuAPI.getMenuItems({ search: debouncedSearch, available: true });
        // res is the backend response data wrapper
        const items = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
        if (!active) return;
        setSuggestions(items.slice(0, 10));
        setShowSuggestions(true);
      } catch (err) {
        if (!active) return;
        console.error('Autocomplete fetch error:', err);
        setSuggestError(err.response?.data?.message || err.message);
        setSuggestions([]);
      } finally {
        if (active) setSuggestLoading(false);
      }
    }

    fetchSuggestions();

    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  // Use direct fetch items as fallback if Redux fails
  const activeMenuItems = (menuItems && menuItems.length > 0) ? menuItems : directMenuItems;
  const activeLoading = menuLoading || directLoading;
  const activeError = menuError || directError;

  if (!showModal) return null;

  const addItemToOrder = (menuItem) => {
    const existingItemIndex = newOrder.items.findIndex(item => item.id === menuItem.id);
    
    if (existingItemIndex >= 0) {
      // Item already exists, increase quantity
      updateItemQuantity(existingItemIndex, newOrder.items[existingItemIndex].quantity + 1);
    } else {
      // Add new item
      setNewOrder(prev => ({
        ...prev,
        items: [...prev.items, { ...menuItem, quantity: 1 }]
      }));
    }
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(index);
      return;
    }

    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const removeItemFromOrder = (index) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleClose = () => {
    setNewOrder({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      orderType: 'dine-in',
      tableNumber: '',
      pickupTime: '',
      items: [],
      notes: ''
    });
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Order</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={newOrder.customerName}
                onChange={(e) => setNewOrder(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={newOrder.customerPhone}
                onChange={(e) => setNewOrder(prev => ({ ...prev, customerPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={newOrder.customerEmail}
                onChange={(e) => setNewOrder(prev => ({ ...prev, customerEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Type *
              </label>
              <select
                required
                value={newOrder.orderType}
                onChange={(e) => setNewOrder(prev => ({ ...prev, orderType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="dine-in">Dine In</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>
          </div>

          {/* Order Type Specific Fields */}
          {newOrder.orderType === 'dine-in' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Number
              </label>
              <input
                type="text"
                value={newOrder.tableNumber}
                onChange={(e) => setNewOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter table number"
              />
            </div>
          )}

          {newOrder.orderType === 'pickup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Time
              </label>
              <input
                type="datetime-local"
                value={newOrder.pickupTime}
                onChange={(e) => setNewOrder(prev => ({ ...prev, pickupTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Quick Add via Search (Autocomplete) */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quick add items</h3>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!showSuggestions) setShowSuggestions(true);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search menu by name or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {suggestLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Loading…</div>
              )}
              {showSuggestions && (suggestions.length > 0 || suggestError) && (
                <div className="absolute z-[99999] mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                  {suggestError && (
                    <div className="px-3 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100">
                      {suggestError}
                    </div>
                  )}
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        addItemToOrder(s);
                        setSearchTerm('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                        inputRef.current?.blur();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center justify-between"
                    >
                      <div className="min-w-0 mr-3">
                        <div className="font-medium text-gray-900 truncate">{s.name}</div>
                        <div className="text-xs text-gray-500 truncate">{s.description}</div>
                      </div>
                      <span className="text-sm font-semibold text-orange-600 whitespace-nowrap">৳{s.price}</span>
                    </button>
                  ))}
                  {suggestions.length === 0 && !suggestError && (
                    <div className="px-3 py-2 text-sm text-gray-500">No matches found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu Items Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Menu Items</h3>
            {activeLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading menu items...</p>
                <p className="text-xs text-gray-400 mt-1">
                  {menuLoading && directLoading ? 'Trying multiple methods...' : 
                   menuLoading ? 'Loading via Redux...' : 'Loading direct API...'}
                </p>
              </div>
            ) : activeError ? (
              <div className="text-center py-8 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-600 mb-2">Error loading menu items</p>
                <p className="text-sm text-red-500">{activeError}</p>
                <div className="mt-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => dispatch(fetchMenuItems())}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Retry Redux
                  </button>
                  <button
                    type="button"
                    onClick={fetchMenuItemsDirect}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry Direct
                  </button>
                </div>
              </div>
            ) : !activeMenuItems || activeMenuItems.length === 0 ? (
              <div className="text-center py-8 border border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-2">No menu items available</p>
                <p className="text-sm text-gray-400">Please add menu items first in Menu Management</p>
                <div className="mt-4 space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Redux fetch triggered');
                      dispatch(fetchMenuItems());
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Try Redux
                  </button>
                  <button
                    type="button"
                    onClick={fetchMenuItemsDirect}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Try Direct GET
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Current state:', {
                        redux: { items: menuItems, loading: menuLoading, error: menuError },
                        direct: { items: directMenuItems, loading: directLoading, error: directError }
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Debug State
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Found {activeMenuItems.length} menu items 
                    {menuItems && menuItems.length > 0 ? ' (via Redux)' : ' (via Direct API)'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {(activeMenuItems || []).map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {item.image && (
                      <div className="h-32 w-full">
                        <img
                          src={`http://localhost:8000/storage/${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className="text-sm font-medium text-orange-600">৳{item.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                        {item.available && (
                          <button
                            type="button"
                            onClick={() => addItemToOrder(item)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Items */}
          {newOrder.items.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Items</h3>
              <div className="space-y-3">
                {newOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">৳{item.price}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium text-orange-600">৳{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeItemFromOrder(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      ৳{newOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes
            </label>
            <textarea
              value={newOrder.notes}
              onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Any special instructions or notes..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newOrder.customerName || newOrder.items.length === 0}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
