import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import apiSlice from '../../services/apiSlice';

// Mock data for orders (since we don't have a backend)
const mockOrders = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+880123456789',
    orderType: 'dine-in',
    tableNumber: 5,
    status: 'pending',
    items: [
      { id: 1, name: 'Butter Chicken', price: 320, quantity: 2 },
      { id: 2, name: 'Garlic Naan', price: 80, quantity: 3 }
    ],
    totalAmount: 880,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+880987654321',
    orderType: 'pickup',
    pickupTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes from now
    status: 'preparing',
    items: [
      { id: 3, name: 'Biryani', price: 450, quantity: 1 },
      { id: 4, name: 'Raita', price: 60, quantity: 1 }
    ],
    totalAmount: 510,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD-003',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    customerPhone: '+880555666777',
    orderType: 'dine-in',
    tableNumber: 12,
    status: 'ready',
    items: [
      { id: 5, name: 'Fish Curry', price: 380, quantity: 1 },
      { id: 6, name: 'Rice', price: 120, quantity: 2 }
    ],
    totalAmount: 620,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD-004',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah@example.com',
    customerPhone: '+880111222333',
    orderType: 'pickup',
    pickupTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes from now
    status: 'served',
    items: [
      { id: 7, name: 'Dal Makhani', price: 280, quantity: 1 },
      { id: 8, name: 'Roti', price: 40, quantity: 4 }
    ],
    totalAmount: 440,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

// Simulate API delay
const simulateApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Async thunks with mock data
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (filters = {}, { rejectWithValue }) => {
    try {
      await simulateApiDelay();
      
      // Apply filters if any
      let filteredOrders = [...mockOrders];
      
      if (filters.status && filters.status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }
      
      if (filters.orderType && filters.orderType !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.orderType === filters.orderType);
      }
      
      return filteredOrders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      await simulateApiDelay();
      
      const newOrder = {
        id: `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to mock data
      mockOrders.unshift(newOrder);
      
      return newOrder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await simulateApiDelay();
      
      // Find and update the order in mock data
      const orderIndex = mockOrders.findIndex(order => order.id === id);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      mockOrders[orderIndex] = {
        ...mockOrders[orderIndex],
        status,
        updatedAt: new Date().toISOString()
      };
      
      return { id, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      await simulateApiDelay();
      
      // Find and update the order in mock data
      const orderIndex = mockOrders.findIndex(order => order.id === id);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      mockOrders[orderIndex] = {
        ...mockOrders[orderIndex],
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      };
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  filterStatus: 'all',
  cart: [],
  orderStats: {
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    served: 0,
    cancelled: 0
  }
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    addToCart: (state, action) => {
      const { menuItemId, quantity = 1 } = action.payload;
      const existingItem = state.cart.find(item => item.menuItemId === menuItemId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({ menuItemId, quantity });
      }
    },
    removeFromCart: (state, action) => {
      const menuItemId = action.payload;
      state.cart = state.cart.filter(item => item.menuItemId !== menuItemId);
    },
    updateCartItemQuantity: (state, action) => {
      const { menuItemId, quantity } = action.payload;
      const item = state.cart.find(item => item.menuItemId === menuItemId);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    removeItemFromOrder: (state, action) => {
      const { orderId, itemIndex } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order && order.items) {
        order.items.splice(itemIndex, 1);
        // Recalculate total
        order.totalAmount = order.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
      }
    },
    updateOrderStats: (state) => {
      const stats = {
        total: state.orders.length,
        pending: 0,
        preparing: 0,
        ready: 0,
        served: 0,
        cancelled: 0
      };
      const allowedStatuses = Object.keys(stats).filter(key => key !== 'total');
      state.orders.forEach(order => {
        if (allowedStatuses.includes(order.status)) {
          stats[order.status]++;
        }
      });
      state.orderStats = stats;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        // Update stats automatically
        orderSlice.caseReducers.updateOrderStats(state);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.cart = []; // Clear cart after successful order
        orderSlice.caseReducers.updateOrderStats(state);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, status } = action.payload;
        const order = state.orders.find(o => o.id === id);
        if (order) {
          order.status = status;
          order.updatedAt = new Date().toISOString();
        }
        orderSlice.caseReducers.updateOrderStats(state);
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const order = state.orders.find(o => o.id === action.payload);
        if (order) {
          order.status = 'cancelled';
          order.updatedAt = new Date().toISOString();
        }
        orderSlice.caseReducers.updateOrderStats(state);
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectFilterStatus = (state) => state.orders.filterStatus;
export const selectCart = (state) => state.orders.cart;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStats = (state) => state.orders.orderStats;

// Filtered orders selector
export const selectFilteredOrders = (state) => {
  const { orders, filterStatus } = state.orders;
  if (filterStatus === 'all') {
    return orders;
  }
  return orders.filter(order => order.status === filterStatus);
};

// Cart total selector
export const selectCartTotal = (state) => {
  const { cart } = state.orders;
  const { items: menuItems } = state.menu;
  
  return cart.reduce((total, cartItem) => {
    const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
    if (menuItem) {
      return total + (menuItem.price * cartItem.quantity);
    }
    return total;
  }, 0);
};

// Cart items with details selector
export const selectCartWithDetails = (state) => {
  const { cart } = state.orders;
  const { items: menuItems } = state.menu;
  
  return cart.map(cartItem => {
    const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
    return {
      ...cartItem,
      menuItem: menuItem || null,
      subtotal: menuItem ? menuItem.price * cartItem.quantity : 0
    };
  });
};

export const {
  setFilterStatus,
  setCurrentOrder,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  removeItemFromOrder,
  updateOrderStats,
  clearError
} = orderSlice.actions;

export default orderSlice.reducer;
