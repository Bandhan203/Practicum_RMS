import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Package, 
  Clock, 
  User, 
  Phone, 
  Mail,
  Calendar
} from '../common/Icons';
import { format, addMinutes } from 'date-fns';

export function OrderTypeModal({ isOpen, onClose, onSubmit, cartItems, totalAmount }) {
  const [orderType, setOrderType] = useState('dine-in');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [tableNumber, setTableNumber] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Generate available pickup times (30 minutes from now, every 15 minutes)
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    for (let i = 2; i <= 12; i++) { // 30 minutes to 3 hours from now
      const time = addMinutes(now, i * 15);
      times.push({
        value: time.toISOString(),
        label: format(time, 'HH:mm')
      });
    }
    return times;
  };

  const pickupTimes = generatePickupTimes();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!customerInfo.name.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (orderType === 'pickup') {
      if (!customerInfo.phone.trim()) {
        alert('Phone number is required for pickup orders');
        return;
      }
      if (!pickupTime) {
        alert('Please select a pickup time');
        return;
      }
    }

    if (orderType === 'dine-in' && !tableNumber) {
      alert('Please select a table number');
      return;
    }

    const orderData = {
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      orderType,
      items: cartItems,
      totalAmount,
      status: 'pending',
      tableNumber: orderType === 'dine-in' ? parseInt(tableNumber) : null,
      pickupTime: orderType === 'pickup' ? new Date(pickupTime) : null,
      specialInstructions,
      estimatedTime: 20 // Default estimation
    };

    onSubmit(orderData);
    onClose();
    
    // Reset form
    setCustomerInfo({ name: '', phone: '', email: '' });
    setTableNumber('');
    setPickupTime('');
    setSpecialInstructions('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Place Order</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOrderType('dine-in')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-3 transition-colors ${
                  orderType === 'dine-in'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MapPin size={20} />
                <span className="font-medium">Dine In</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-3 transition-colors ${
                  orderType === 'pickup'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package size={20} />
                <span className="font-medium">Pickup</span>
              </button>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline w-4 h-4 mr-1" />
                Customer Name *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter customer name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number {orderType === 'pickup' && '*'}
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="+880-1234567890"
                required={orderType === 'pickup'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline w-4 h-4 mr-1" />
              Email (Optional)
            </label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="customer@email.com"
            />
          </div>

          {/* Conditional Fields Based on Order Type */}
          {orderType === 'dine-in' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline w-4 h-4 mr-1" />
                Table Number *
              </label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Select a table</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Table {num}</option>
                ))}
              </select>
            </div>
          )}

          {orderType === 'pickup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline w-4 h-4 mr-1" />
                Pickup Time *
              </label>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Select pickup time</option>
                {pickupTimes.map(time => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Orders are typically ready in 20-30 minutes
              </p>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Any special requests or dietary requirements..."
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
                <span>Total:</span>
                <span>৳{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Place Order
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
