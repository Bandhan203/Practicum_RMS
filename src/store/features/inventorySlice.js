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

const initialState = {
  items: [],
  loading: false,
  error: null,
  searchTerm: '',
  filterCategory: 'all'
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
      });
  }
});

// Selectors
export const selectInventoryItems = (state) => state.inventory.items;
export const selectInventoryLoading = (state) => state.inventory.loading;
export const selectInventoryError = (state) => state.inventory.error;

export const { setSearchTerm, setFilterCategory, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
