import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiSlice from '../../services/apiSlice';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getNotifications(filters);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const result = await apiSlice.markNotificationAsRead(notificationId);
      if (result.success) {
        return notificationId;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiSlice.markAllNotificationsAsRead();
      if (result.success) {
        return true;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const result = await apiSlice.deleteNotification(notificationId);
      if (result.success) {
        return notificationId;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendNotification = createAsyncThunk(
  'notifications/sendNotification',
  async ({ message, type, targetUsers, priority = 'normal' }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.sendNotification({ message, type, targetUsers, priority });
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  filterType: 'all',
  filterStatus: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  unreadCount: 0,
  notificationSettings: {
    orders: true,
    reservations: true,
    inventory: true,
    system: true,
    marketing: false
  },
  localNotifications: [] // For client-side notifications
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setFilterType: (state, action) => {
      state.filterType = action.payload;
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
    addLocalNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
        isLocal: true,
        read: false,
        createdAt: new Date().toISOString()
      };
      state.localNotifications.unshift(notification);
      state.unreadCount++;
    },
    removeLocalNotification: (state, action) => {
      const id = action.payload;
      const notification = state.localNotifications.find(n => n.id === id);
      if (notification && !notification.read) {
        state.unreadCount--;
      }
      state.localNotifications = state.localNotifications.filter(n => n.id !== id);
    },
    markLocalAsRead: (state, action) => {
      const id = action.payload;
      const notification = state.localNotifications.find(n => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount--;
      }
    },
    updateNotificationSettings: (state, action) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload };
    },
    updateUnreadCount: (state) => {
      const serverUnread = state.notifications.filter(n => !n.read).length;
      const localUnread = state.localNotifications.filter(n => !n.read).length;
      state.unreadCount = serverUnread + localUnread;
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.localNotifications = [];
      state.unreadCount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filterType = 'all';
      state.filterStatus = 'all';
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        notificationSlice.caseReducers.updateUnreadCount(state);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
        }
        notificationSlice.caseReducers.updateUnreadCount(state);
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications.forEach(notification => {
          if (!notification.read) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.localNotifications.forEach(notification => {
          notification.read = true;
          notification.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          state.unreadCount--;
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send notification
      .addCase(sendNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.loading = false;
        // Add the sent notification to the list if it's for the current user
        if (action.payload.includesSelf) {
          state.notifications.unshift(action.payload);
          state.unreadCount++;
        }
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectLocalNotifications = (state) => state.notifications.localNotifications;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectFilterType = (state) => state.notifications.filterType;
export const selectFilterStatus = (state) => state.notifications.filterStatus;
export const selectSortBy = (state) => state.notifications.sortBy;
export const selectSortOrder = (state) => state.notifications.sortOrder;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationSettings = (state) => state.notifications.notificationSettings;

// Combined notifications selector (server + local)
export const selectAllNotifications = (state) => {
  const serverNotifications = state.notifications.notifications;
  const localNotifications = state.notifications.localNotifications;
  
  return [...localNotifications, ...serverNotifications].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

// Filtered notifications selector
export const selectFilteredNotifications = (state) => {
  const allNotifications = selectAllNotifications(state);
  const { filterType, filterStatus, sortBy, sortOrder } = state.notifications;
  
  let filteredNotifications = allNotifications;
  
  // Type filter
  if (filterType !== 'all') {
    filteredNotifications = filteredNotifications.filter(notification => 
      notification.type === filterType
    );
  }
  
  // Status filter
  if (filterStatus !== 'all') {
    if (filterStatus === 'read') {
      filteredNotifications = filteredNotifications.filter(notification => notification.read);
    } else if (filterStatus === 'unread') {
      filteredNotifications = filteredNotifications.filter(notification => !notification.read);
    }
  }
  
  // Sort
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle date comparison
    if (sortBy === 'createdAt' || sortBy === 'readAt') {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    }
    
    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue?.toLowerCase() || '';
    }
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  return sortedNotifications;
};

// Recent notifications selector (last 24 hours)
export const selectRecentNotifications = (state) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const allNotifications = selectAllNotifications(state);
  
  return allNotifications.filter(notification => 
    new Date(notification.createdAt) > twentyFourHoursAgo
  );
};

// Unread notifications selector
export const selectUnreadNotifications = (state) => {
  const allNotifications = selectAllNotifications(state);
  return allNotifications.filter(notification => !notification.read);
};

// Notifications by type selector
export const selectNotificationsByType = (type) => (state) => {
  const allNotifications = selectAllNotifications(state);
  return allNotifications.filter(notification => notification.type === type);
};

// Priority notifications selector
export const selectPriorityNotifications = (state) => {
  const allNotifications = selectAllNotifications(state);
  return allNotifications.filter(notification => 
    notification.priority === 'high' || notification.priority === 'urgent'
  );
};

export const {
  setFilterType,
  setFilterStatus,
  setSortBy,
  setSortOrder,
  addLocalNotification,
  removeLocalNotification,
  markLocalAsRead,
  updateNotificationSettings,
  updateUnreadCount,
  clearAllNotifications,
  clearError,
  resetFilters
} = notificationSlice.actions;

export default notificationSlice.reducer;
