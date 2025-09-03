import React from 'react';
import { useSelector } from 'react-redux';
import { selectMenuItems, selectMenuLoading } from '../../store/features/menuSlice';
import { X, Trash2 } from '../common/Icons';

export function AddOrderModal({ 
  showModal, 
  onClose, 
  newOrder, 
  setNewOrder, 
  onSubmit 
}) {
  const menuItems = useSelector(selectMenuItems);
  const menuLoading = useSelector(selectMenuLoading);

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

          {/* Menu Items Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Menu Items</h3>
            {menuLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading menu items...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
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
                ))}
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
