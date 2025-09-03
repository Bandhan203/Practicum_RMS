import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import apiSlice from '../../services/apiSlice';

// Mock menu data
const mockMenuItems = [
  {
    id: 1,
    name: 'Butter Chicken',
    description: 'Tender chicken pieces in a rich, creamy tomato-based sauce with aromatic spices',
    price: 320,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    preparationTime: 25,
    available: true,
    featured: true,
    ingredients: ['Chicken', 'Tomato', 'Cream', 'Spices'],
    allergens: ['Dairy'],
    calories: 450,
    spiceLevel: 'Medium'
  },
  {
    id: 2,
    name: 'Garlic Naan',
    description: 'Soft and fluffy Indian bread topped with fresh garlic and herbs',
    price: 80,
    category: 'Bread',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
    preparationTime: 10,
    available: true,
    featured: false,
    ingredients: ['Flour', 'Garlic', 'Herbs', 'Butter'],
    allergens: ['Gluten', 'Dairy'],
    calories: 280,
    spiceLevel: 'Mild'
  },
  {
    id: 3,
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with tender chicken pieces and aromatic spices',
    price: 450,
    category: 'Rice',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=400',
    preparationTime: 35,
    available: true,
    featured: true,
    ingredients: ['Basmati Rice', 'Chicken', 'Saffron', 'Spices'],
    allergens: [],
    calories: 520,
    spiceLevel: 'Medium'
  },
  {
    id: 4,
    name: 'Raita',
    description: 'Cool and refreshing yogurt-based side dish with cucumber and mint',
    price: 60,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
    preparationTime: 5,
    available: true,
    featured: false,
    ingredients: ['Yogurt', 'Cucumber', 'Mint', 'Spices'],
    allergens: ['Dairy'],
    calories: 80,
    spiceLevel: 'Mild'
  },
  {
    id: 5,
    name: 'Fish Curry',
    description: 'Fresh fish cooked in a spicy coconut-based curry sauce',
    price: 380,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
    preparationTime: 30,
    available: true,
    featured: false,
    ingredients: ['Fish', 'Coconut Milk', 'Curry Leaves', 'Spices'],
    allergens: ['Fish'],
    calories: 420,
    spiceLevel: 'Hot'
  },
  {
    id: 6,
    name: 'Basmati Rice',
    description: 'Fragrant long-grain basmati rice, perfectly steamed',
    price: 120,
    category: 'Rice',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    preparationTime: 15,
    available: true,
    featured: false,
    ingredients: ['Basmati Rice', 'Salt'],
    allergens: [],
    calories: 200,
    spiceLevel: 'None'
  },
  {
    id: 7,
    name: 'Dal Makhani',
    description: 'Rich and creamy black lentils slow-cooked with tomatoes and cream',
    price: 280,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    preparationTime: 20,
    available: true,
    featured: true,
    ingredients: ['Black Lentils', 'Tomato', 'Cream', 'Spices'],
    allergens: ['Dairy'],
    calories: 350,
    spiceLevel: 'Medium'
  },
  {
    id: 8,
    name: 'Roti',
    description: 'Traditional Indian flatbread made with whole wheat flour',
    price: 40,
    category: 'Bread',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
    preparationTime: 8,
    available: true,
    featured: false,
    ingredients: ['Wheat Flour', 'Water', 'Salt'],
    allergens: ['Gluten'],
    calories: 150,
    spiceLevel: 'None'
  }
];

// Simulate API delay
const simulateApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Async thunks for API calls with mock data
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (filters = {}, { rejectWithValue }) => {
    try {
      await simulateApiDelay();
      
      // Apply filters if any
      let filteredItems = [...mockMenuItems];
      
      if (filters.category && filters.category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === filters.category);
      }
      
      if (filters.available !== undefined) {
        filteredItems = filteredItems.filter(item => item.available === filters.available);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm)
        );
      }
      
      return filteredItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMenuItem = createAsyncThunk(
  'menu/createMenuItem',
  async (itemData, { rejectWithValue }) => {
    try {
      await simulateApiDelay();
      
      const newItem = {
        id: Math.max(...mockMenuItems.map(item => item.id)) + 1,
        ...itemData,
        available: true
      };
      
      // Add to mock data
      mockMenuItems.push(newItem);
      
      return newItem;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateMenuItem',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      await simulateApiDelay();
      
      // Find and update the item in mock data
      const itemIndex = mockMenuItems.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        throw new Error('Menu item not found');
      }
      
      mockMenuItems[itemIndex] = {
        ...mockMenuItems[itemIndex],
        ...updates
      };
      
      return { id, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      await simulateApiDelay();
      
      // Find and remove the item from mock data
      const itemIndex = mockMenuItems.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        throw new Error('Menu item not found');
      }
      
      mockMenuItems.splice(itemIndex, 1);
      
      return id;
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
