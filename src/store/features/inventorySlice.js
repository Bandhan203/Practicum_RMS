import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiSlice from '../../services/apiSlice';

// Async thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getInventoryItems(filters);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/createInventoryItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const result = await apiSlice.createInventoryItem(itemData);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.updateInventoryItem(id, itemData);
      if (result.success) {
        return { id, ...result.data };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (id, { rejectWithValue }) => {
    try {
      const result = await apiSlice.deleteInventoryItem(id);
      if (result.success) {
        return id;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLowStockItems = createAsyncThunk(
  'inventory/fetchLowStockItems',
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getLowStockItems();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateStockLevel = createAsyncThunk(
  'inventory/updateStockLevel',
  async ({ itemId, quantity, reason = 'manual_adjustment' }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.updateInventoryStock(itemId, { quantity, reason });
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInventoryReports = createAsyncThunk(
  'inventory/fetchReports',
  async ({ startDate, endDate, type = 'consumption' }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getInventoryReports({ startDate, endDate, type });
      if (result.success) {
        return { type, data: result.data };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  lowStockItems: [],
  stockHistory: [],
  reports: {
    consumption: [],
    wastage: [],
    stockMovement: []
  },
  statistics: {
    totalItems: 0,
    lowStockCount: 0,
    criticalStockCount: 0,
    totalValue: 0
  },
  loading: false,
  error: null,
  searchTerm: '',
  filterCategory: 'all',
  filterStatus: 'all',
  alerts: {
    lowStock: [],
    expiring: [],
    overstock: []
  }
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    updateItemStock: (state, action) => {
      const { itemId, newQuantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        item.quantity = newQuantity;
        item.lastUpdated = new Date().toISOString();
      }
    },
    addStockAlert: (state, action) => {
      const { type, alert } = action.payload;
      if (state.alerts[type]) {
        state.alerts[type].push(alert);
      }
    },
    removeStockAlert: (state, action) => {
      const { type, alertId } = action.payload;
      if (state.alerts[type]) {
        state.alerts[type] = state.alerts[type].filter(alert => alert.id !== alertId);
      }
    },
    clearAllAlerts: (state, action) => {
      const alertType = action.payload;
      if (alertType && state.alerts[alertType]) {
        state.alerts[alertType] = [];
      } else if (!alertType) {
        state.alerts = { lowStock: [], expiring: [], overstock: [] };
      }
    },
    updateStatistics: (state) => {
      state.statistics.totalItems = state.items.length;
      state.statistics.lowStockCount = state.items.filter(item => 
        item.quantity <= item.threshold && item.quantity > item.criticalLevel
      ).length;
      state.statistics.criticalStockCount = state.items.filter(item => 
        item.quantity <= item.criticalLevel
      ).length;
      state.statistics.totalValue = state.items.reduce((total, item) => 
        total + (item.quantity * item.cost), 0
      );
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(fetchLowStockItems.fulfilled, (state, action) => {
        state.lowStockItems = action.payload;
      })
      .addCase(updateStockLevel.fulfilled, (state, action) => {
        const item = state.items.find(item => item.id === action.payload.id);
        if (item) {
          item.quantity = action.payload.quantity;
          item.lastUpdated = action.payload.lastUpdated;
        }
      })
      .addCase(fetchInventoryReports.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        state.reports[type] = data;
      });
  }
});

// Selectors
export const selectInventoryItems = (state) => state.inventory.items || [];
export const selectLowStockItems = (state) => state.inventory.lowStockItems || [];
export const selectInventoryReports = (state) => state.inventory.reports || {};
export const selectInventoryStatistics = (state) => state.inventory.statistics || {};
export const selectInventoryAlerts = (state) => state.inventory.alerts || { lowStock: [], expiring: [], overstock: [] };
export const selectInventoryLoading = (state) => state.inventory.loading;
export const selectInventoryError = (state) => state.inventory.error;
export const selectInventorySearchTerm = (state) => state.inventory.searchTerm;
export const selectInventoryFilterCategory = (state) => state.inventory.filterCategory;
export const selectInventoryFilterStatus = (state) => state.inventory.filterStatus;

// Complex selectors
export const selectFilteredInventoryItems = (state) => {
  const items = state.inventory.items || [];
  const searchTerm = state.inventory.searchTerm.toLowerCase();
  const categoryFilter = state.inventory.filterCategory;
  const statusFilter = state.inventory.filterStatus;

  return items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'critical') {
      matchesStatus = item.quantity <= item.criticalLevel;
    } else if (statusFilter === 'low') {
      matchesStatus = item.quantity <= item.threshold && item.quantity > item.criticalLevel;
    } else if (statusFilter === 'adequate') {
      matchesStatus = item.quantity > item.threshold;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
};

export const selectCriticalStockItems = (state) => {
  return (state.inventory.items || []).filter(item => item.quantity <= item.criticalLevel);
};

export const selectInventoryCategories = (state) => {
  const items = state.inventory.items || [];
  const categories = new Set(items.map(item => item.category));
  return ['all', ...Array.from(categories)];
};

export const selectInventoryValue = (state) => {
  return (state.inventory.items || []).reduce((total, item) => total + (item.quantity * item.cost), 0);
};

export const selectTopValueItems = (limit = 5) => (state) => {
  return (state.inventory.items || [])
    .map(item => ({ ...item, totalValue: item.quantity * item.cost }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit);
};

export const {
  setSearchTerm, 
  setFilterCategory, 
  setFilterStatus,
  updateItemStock,
  addStockAlert,
  removeStockAlert,
  clearAllAlerts,
  updateStatistics,
  clearError
} = inventorySlice.actions;

export default inventorySlice.reducer;
