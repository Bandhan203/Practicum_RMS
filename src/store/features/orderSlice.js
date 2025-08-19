import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiSlice from '../../services/apiSlice';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getOrders(filters);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const result = await apiSlice.createOrder(orderData);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.updateOrderStatus(id, status);
      if (result.success) {
        return { id, status };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const result = await apiSlice.cancelOrder(id);
      if (result.success) {
        return id;
      }
      throw new Error(result.error);
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
      
      state.orders.forEach(order => {
        if (stats.hasOwnProperty(order.status)) {
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
