import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiSlice from '../../services/apiSlice';

// Async thunks
export const fetchReservations = createAsyncThunk(
  'reservations/fetchReservations',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getReservations(filters);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createReservation = createAsyncThunk(
  'reservations/createReservation',
  async (reservationData, { rejectWithValue }) => {
    try {
      const result = await apiSlice.createReservation(reservationData);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReservation = createAsyncThunk(
  'reservations/updateReservation',
  async ({ id, reservationData }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.updateReservation(id, reservationData);
      if (result.success) {
        return { id, ...result.data };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'reservations/cancelReservation',
  async (id, { rejectWithValue }) => {
    try {
      const result = await apiSlice.cancelReservation(id);
      if (result.success) {
        return id;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'reservations/checkAvailability',
  async ({ date, time, partySize }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.checkTableAvailability({ date, time, partySize });
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTables = createAsyncThunk(
  'reservations/fetchTables',
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getTables();
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
  reservations: [],
  tables: [],
  availability: null,
  loading: false,
  error: null,
  filterDate: null,
  filterStatus: 'all',
  filterTimeSlot: 'all',
  sortBy: 'reservationTime',
  sortOrder: 'asc',
  selectedReservation: null,
  reservationStats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    seated: 0,
    completed: 0,
    cancelled: 0
  }
};

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    setFilterDate: (state, action) => {
      state.filterDate = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterTimeSlot: (state, action) => {
      state.filterTimeSlot = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setSelectedReservation: (state, action) => {
      state.selectedReservation = action.payload;
    },
    updateReservationStatus: (state, action) => {
      const { id, status } = action.payload;
      const reservation = state.reservations.find(r => r.id === id);
      if (reservation) {
        reservation.status = status;
        reservation.updatedAt = new Date().toISOString();
      }
      reservationSlice.caseReducers.updateReservationStats(state);
    },
    assignTable: (state, action) => {
      const { reservationId, tableId } = action.payload;
      const reservation = state.reservations.find(r => r.id === reservationId);
      if (reservation) {
        reservation.tableId = tableId;
        reservation.status = 'seated';
        reservation.updatedAt = new Date().toISOString();
      }
      
      const table = state.tables.find(t => t.id === tableId);
      if (table) {
        table.status = 'occupied';
      }
      
      reservationSlice.caseReducers.updateReservationStats(state);
    },
    releaseTable: (state, action) => {
      const { reservationId, tableId } = action.payload;
      const reservation = state.reservations.find(r => r.id === reservationId);
      if (reservation) {
        reservation.status = 'completed';
        reservation.updatedAt = new Date().toISOString();
      }
      
      const table = state.tables.find(t => t.id === tableId);
      if (table) {
        table.status = 'available';
      }
      
      reservationSlice.caseReducers.updateReservationStats(state);
    },
    updateReservationStats: (state) => {
      const stats = {
        total: state.reservations.length,
        pending: 0,
        confirmed: 0,
        seated: 0,
        completed: 0,
        cancelled: 0
      };
      
      state.reservations.forEach(reservation => {
        if (stats.hasOwnProperty(reservation.status)) {
          stats[reservation.status]++;
        }
      });
      
      state.reservationStats = stats;
    },
    clearAvailability: (state) => {
      state.availability = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filterDate = null;
      state.filterStatus = 'all';
      state.filterTimeSlot = 'all';
      state.sortBy = 'reservationTime';
      state.sortOrder = 'asc';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
        reservationSlice.caseReducers.updateReservationStats(state);
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.push(action.payload);
        reservationSlice.caseReducers.updateReservationStats(state);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update reservation
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reservations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
        reservationSlice.caseReducers.updateReservationStats(state);
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel reservation
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        const reservation = state.reservations.find(r => r.id === action.payload);
        if (reservation) {
          reservation.status = 'cancelled';
          reservation.updatedAt = new Date().toISOString();
        }
        reservationSlice.caseReducers.updateReservationStats(state);
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check availability
      .addCase(checkAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(checkAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.availability = null;
      })
      // Fetch tables
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectReservations = (state) => state.reservations.reservations;
export const selectTables = (state) => state.reservations.tables;
export const selectAvailability = (state) => state.reservations.availability;
export const selectReservationsLoading = (state) => state.reservations.loading;
export const selectReservationsError = (state) => state.reservations.error;
export const selectFilterDate = (state) => state.reservations.filterDate;
export const selectFilterStatus = (state) => state.reservations.filterStatus;
export const selectFilterTimeSlot = (state) => state.reservations.filterTimeSlot;
export const selectSortBy = (state) => state.reservations.sortBy;
export const selectSortOrder = (state) => state.reservations.sortOrder;
export const selectSelectedReservation = (state) => state.reservations.selectedReservation;
export const selectReservationStats = (state) => state.reservations.reservationStats;

// Filtered and sorted reservations selector
export const selectFilteredReservations = (state) => {
  const { reservations, filterDate, filterStatus, filterTimeSlot, sortBy, sortOrder } = state.reservations;
  
  let filteredReservations = reservations;
  
  // Date filter
  if (filterDate) {
    const filterDateStr = new Date(filterDate).toISOString().split('T')[0];
    filteredReservations = filteredReservations.filter(reservation => {
      const reservationDateStr = new Date(reservation.reservationDate).toISOString().split('T')[0];
      return reservationDateStr === filterDateStr;
    });
  }
  
  // Status filter
  if (filterStatus !== 'all') {
    filteredReservations = filteredReservations.filter(reservation => reservation.status === filterStatus);
  }
  
  // Time slot filter
  if (filterTimeSlot !== 'all') {
    filteredReservations = filteredReservations.filter(reservation => {
      const hour = new Date(reservation.reservationTime).getHours();
      switch (filterTimeSlot) {
        case 'breakfast':
          return hour >= 6 && hour < 11;
        case 'lunch':
          return hour >= 11 && hour < 17;
        case 'dinner':
          return hour >= 17 && hour < 23;
        default:
          return true;
      }
    });
  }
  
  // Sort
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue?.toLowerCase() || '';
    }
    
    // Handle date/time comparison
    if (sortBy === 'reservationDate' || sortBy === 'reservationTime' || sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle numeric comparison
    if (sortBy === 'partySize') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  return sortedReservations;
};

// Today's reservations selector
export const selectTodaysReservations = (state) => {
  const today = new Date().toISOString().split('T')[0];
  return state.reservations.reservations.filter(reservation => {
    const reservationDate = new Date(reservation.reservationDate).toISOString().split('T')[0];
    return reservationDate === today;
  });
};

// Available tables selector
export const selectAvailableTables = (state) => {
  return state.reservations.tables.filter(table => table.status === 'available');
};

// Occupied tables selector
export const selectOccupiedTables = (state) => {
  return state.reservations.tables.filter(table => table.status === 'occupied');
};

// Upcoming reservations selector (next 2 hours)
export const selectUpcomingReservations = (state) => {
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  return state.reservations.reservations.filter(reservation => {
    const reservationTime = new Date(reservation.reservationTime);
    return reservationTime >= now && reservationTime <= twoHoursLater && 
           ['confirmed', 'pending'].includes(reservation.status);
  });
};

export const {
  setFilterDate,
  setFilterStatus,
  setFilterTimeSlot,
  setSortBy,
  setSortOrder,
  setSelectedReservation,
  updateReservationStatus,
  assignTable,
  releaseTable,
  updateReservationStats,
  clearAvailability,
  clearError,
  resetFilters
} = reservationSlice.actions;

export default reservationSlice.reducer;
