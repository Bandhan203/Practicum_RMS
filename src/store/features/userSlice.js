import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiSlice from '../../services/apiSlice';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getUsers(filters);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await apiSlice.createUser(userData);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.updateUser(id, userData);
      if (result.success) {
        return { id, ...result.data };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const result = await apiSlice.deleteUser(id);
      if (result.success) {
        return id;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.updateUserStatus(id, status);
      if (result.success) {
        return { id, status };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  searchTerm: '',
  filterRole: 'all',
  filterStatus: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  userStats: {
    total: 0,
    admin: 0,
    chef: 0,
    staff: 0,
    customer: 0,
    active: 0,
    inactive: 0
  }
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilterRole: (state, action) => {
      state.filterRole = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateUserProfile: (state, action) => {
      const { id, profileData } = action.payload;
      const user = state.users.find(u => u.id === id);
      if (user) {
        Object.assign(user, profileData);
      }
      if (state.currentUser && state.currentUser.id === id) {
        Object.assign(state.currentUser, profileData);
      }
    },
    updateUserStats: (state) => {
      const stats = {
        total: state.users.length,
        admin: 0,
        chef: 0,
        staff: 0,
        customer: 0,
        active: 0,
        inactive: 0
      };
      const allowedRoles = ['admin', 'chef', 'staff', 'customer'];
      state.users.forEach(user => {
        if (allowedRoles.includes(user.role)) {
          stats[user.role]++;
        }
        if (user.status === 'active') {
          stats.active++;
        } else {
          stats.inactive++;
        }
      });
      state.userStats = stats;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.searchTerm = '';
      state.filterRole = 'all';
      state.filterStatus = 'all';
      state.sortBy = 'name';
      state.sortOrder = 'asc';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        userSlice.caseReducers.updateUserStats(state);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        userSlice.caseReducers.updateUserStats(state);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        userSlice.caseReducers.updateUserStats(state);
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
        if (state.currentUser && state.currentUser.id === action.payload) {
          state.currentUser = null;
        }
        userSlice.caseReducers.updateUserStats(state);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, status } = action.payload;
        const user = state.users.find(u => u.id === id);
        if (user) {
          user.status = status;
          user.updatedAt = new Date().toISOString();
        }
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser.status = status;
        }
        userSlice.caseReducers.updateUserStats(state);
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectUsers = (state) => state.users.users;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectCurrentUser = (state) => state.users.currentUser;
export const selectSearchTerm = (state) => state.users.searchTerm;
export const selectFilterRole = (state) => state.users.filterRole;
export const selectFilterStatus = (state) => state.users.filterStatus;
export const selectSortBy = (state) => state.users.sortBy;
export const selectSortOrder = (state) => state.users.sortOrder;
export const selectUserStats = (state) => state.users.userStats;

// Filtered and sorted users selector
export const selectFilteredUsers = (state) => {
  const { users, searchTerm, filterRole, filterStatus, sortBy, sortOrder } = state.users;
  
  let filteredUsers = users;
  
  // Search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredUsers = filteredUsers.filter(user =>
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower)
    );
  }
  
  // Role filter
  if (filterRole !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.role === filterRole);
  }
  
  // Status filter
  if (filterStatus !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.status === filterStatus);
  }
  
  // Sort
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue?.toLowerCase() || '';
    }
    
    // Handle date comparison
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  return sortedUsers;
};

// Users by role selector
export const selectUsersByRole = (state) => {
  const users = state.users.users;
  return users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {});
};

// Active users selector
export const selectActiveUsers = (state) => {
  return state.users.users.filter(user => user.status === 'active');
};

export const {
  setSearchTerm,
  setFilterRole,
  setFilterStatus,
  setSortBy,
  setSortOrder,
  setCurrentUser,
  updateUserProfile,
  updateUserStats,
  clearError,
  resetFilters
} = userSlice.actions;

export default userSlice.reducer;
