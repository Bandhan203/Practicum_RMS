# API Slice Integration Guide

This guide explains how to integrate the API slice into your existing React components and gradually migrate from mock data to real API calls.

## 🚀 Quick Start

### Step 1: Install Required Dependencies

```bash
npm install axios js-cookie
```

### Step 2: Environment Setup

Create a `.env` file in your project root:

```env
VITE_API_URL=http://localhost:3001/api
# or your actual API URL
VITE_API_URL=https://your-api-domain.com/api
```

### Step 3: Update Your App.jsx

Replace your current App component with the API-enabled version:

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiAppProvider } from './contexts/ApiAppContext';
import { AppProvider } from './contexts/AppContext'; // Keep as fallback
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';

// Import both versions of components
import { MenuManagement } from './components/Menu/MenuManagement';
import { ApiMenuManagement } from './components/Menu/ApiMenuManagement';
import { OrderManagement } from './components/Orders/OrderManagement';
import { ApiOrderManagement } from './components/Orders/ApiOrderManagement';

function App() {
  const [useApiMode, setUseApiMode] = useState(false);

  return (
    <div className="App">
      {/* Provide both contexts for smooth transition */}
      <AppProvider>
        <ApiAppProvider>
          <Router>
            <div className="flex h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                  
                  {/* API Mode Toggle */}
                  <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Data Source</h3>
                        <p className="text-sm text-gray-600">
                          Toggle between API and local mock data
                        </p>
                      </div>
                      <button
                        onClick={() => setUseApiMode(!useApiMode)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          useApiMode 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {useApiMode ? 'API Mode' : 'Local Mode'}
                      </button>
                    </div>
                  </div>

                  <Routes>
                    <Route 
                      path="/menu" 
                      element={useApiMode ? <ApiMenuManagement /> : <MenuManagement />} 
                    />
                    <Route 
                      path="/orders" 
                      element={useApiMode ? <ApiOrderManagement /> : <OrderManagement />} 
                    />
                    {/* Add other routes... */}
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </ApiAppProvider>
      </AppProvider>
    </div>
  );
}

export default App;
```

## 🔄 Migration Strategy

### Phase 1: Parallel Implementation (Current)
- Keep existing components working with mock data
- Introduce API-enabled versions alongside
- Allow switching between modes

### Phase 2: Gradual Migration
- Test API components thoroughly
- Migrate one component at a time
- Monitor for issues

### Phase 3: Full API Integration
- Replace all mock data components
- Remove fallback systems
- Optimize for production

## 📝 Component Integration Examples

### Example 1: Simple API Hook Usage

```jsx
import { useApiApp } from '../contexts/ApiAppContext';

function MyComponent() {
  const { 
    menuItems, 
    addMenuItem, 
    getLoadingState, 
    getError,
    apiConnected 
  } = useApiApp();

  const isLoading = getLoadingState('menuItems');
  const error = getError('menuItems');

  const handleAddItem = async (itemData) => {
    const result = await addMenuItem(itemData);
    if (result.success) {
      console.log('Item added successfully!');
    } else {
      console.error('Failed to add item:', result.error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${
          apiConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-gray-600">
          {apiConnected ? 'API Connected' : 'Using Local Data'}
        </span>
      </div>
      
      {/* Your component content */}
      {menuItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Example 2: Error Handling with Retry

```jsx
import { useApiApp } from '../contexts/ApiAppContext';

function ResilientComponent() {
  const { 
    orders, 
    updateOrderStatus, 
    retryOperation,
    getError,
    clearError 
  } = useApiApp();

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const result = await retryOperation(() => 
        updateOrderStatus(orderId, status)
      );
      
      if (result.success) {
        console.log('Status updated successfully!');
      }
    } catch (error) {
      console.error('Failed after retry:', error);
      // Handle persistent failure
    }
  };

  const error = getError('orders');

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => clearError('orders')}
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {/* Component content */}
    </div>
  );
}
```

### Example 3: Real-time Status Updates

```jsx
import { useApiApp } from '../contexts/ApiAppContext';
import { useEffect } from 'react';

function RealtimeOrderStatus() {
  const { 
    orders, 
    getDashboardStats,
    apiConnected 
  } = useApiApp();

  // Refresh data periodically when API is connected
  useEffect(() => {
    if (!apiConnected) return;

    const interval = setInterval(async () => {
      await getDashboardStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [apiConnected, getDashboardStats]);

  return (
    <div>
      <div className="text-sm text-gray-500 mb-4">
        {apiConnected && 'Real-time updates enabled'}
      </div>
      
      {orders.map(order => (
        <div key={order.id} className="border rounded p-4 mb-2">
          <span className="font-medium">Order #{order.id}</span>
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
            order.status === 'ready' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## 🛠 Advanced Integration Patterns

### Custom Hooks for Specific Operations

```jsx
// hooks/useMenuOperations.js
import { useApiApp } from '../contexts/ApiAppContext';
import { useState } from 'react';

export function useMenuOperations() {
  const { 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem,
    getLoadingState,
    getError 
  } = useApiApp();

  const [operationLoading, setOperationLoading] = useState(false);

  const createItem = async (itemData) => {
    setOperationLoading(true);
    try {
      const result = await addMenuItem(itemData);
      return result;
    } finally {
      setOperationLoading(false);
    }
  };

  const editItem = async (itemId, updates) => {
    setOperationLoading(true);
    try {
      const result = await updateMenuItem(itemId, updates);
      return result;
    } finally {
      setOperationLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    setOperationLoading(true);
    try {
      const result = await deleteMenuItem(itemId);
      return result;
    } finally {
      setOperationLoading(false);
    }
  };

  return {
    menuItems,
    createItem,
    editItem,
    removeItem,
    isLoading: getLoadingState('menuItems') || operationLoading,
    error: getError('menuItems')
  };
}

// Usage in component:
function MenuComponent() {
  const { 
    menuItems, 
    createItem, 
    editItem, 
    removeItem, 
    isLoading, 
    error 
  } = useMenuOperations();

  // Use the operations...
}
```

### Batch Operations Example

```jsx
import { useApiApp } from '../contexts/ApiAppContext';

function BatchOperationsExample() {
  const { apiSlice } = useApiApp();
  const [selectedItems, setSelectedItems] = useState([]);

  const handleBatchDelete = async () => {
    try {
      const results = await apiSlice.batchDelete('menu', selectedItems);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`Deleted ${successful} items, ${failed} failed`);
      
      // Refresh the menu items
      setSelectedItems([]);
    } catch (error) {
      console.error('Batch delete failed:', error);
    }
  };

  return (
    <div>
      {selectedItems.length > 0 && (
        <button 
          onClick={handleBatchDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete {selectedItems.length} items
        </button>
      )}
    </div>
  );
}
```

## 🔧 Backend Requirements

Your backend API should support these endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/verify` - Token verification

### Menu Management
- `GET /menu` - Get all menu items
- `GET /menu/:id` - Get specific menu item
- `POST /menu` - Create menu item
- `PUT /menu/:id` - Update menu item
- `DELETE /menu/:id` - Delete menu item

### Order Management
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get specific order
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Cancel order

### Reservations
- `GET /reservations` - Get reservations
- `POST /reservations` - Create reservation
- `PUT /reservations/:id` - Update reservation
- `DELETE /reservations/:id` - Cancel reservation

## 📊 Monitoring and Debugging

### API Health Monitoring

```jsx
import { useApiApp } from '../contexts/ApiAppContext';
import { useEffect, useState } from 'react';

function ApiHealthMonitor() {
  const { checkApiHealth, apiConnected } = useApiApp();
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      const status = await checkApiHealth();
      setHealthStatus(status);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkApiHealth]);

  return (
    <div className={`p-2 rounded ${
      apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      API Status: {apiConnected ? 'Connected' : 'Disconnected'}
      {healthStatus && (
        <div className="text-xs mt-1">
          Last check: {new Date(healthStatus.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
```

## 🚀 Production Considerations

1. **Error Boundaries**: Wrap API components in error boundaries
2. **Loading States**: Always handle loading states gracefully
3. **Offline Support**: Implement proper offline/online detection
4. **Caching Strategy**: Configure appropriate cache timeouts
5. **Rate Limiting**: Handle API rate limits properly
6. **Security**: Ensure proper token management and HTTPS

## 🔄 Migration Checklist

- [ ] Install dependencies (axios, js-cookie)
- [ ] Set up environment variables
- [ ] Create API slice configuration
- [ ] Implement ApiAppContext
- [ ] Create API-enabled components
- [ ] Test with real backend
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Configure caching
- [ ] Test offline scenarios
- [ ] Monitor API health
- [ ] Optimize for production

This integration provides a robust foundation for migrating from mock data to real API calls while maintaining functionality and user experience.
