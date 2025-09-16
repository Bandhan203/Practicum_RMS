import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { menuAPI } from '../../services/api';

// Async thunks for API calls
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('Redux fetchMenuItems: Starting API call with filters:', filters);
      const response = await menuAPI.getMenuItems();
      console.log('Redux fetchMenuItems: Full response:', response);
      console.log('Redux fetchMenuItems: Response data structure:', response.data);
      
      // Check if response has the expected structure
      if (response.data && Array.isArray(response.data.data)) {
        console.log('Redux fetchMenuItems: Successfully extracted items:', response.data.data.length);
        return response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Redux fetchMenuItems: Direct array response:', response.data.length);
        return response.data;
      } else {
        console.error('Redux fetchMenuItems: Unexpected response structure:', response.data);
        return rejectWithValue('Unexpected response structure from API');
      }
    } catch (error) {
      console.error('Redux fetchMenuItems: Error occurred:', error);
      console.error('Redux fetchMenuItems: Error response:', error.response);
      console.error('Redux fetchMenuItems: Error status:', error.response?.status);
      console.error('Redux fetchMenuItems: Error data:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createMenuItem = createAsyncThunk(
  'menu/createMenuItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await menuAPI.createMenuItem(itemData);
      return response.data.data; // Extract data from the response wrapper
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateMenuItem',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await menuAPI.updateMenuItem(id, updates);
      return response.data.data; // Extract data from the response wrapper
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      await menuAPI.deleteMenuItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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
      state.filters = {
        available: null,
        featured: null,
        priceRange: { min: 0, max: 1000 }
      };
      state.searchTerm = '';
      state.selectedCategory = 'all';
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
        state.items.push(action.payload);
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
        const updatedItem = action.payload;
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
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
export const selectMenuItems = (state) => state.menu.items || [];
export const selectMenuCategories = (state) => state.menu.categories || [];
export const selectMenuLoading = (state) => state.menu.loading || false;
export const selectMenuError = (state) => state.menu.error || null;
export const selectMenuSearchTerm = (state) => state.menu.searchTerm;
export const selectMenuSelectedCategory = (state) => state.menu.selectedCategory;
export const selectMenuFilters = (state) => state.menu.filters;

// Filtered menu items selector
export const selectFilteredMenuItems = (state) => {
  const { items, searchTerm, selectedCategory, filters, sortBy, sortOrder } = state.menu;
  
  let filtered = items.filter(item => {
    // Search filter
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    // Available filter
    const matchesAvailable = filters.available === null || item.available === filters.available;
    
    // Featured filter
    const matchesFeatured = filters.featured === null || item.featured === filters.featured;
    
    // Price range filter
    const matchesPriceRange = item.price >= filters.priceRange.min && 
                              item.price <= filters.priceRange.max;
    
    return matchesSearch && matchesCategory && matchesAvailable && 
           matchesFeatured && matchesPriceRange;
  });
  
  // Sort items
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
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