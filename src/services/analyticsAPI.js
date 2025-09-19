// Enhanced Analytics API Service - Updated for Unified Real-Time Integration
import api from './api.js';
import unifiedPOSAPI from './unifiedPOSAPI.js';

class AnalyticsAPI {
  // Get dashboard statistics (now uses unified API)
  async getDashboardStats(period = 'today') {
    try {
      const result = await unifiedPOSAPI.getDashboardStats(period);
      if (result.success) {
        return { data: result.data };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  // Get comprehensive dashboard data (Real-time)
  async getDashboardData(period = 'today') {
    try {
      const result = await unifiedPOSAPI.getDashboardData(period);
      if (result.success) {
        return { data: result.data };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  // Get live KPIs
  async getLiveKPIs(period = 'today') {
    try {
      const result = await unifiedPOSAPI.getLiveKPIs(period);
      if (result.success) {
        return { data: result.data };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch live KPIs:', error);
      throw error;
    }
  }

  // Get sales report
  async getSalesReport(startDate, endDate) {
    try {
      const response = await api.get('/analytics/sales-report', {
        params: {
          start_date: this.formatDate(startDate),
          end_date: this.formatDate(endDate)
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
      throw error;
    }
  }

  // Get inventory report
  async getInventoryReport() {
    try {
      const response = await api.get('/analytics/inventory-report');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch inventory report:', error);
      throw error;
    }
  }

  // Get menu report
  async getMenuReport(startDate = null, endDate = null) {
    try {
      const params = {};
      if (startDate) params.start_date = this.formatDate(startDate);
      if (endDate) params.end_date = this.formatDate(endDate);

      const response = await api.get('/analytics/menu-report', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch menu report:', error);
      throw error;
    }
  }

  // Get comprehensive report (all data combined)
  async getComprehensiveReport(startDate, endDate) {
    try {
      const response = await api.get('/analytics/comprehensive-report', {
        params: {
          start_date: this.formatDate(startDate),
          end_date: this.formatDate(endDate)
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch comprehensive report:', error);
      throw error;
    }
  }

  // Get saved reports
  async getSavedReports(reportType = null, limit = 20) {
    try {
      const params = { limit };
      if (reportType) params.report_type = reportType;

      const response = await api.get('/analytics/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch saved reports:', error);
      throw error;
    }
  }

  // Get a specific report
  async getReport(reportId) {
    try {
      const response = await api.get(`/analytics/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch report:', error);
      throw error;
    }
  }

  // Delete a saved report
  async deleteReport(reportId) {
    try {
      const response = await api.delete(`/analytics/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete report:', error);
      throw error;
    }
  }

  // Get comprehensive analytics data
  async getAnalytics(startDate, endDate, groupBy = 'day') {
    try {
      const response = await api.get('/analytics/dashboard', {
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  // Get revenue trend data
  async getRevenueTrend(startDate, endDate, groupBy = 'day') {
    try {
      const response = await api.get('/analytics/revenue-trend', {
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue trend:', error);
      throw error;
    }
  }

  // Get top performing items
  async getTopItems(startDate, endDate, limit = 10) {
    try {
      const response = await api.get('/analytics/top-items', {
        params: {
          start_date: startDate,
          end_date: endDate,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top items:', error);
      throw error;
    }
  }

  // Get top customers
  async getTopCustomers(startDate, endDate, limit = 10) {
    try {
      const response = await api.get('/analytics/top-customers', {
        params: {
          start_date: startDate,
          end_date: endDate,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top customers:', error);
      throw error;
    }
  }

  // Get waiter performance data
  async getWaiterPerformance(startDate, endDate, waiterId = null) {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate
      };
      
      if (waiterId) {
        params.waiter_id = waiterId;
      }

      const response = await api.get('/analytics/waiter-performance', {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch waiter performance:', error);
      throw error;
    }
  }

  // Export data to CSV
  async exportCSV(startDate, endDate, reportType, groupBy = 'day') {
    try {
      const response = await api.get('/analytics/export/csv', {
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
          group_by: groupBy
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${reportType}_report_${startDate}_to_${endDate}.csv`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  }

  // Export data to XLSX
  async exportXLSX(startDate, endDate, reportType, groupBy = 'day') {
    try {
      const response = await api.get('/analytics/export/xlsx', {
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
          group_by: groupBy
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${reportType}_report_${startDate}_to_${endDate}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Failed to export XLSX:', error);
      throw error;
    }
  }

  // Export data to PDF
  async exportPDF(startDate, endDate, reportType) {
    try {
      const response = await api.get('/analytics/export/pdf', {
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${reportType}_report_${startDate}_to_${endDate}.pdf`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Failed to export PDF:', error);
      throw error;
    }
  }

  // Generate daily analytics (background job)
  async generateDailyAnalytics(date = null) {
    try {
      const params = {};
      if (date) {
        params.date = date;
      }

      const response = await api.post('/analytics/generate-daily', params);
      return response.data;
    } catch (error) {
      console.error('Failed to generate daily analytics:', error);
      throw error;
    }
  }

  // Helper method to format date for API
  formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  // Helper method to get date ranges
  getDateRanges() {
    const now = new Date();
    const ranges = {
      today: {
        start: this.formatDate(now),
        end: this.formatDate(now),
        label: 'Today'
      },
      yesterday: {
        start: this.formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
        end: this.formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
        label: 'Yesterday'
      },
      thisWeek: {
        start: this.formatDate(new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000))),
        end: this.formatDate(now),
        label: 'This Week'
      },
      lastWeek: {
        start: this.formatDate(new Date(now.getTime() - ((now.getDay() + 7) * 24 * 60 * 60 * 1000))),
        end: this.formatDate(new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000))),
        label: 'Last Week'
      },
      thisMonth: {
        start: this.formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: this.formatDate(now),
        label: 'This Month'
      },
      lastMonth: {
        start: this.formatDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: this.formatDate(new Date(now.getFullYear(), now.getMonth(), 0)),
        label: 'Last Month'
      },
      thisYear: {
        start: this.formatDate(new Date(now.getFullYear(), 0, 1)),
        end: this.formatDate(now),
        label: 'This Year'
      }
    };

    return ranges;
  }
}

// Create singleton instance
const analyticsAPI = new AnalyticsAPI();

export default analyticsAPI;