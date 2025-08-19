# Redux Usage Guide

## Overview
Your RMS project now has a complete Redux setup with Redux Toolkit, providing centralized state management for all major features.

## Store Structure
```
store/
├── store.js              # Main store configuration
├── hooks.js              # Typed hooks for Redux
└── features/
    ├── authSlice.js       # Authentication & user session
    ├── menuSlice.js       # Menu items & categories
    ├── orderSlice.js      # Orders & cart management
    ├── userSlice.js       # User management
    ├── reservationSlice.js # Table reservations
    ├── inventorySlice.js  # Inventory tracking
    ├── analyticsSlice.js  # Analytics & reporting
    └── notificationSlice.js # Notifications
```

## Using Redux in Components

### 1. Import Hooks
```jsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
```

### 2. Access State
```jsx
// Get state data
const menuItems = useAppSelector(selectMenuItems);
const loading = useAppSelector(selectMenuLoading);
const user = useAppSelector(selectCurrentUser);
```

### 3. Dispatch Actions
```jsx
const dispatch = useAppDispatch();

// Async actions
dispatch(fetchMenuItems());
dispatch(login({ username, password }));

// Synchronous actions
dispatch(setSearchTerm('pizza'));
dispatch(addToCart({ menuItemId: 1, quantity: 2 }));
```

## Example Component Implementation

### Menu Management with Redux
```jsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMenuItems,
  selectFilteredMenuItems,
  selectMenuLoading,
  setSearchTerm,
  setFilterCategory
} from '../store/features/menuSlice';

const MenuComponent = () => {
  const dispatch = useAppDispatch();
  const menuItems = useAppSelector(selectFilteredMenuItems);
  const loading = useAppSelector(selectMenuLoading);

  useEffect(() => {
    dispatch(fetchMenuItems());
  }, [dispatch]);

  const handleSearch = (searchTerm) => {
    dispatch(setSearchTerm(searchTerm));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <input 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search menu items..."
      />
      {menuItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### Order Management with Cart
```jsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectCartWithDetails,
  selectCartTotal,
  addToCart,
  removeFromCart,
  createOrder
} from '../store/features/orderSlice';

const CartComponent = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartWithDetails);
  const total = useAppSelector(selectCartTotal);

  const handleCheckout = () => {
    const orderData = {
      items: cartItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
      })),
      totalAmount: total
    };
    dispatch(createOrder(orderData));
  };

  return (
    <div>
      {cartItems.map(item => (
        <div key={item.menuItemId}>
          {item.menuItem?.name} - ${item.subtotal}
          <button onClick={() => dispatch(removeFromCart(item.menuItemId))}>
            Remove
          </button>
        </div>
      ))}
      <div>Total: ${total}</div>
      <button onClick={handleCheckout}>Place Order</button>
    </div>
  );
};
```

## Key Features

### 1. Authentication (authSlice)
```jsx
// Login
dispatch(login({ username, password }));

// Check auth status
const isAuthenticated = useAppSelector(selectIsAuthenticated);
const user = useAppSelector(selectCurrentUser);

// Logout
dispatch(logout());
```

### 2. Real-time State Updates
```jsx
// Update order status
dispatch(updateOrderStatus({ id: orderId, status: 'preparing' }));

// Update inventory
dispatch(updateStock({ id: itemId, quantity: 50, type: 'restock' }));
```

### 3. Advanced Filtering & Sorting
```jsx
// Menu filtering
dispatch(setFilterCategory('appetizers'));
dispatch(setSortBy('price'));

// Get filtered results
const filteredItems = useAppSelector(selectFilteredMenuItems);
```

### 4. Analytics Integration
```jsx
// Fetch analytics
dispatch(fetchSalesAnalytics({ 
  startDate: '2024-01-01', 
  endDate: '2024-01-31',
  period: 'daily' 
}));

// Get KPIs
const kpis = useAppSelector(selectDashboardKPIs);
```

## Migration from Context

### Before (Context)
```jsx
const { menuItems, loading, fetchMenuItems } = useContext(AppContext);
```

### After (Redux)
```jsx
const menuItems = useAppSelector(selectMenuItems);
const loading = useAppSelector(selectMenuLoading);
const dispatch = useAppDispatch();

// Use dispatch instead of context methods
dispatch(fetchMenuItems());
```

## API Integration

All slices are already integrated with your existing `apiSlice.js`:
- Automatic caching
- Error handling
- Loading states
- Optimistic updates

## Best Practices

1. **Use Selectors**: Always use selectors to access state
2. **Async Thunks**: Use for API calls with automatic loading/error states
3. **Immutable Updates**: Redux Toolkit handles immutability automatically
4. **Type Safety**: Use the provided hooks for better TypeScript support
5. **Performance**: Selectors are memoized for optimal performance

## Next Steps

1. **Update existing components** to use Redux instead of context
2. **Add error boundaries** for better error handling
3. **Implement real-time updates** using WebSocket integration
4. **Add data persistence** with Redux Persist if needed

Your Redux store is now fully configured and ready to replace the existing context-based state management!
