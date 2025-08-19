import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiSlice from '../../services/apiSlice';

// Async thunks for API calls
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getMenuItems(filters);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMenuItem = createAsyncThunk(
  'menu/createMenuItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const result = await apiSlice.createMenuItem(itemData);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateMenuItem',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.updateMenuItem(id, updates);
      if (result.success) {
        return { id, updates };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      const result = await apiSlice.deleteMenuItem(id);
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
  categories: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  filters: {
    available: null,
    featured: null,
    priceRange: { min: 0, max: 1000 }
  }
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.searchTerm = '';
      state.selectedCategory = 'all';
      state.filters = {
        available: null,
        featured: null,
        priceRange: { min: 0, max: 1000 }
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch menu items
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        // Extract unique categories
        state.categories = [...new Set(action.payload.map(item => item.category))];
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create menu item
      .addCase(createMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        // Update categories if new category added
        if (!state.categories.includes(action.payload.category)) {
          state.categories.push(action.payload.category);
        }
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update menu item
      .addCase(updateMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updates } = action.payload;
        const index = state.items.findIndex(item => item.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete menu item
      .addCase(deleteMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectMenuItems = (state) => state.menu.items;
export const selectMenuCategories = (state) => state.menu.categories;
export const selectMenuLoading = (state) => state.menu.loading;
export const selectMenuError = (state) => state.menu.error;
export const selectMenuSearchTerm = (state) => state.menu.searchTerm;
export const selectMenuSelectedCategory = (state) => state.menu.selectedCategory;
export const selectMenuFilters = (state) => state.menu.filters;

// Filtered menu items selector
export const selectFilteredMenuItems = (state) => {
  const { items, searchTerm, selectedCategory, filters, sortBy, sortOrder } = state.menu;
  
  let filtered = items.filter(item => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    // Available filter
    const matchesAvailable = filters.available === null || item.available === filters.available;
    
    // Featured filter
    const matchesFeatured = filters.featured === null || item.featured === filters.featured;
    
    // Price range filter
    const matchesPrice = item.price >= filters.priceRange.min && item.price <= filters.priceRange.max;
    
    return matchesSearch && matchesCategory && matchesAvailable && matchesFeatured && matchesPrice;
  });
  
  // Sort filtered items
  filtered.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  
  return filtered;
};

export const { 
  setSearchTerm, 
  setSelectedCategory, 
  setSortBy, 
  setSortOrder, 
  setFilters, 
  clearFilters, 
  clearError 
} = menuSlice.actions;

export default menuSlice.reducer;
