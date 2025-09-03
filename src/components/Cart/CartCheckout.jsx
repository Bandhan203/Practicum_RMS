import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Trash2, Plus, Minus, X } from '../common/Icons';
import { OrderTypeModal } from '../Orders/OrderTypeModal';
import { 
  selectCart, 
  selectCartTotal, 
  removeFromCart, 
  updateCartItemQuantity, 
  createOrder 
} from '../../store/features/orderSlice';
import { selectMenuItems } from '../../store/features/menuSlice';

export function CartCheckout({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const menuItems = useSelector(selectMenuItems);
  const cartTotal = useSelector(selectCartTotal);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);

  const cartWithDetails = cart.map(cartItem => {
    const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
    return {
      ...cartItem,
      menuItem,
      subtotal: menuItem ? menuItem.price * cartItem.quantity : 0
    };
  }).filter(item => item.menuItem); // Only include items where menu item was found

  // Use Redux selector for total, but fallback to calculated total if needed
  const totalAmount = cartTotal || cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);

  const handleQuantityChange = (menuItemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(menuItemId));
    } else {
      dispatch(updateCartItemQuantity({ menuItemId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      setShowOrderTypeModal(true);
    }
  };

  const handleOrderPlaced = (orderData) => {
    dispatch(createOrder(orderData));
    setShowOrderTypeModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Cart Sidebar */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Your Cart ({cart.length})
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartWithDetails.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500">Add some delicious items to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartWithDetails.map((item) => (
                    <div key={item.menuItemId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={item.menuItem.image} 
                          alt={item.menuItem.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.menuItem.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            ৳{item.menuItem.price.toFixed(2)} each
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.menuItemId, item.quantity - 1)}
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-1 bg-white rounded text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.menuItemId, item.quantity + 1)}
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => dispatch(removeFromCart(item.menuItemId))}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right mt-2">
                            <span className="text-sm font-semibold text-gray-900">
                              ৳{item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartWithDetails.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">৳{totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Type Modal */}
      {showOrderTypeModal && (
        <OrderTypeModal
          isOpen={showOrderTypeModal}
          onClose={() => setShowOrderTypeModal(false)}
          cartItems={cartWithDetails}
          totalAmount={totalAmount}
          onSubmit={handleOrderPlaced}
        />
      )}
    </>
  );
}
