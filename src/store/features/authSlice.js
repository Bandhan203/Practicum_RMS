import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiSlice from '../../services/apiSlice';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.login({ username, password });
      if (result.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', result.data.token);
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiSlice.logout();
      // Clear token regardless of API response
      localStorage.removeItem('authToken');
      return result.success;
    } catch (error) {
      // Still clear token even if API call fails
      localStorage.removeItem('authToken');
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiSlice.refreshToken();
      if (result.success) {
        localStorage.setItem('authToken', result.data.token);
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const result = await apiSlice.updateProfile(profileData);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.changePassword({ currentPassword, newPassword });
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      const result = await apiSlice.verifyToken();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      localStorage.removeItem('authToken');
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: false,
  loading: false,
  error: null,
  permissions: [],
  lastActivity: null,
  sessionExpiry: null,
  rememberMe: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLastActivity: (state) => {
      state.lastActivity = new Date().toISOString();
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = [];
      state.sessionExpiry = null;
      state.error = null;
      localStorage.removeItem('authToken');
    },
    updateUserPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.permissions = action.payload.permissions || [];
        state.sessionExpiry = action.payload.expiresAt;
        state.lastActivity = new Date().toISOString();
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.sessionExpiry = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        // Still clear auth data even if logout API fails
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.sessionExpiry = null;
      })
      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.sessionExpiry = action.payload.expiresAt;
        state.lastActivity = new Date().toISOString();
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Clear auth on refresh failure
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.sessionExpiry = null;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        // Password changed successfully
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify token
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.permissions = action.payload.permissions || [];
        state.sessionExpiry = action.payload.expiresAt;
        state.lastActivity = new Date().toISOString();
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.sessionExpiry = null;
      });
  }
});

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserPermissions = (state) => state.auth.permissions;
export const selectLastActivity = (state) => state.auth.lastActivity;
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;
export const selectRememberMe = (state) => state.auth.rememberMe;

// Complex selectors
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserId = (state) => state.auth.user?.id;
export const selectUserName = (state) => state.auth.user?.name;
export const selectUserEmail = (state) => state.auth.user?.email;

// Permission check selector
export const selectHasPermission = (permission) => (state) => {
  return state.auth.permissions.includes(permission);
};

// Session status selector
export const selectIsSessionExpired = (state) => {
  if (!state.auth.sessionExpiry) return false;
  return new Date() > new Date(state.auth.sessionExpiry);
};

// Role-based access selector
export const selectCanAccess = (requiredRole) => (state) => {
  const userRole = state.auth.user?.role;
  const roleHierarchy = ['customer', 'staff', 'chef', 'admin'];
  const userLevel = roleHierarchy.indexOf(userRole);
  const requiredLevel = roleHierarchy.indexOf(requiredRole);
  return userLevel >= requiredLevel;
};

export const {
  clearError,
  updateLastActivity,
  setRememberMe,
  clearAuth,
  updateUserPermissions,
  setSessionExpiry
} = authSlice.actions;

export default authSlice.reducer;
