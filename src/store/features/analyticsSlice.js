import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiSlice from '../../services/apiSlice';

// Async thunks
export const fetchSalesAnalytics = createAsyncThunk(
  'analytics/fetchSalesAnalytics',
  async ({ startDate, endDate, period = 'daily' }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getSalesAnalytics({ startDate, endDate, period });
      if (result.success) {
        return { period, data: result.data };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMenuAnalytics = createAsyncThunk(
  'analytics/fetchMenuAnalytics',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getMenuAnalytics({ startDate, endDate });
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerAnalytics = createAsyncThunk(
  'analytics/fetchCustomerAnalytics',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getCustomerAnalytics({ startDate, endDate });
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOperationalAnalytics = createAsyncThunk(
  'analytics/fetchOperationalAnalytics',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getOperationalAnalytics({ startDate, endDate });
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'analytics/fetchRevenueAnalytics',
  async ({ startDate, endDate, breakdown = 'daily' }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.getRevenueAnalytics({ startDate, endDate, breakdown });
      if (result.success) {
        return { breakdown, data: result.data };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateReport = createAsyncThunk(
  'analytics/generateReport',
  async ({ reportType, parameters }, { rejectWithValue }) => {
    try {
      const result = await apiSlice.generateReport({ reportType, parameters });
      if (result.success) {
        return { reportType, ...result.data };
      }
      throw new Error(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  salesData: {
    daily: [],
    weekly: [],
    monthly: []
  },
  menuAnalytics: {
    popularItems: [],
    categoryPerformance: [],
    profitabilityAnalysis: []
  },
  customerAnalytics: {
    demographics: {},
    behaviorPatterns: {},
    loyaltyMetrics: {}
  },
  operationalAnalytics: {
    tableUtilization: {},
    staffEfficiency: {},
    wasteAnalysis: {}
  },
  revenueData: {
    daily: [],
    weekly: [],
    monthly: []
  },
  reports: [],
  loading: false,
  error: null,
  dateRange: {
    startDate: null,
    endDate: null
  },
  selectedPeriod: 'daily',
  selectedMetrics: ['revenue', 'orders', 'customers'],
  dashboardKPIs: {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    customerCount: 0,
    tableUtilization: 0,
    popularItem: null
  }
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    setSelectedMetrics: (state, action) => {
      state.selectedMetrics = action.payload;
    },
    updateKPIs: (state, action) => {
      state.dashboardKPIs = { ...state.dashboardKPIs, ...action.payload };
    },
    addReport: (state, action) => {
      state.reports.unshift(action.payload);
    },
    removeReport: (state, action) => {
      const reportId = action.payload;
      state.reports = state.reports.filter(report => report.id !== reportId);
    },
    clearAnalyticsData: (state) => {
      state.salesData = { daily: [], weekly: [], monthly: [] };
      state.menuAnalytics = { popularItems: [], categoryPerformance: [], profitabilityAnalysis: [] };
      state.customerAnalytics = { demographics: {}, behaviorPatterns: {}, loyaltyMetrics: {} };
      state.operationalAnalytics = { tableUtilization: {}, staffEfficiency: {}, wasteAnalysis: {} };
      state.revenueData = { daily: [], weekly: [], monthly: [] };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales analytics
      .addCase(fetchSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        const { period, data } = action.payload;
        state.salesData[period] = data;
      })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch menu analytics
      .addCase(fetchMenuAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.menuAnalytics = action.payload;
        
        // Update KPI for popular item
        if (action.payload.popularItems && action.payload.popularItems.length > 0) {
          state.dashboardKPIs.popularItem = action.payload.popularItems[0];
        }
      })
      .addCase(fetchMenuAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch customer analytics
      .addCase(fetchCustomerAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.customerAnalytics = action.payload;
        
        // Update customer count KPI
        if (action.payload.totalCustomers) {
          state.dashboardKPIs.customerCount = action.payload.totalCustomers;
        }
      })
      .addCase(fetchCustomerAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch operational analytics
      .addCase(fetchOperationalAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOperationalAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.operationalAnalytics = action.payload;
        
        // Update table utilization KPI
        if (action.payload.tableUtilization && action.payload.tableUtilization.averageUtilization) {
          state.dashboardKPIs.tableUtilization = action.payload.tableUtilization.averageUtilization;
        }
      })
      .addCase(fetchOperationalAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch revenue analytics
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        const { breakdown, data } = action.payload;
        state.revenueData[breakdown] = data;
        
        // Update revenue KPIs
        if (data.totalRevenue) {
          state.dashboardKPIs.totalRevenue = data.totalRevenue;
        }
        if (data.totalOrders) {
          state.dashboardKPIs.totalOrders = data.totalOrders;
        }
        if (data.averageOrderValue) {
          state.dashboardKPIs.averageOrderValue = data.averageOrderValue;
        }
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate report
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.unshift({
          id: Date.now(),
          ...action.payload,
          generatedAt: new Date().toISOString()
        });
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectSalesData = (state) => state.analytics.salesData;
export const selectMenuAnalytics = (state) => state.analytics.menuAnalytics;
export const selectCustomerAnalytics = (state) => state.analytics.customerAnalytics;
export const selectOperationalAnalytics = (state) => state.analytics.operationalAnalytics;
export const selectRevenueData = (state) => state.analytics.revenueData;
export const selectReports = (state) => state.analytics.reports;
export const selectAnalyticsLoading = (state) => state.analytics.loading;
export const selectAnalyticsError = (state) => state.analytics.error;
export const selectDateRange = (state) => state.analytics.dateRange;
export const selectSelectedPeriod = (state) => state.analytics.selectedPeriod;
export const selectSelectedMetrics = (state) => state.analytics.selectedMetrics;
export const selectDashboardKPIs = (state) => state.analytics.dashboardKPIs;

// Complex selectors
export const selectSalesDataByPeriod = (period) => (state) => {
  return state.analytics.salesData[period] || [];
};

export const selectRevenueDataByBreakdown = (breakdown) => (state) => {
  return state.analytics.revenueData[breakdown] || [];
};

export const selectTopSellingItems = (limit = 5) => (state) => {
  return state.analytics.menuAnalytics.popularItems?.slice(0, limit) || [];
};

export const selectRevenueGrowth = (state) => {
  const revenueData = state.analytics.revenueData[state.analytics.selectedPeriod] || [];
  if (revenueData.length < 2) return 0;
  
  const current = revenueData[revenueData.length - 1]?.revenue || 0;
  const previous = revenueData[revenueData.length - 2]?.revenue || 0;
  
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const selectOrderTrends = (state) => {
  const salesData = state.analytics.salesData[state.analytics.selectedPeriod] || [];
  return salesData.map(item => ({
    date: item.date,
    orders: item.orderCount || 0
  }));
};

export const selectCustomerRetentionRate = (state) => {
  return state.analytics.customerAnalytics.loyaltyMetrics?.retentionRate || 0;
};

export const selectAverageOrderValue = (state) => {
  return state.analytics.dashboardKPIs.averageOrderValue || 0;
};

export const selectTableUtilizationRate = (state) => {
  return state.analytics.dashboardKPIs.tableUtilization || 0;
};

// Performance metrics selector
export const selectPerformanceMetrics = (state) => {
  const kpis = state.analytics.dashboardKPIs;
  const revenueGrowth = selectRevenueGrowth(state);
  const retentionRate = selectCustomerRetentionRate(state);
  
  return {
    revenue: {
      current: kpis.totalRevenue,
      growth: revenueGrowth
    },
    orders: {
      total: kpis.totalOrders,
      average: kpis.averageOrderValue
    },
    customers: {
      total: kpis.customerCount,
      retention: retentionRate
    },
    operations: {
      tableUtilization: kpis.tableUtilization
    }
  };
};

export const {
  setDateRange,
  setSelectedPeriod,
  setSelectedMetrics,
  updateKPIs,
  addReport,
  removeReport,
  clearAnalyticsData,
  clearError
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
