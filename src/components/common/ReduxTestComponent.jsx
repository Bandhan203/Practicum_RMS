import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addToCart, 
  removeFromCart, 
  clearCart,
  selectCart,
  selectCartTotal 
} from '../../store/features/orderSlice';
import { 
  selectMenuItems,
  fetchMenuItems 
} from '../../store/features/menuSlice';
import { Plus, Minus, ShoppingCart, Trash2 } from '../common/Icons';

export function ReduxTestComponent() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const cartTotal = useSelector(selectCartTotal);
  const menuItems = useSelector(selectMenuItems);

  React.useEffect(() => {
    // Fetch menu items when component mounts
    dispatch(fetchMenuItems());
  }, [dispatch]);

  const handleAddToCart = (menuItemId) => {
    dispatch(addToCart({ menuItemId, quantity: 1 }));
  };

  const handleRemoveFromCart = (menuItemId) => {
    dispatch(removeFromCart(menuItemId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <ShoppingCart className="w-5 h-5 mr-2" />
        Redux Cart Test
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu Items */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Menu Items</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {menuItems.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500 ml-2">৳{item.price}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(item.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Cart ({cart.length})</h3>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Cart is empty</p>
            ) : (
              cart.map(cartItem => {
                const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
                return (
                  <div key={cartItem.menuItemId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{menuItem?.name || 'Unknown Item'}</span>
                      <span className="text-sm text-gray-500 ml-2">x{cartItem.quantity}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(cartItem.menuItemId)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">৳{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <div className="text-sm space-y-1">
          <div>Menu Items: {menuItems.length}</div>
          <div>Cart Items: {cart.length}</div>
          <div>Cart Total: ৳{cartTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
