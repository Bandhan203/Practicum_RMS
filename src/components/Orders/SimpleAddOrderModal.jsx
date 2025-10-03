import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useMenuService } from '../../services/menuService';
import toast from 'react-hot-toast';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

export function SimpleAddOrderModal({ 
  showModal, 
  onClose, 
  onSubmit 
}) {
  const { menuItems } = useMenuService();
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    tableNumber: '',
    orderType: 'dine-in',
    notes: ''
  });

  // Menu items are automatically loaded by useMenuService
  // No need for useEffect or loadMenuItems call

  const addItemToOrder = (menuItem) => {
    const existingItemIndex = selectedItems.findIndex(item => item.id === menuItem.id);
    
    if (existingItemIndex >= 0) {
      // Item already exists, increase quantity
      setSelectedItems(prev => prev.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item
      setSelectedItems(prev => [...prev, { ...menuItem, quantity: 1 }]);
    }
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = () => {
    if (!orderData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    const orderToSubmit = {
      ...orderData,
      items: selectedItems,
      totalAmount: calculateTotal(),
      status: 'pending'
    };

    onSubmit(orderToSubmit);
    
    // Reset form
    setOrderData({
      customerName: '',
      customerPhone: '',
      tableNumber: '',
      orderType: 'dine-in',
      notes: ''
    });
    setSelectedItems([]);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-medium text-gray-900">Customer Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={orderData.customerName}
                  onChange={(e) => setOrderData({...orderData, customerName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={orderData.customerPhone}
                  onChange={(e) => setOrderData({...orderData, customerPhone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                <select
                  value={orderData.orderType}
                  onChange={(e) => setOrderData({...orderData, orderType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                >
                  <option value="dine-in">Dine In</option>
                  <option value="takeout">Takeout</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              {orderData.orderType === 'dine-in' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                  <input
                    type="text"
                    value={orderData.tableNumber}
                    onChange={(e) => setOrderData({...orderData, tableNumber: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                    placeholder="e.g., T-01"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={orderData.notes}
                  onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent"
                  rows={3}
                  placeholder="Special instructions..."
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                          <span>{item.name}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(index)}
                              className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 font-medium">
                      Total: ৳{calculateTotal().toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-2">
              <h3 className="font-medium text-gray-900 mb-4">Select Menu Items</h3>
              
              {menuItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No menu items available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-brand-dark transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={item.image?.startsWith('storage/') 
                            ? `http://127.0.0.1:8000/${item.image}` 
                            : item.image || '/api/placeholder/100/100'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/100/100';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-brand-dark">৳{parseFloat(item.price).toFixed(2)}</span>
                            <button
                              onClick={() => addItemToOrder(item)}
                              className="bg-brand-dark text-white px-3 py-1 rounded-lg hover:bg-brand-light transition-colors text-sm"
                              disabled={!item.available}
                            >
                              {item.available ? 'Add' : 'N/A'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-light transition-colors"
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
}