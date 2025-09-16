import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI } from '../../services/api';

// Async thunks for API calls
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrders(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateOrder(id, { status, notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      await orderAPI.deleteOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchOrderStatistics = createAsyncThunk(
  'orders/fetchOrderStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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
    total_orders: 0,
    pending_orders: 0,
    preparing_orders: 0,
    ready_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    todays_orders: 0,
    todays_revenue: 0
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
    updateLocalOrderStats: (state) => {
      const stats = {
        total_orders: state.orders.length,
        pending_orders: 0,
        preparing_orders: 0,
        ready_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        todays_orders: 0,
        todays_revenue: 0
      };
      
      const today = new Date().toDateString();
      
      state.orders.forEach(order => {
        // Count by status
        if (order.status === 'pending') stats.pending_orders++;
        else if (order.status === 'preparing') stats.preparing_orders++;
        else if (order.status === 'ready') stats.ready_orders++;
        else if (order.status === 'completed') stats.completed_orders++;
        else if (order.status === 'cancelled') stats.cancelled_orders++;
        
        // Today's stats
        const orderDate = new Date(order.created_at).toDateString();
        if (orderDate === today) {
          stats.todays_orders++;
          if (order.status === 'completed') {
            stats.todays_revenue += parseFloat(order.total_amount);
          }
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
        orderSlice.caseReducers.updateLocalOrderStats(state);
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
        orderSlice.caseReducers.updateLocalOrderStats(state);
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
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex(o => o.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        orderSlice.caseReducers.updateLocalOrderStats(state);
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(o => o.id !== action.payload);
        orderSlice.caseReducers.updateLocalOrderStats(state);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch order statistics
      .addCase(fetchOrderStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.orderStats = action.payload;
      })
      .addCase(fetchOrderStatistics.rejected, (state, action) => {
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
  updateLocalOrderStats,
  clearError
} = orderSlice.actions;

export default orderSlice.reducer;
