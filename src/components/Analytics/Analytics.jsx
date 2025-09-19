import React, { useState, useEffect } from 'react';
import { useApiApp } from '../../contexts/useApiApp';
import './Analytics.css';

const Analytics = () => {
  const { api } = useApiApp();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch comprehensive report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the working simple analytics endpoint
      const response = await api.get('/simple-analytics/dashboard-stats', {
        params: {
          period: 'month' // Use a simple period instead of date range
        }
      });
      
      if (response.success) {
        // Transform the data to match expected format
        const data = response.data;
        const transformedData = {
          overview: {
            revenue: {
              total: data.kpis.total_revenue,
              formatted: '$' + new Intl.NumberFormat().format(data.kpis.total_revenue)
            },
            orders: {
              total: data.kpis.total_orders,
              completed: data.kpis.total_orders
            },
            menu: {
              total: data.kpis.total_menu_items,
              available: data.kpis.available_menu_items
            },
            inventory: {
              total: data.kpis.total_inventory_items,
              low_stock: data.kpis.low_stock_items
            }
          },
          summary_cards: data.summary_cards,
          period: data.period,
          date_range: data.date_range
        };
        
        setReportData(transformedData);
      } else {
        throw new Error(response.message || 'Failed to fetch report data');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and date range change
  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  // Fetch data for specific tabs
  const fetchTabData = async (tab) => {
    try {
      setLoading(true);
      let endpoint;
      
      switch(tab) {
        case 'orders':
          endpoint = '/simple-analytics/orders-report';
          break;
        case 'menu':
          endpoint = '/simple-analytics/menu-report';
          break;
        case 'inventory':
          endpoint = '/simple-analytics/inventory-report';
          break;
        default:
          return;
      }
      
      const response = await api.get(endpoint, {
        params: { period: 'month' }
      });
      
      if (response.success) {
        // Update reportData with the new tab data
        setReportData(prev => ({
          ...prev,
          [tab]: response.data
        }));
      }
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab changes and load data if needed
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Only fetch if we don't already have the data
    if (tab !== 'overview' && reportData && !reportData[tab]) {
      fetchTabData(tab);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading comprehensive report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          <h3>Error Loading Report</h3>
          <p>{error}</p>
          <button onClick={fetchReportData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <h1>Business Intelligence Dashboard</h1>
        <p>Comprehensive insights into orders, menu, and inventory performance</p>
        
        {/* Date Range Selector */}
        <div className="date-range-selector">
          <div className="date-input-group">
            <label>From:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label>To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="date-input"
            />
          </div>
          <button onClick={fetchReportData} className="refresh-button">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData?.summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon orders-icon">📦</div>
            <div className="card-content">
              <h3>{reportData.summary.total_orders}</h3>
              <p>Total Orders</p>
              <small>{reportData.summary.completed_orders} completed</small>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon revenue-icon">💰</div>
            <div className="card-content">
              <h3>{formatCurrency(reportData.summary.total_revenue)}</h3>
              <p>Total Revenue</p>
              <small>Avg: {formatCurrency(reportData.summary.average_order_value)}</small>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon menu-icon">🍽️</div>
            <div className="card-content">
              <h3>{reportData.summary.active_menu_items}</h3>
              <p>Active Menu Items</p>
              <small>Available items</small>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon inventory-icon">📊</div>
            <div className="card-content">
              <h3>{reportData.summary.low_stock_alerts}</h3>
              <p>Stock Alerts</p>
              <small>Items need attention</small>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          Orders Analysis
        </button>
        <button
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => handleTabChange('menu')}
        >
          Menu Performance
        </button>
        <button
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabChange('inventory')}
        >
          Inventory Status
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab reportData={reportData} formatCurrency={formatCurrency} formatDate={formatDate} />
        )}
        {activeTab === 'orders' && (
          <OrdersTab reportData={reportData} formatCurrency={formatCurrency} formatDate={formatDate} />
        )}
        {activeTab === 'menu' && (
          <MenuTab reportData={reportData} formatCurrency={formatCurrency} />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab reportData={reportData} formatCurrency={formatCurrency} />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ reportData, formatCurrency, formatDate }) => (
  <div className="overview-tab">
    <div className="overview-grid">
      {/* Daily Revenue Chart */}
      <div className="chart-card">
        <h3>Daily Revenue Trend</h3>
        <div className="chart-container">
          {reportData.charts?.daily_stats && (
            <div className="simple-bar-chart">
              {reportData.charts.daily_stats.slice(-7).map((day, index) => (
                <div key={index} className="bar-item">
                  <div 
                    className="bar" 
                    style={{ height: `${Math.max((day.revenue / Math.max(...reportData.charts.daily_stats.map(d => d.revenue))) * 100, 5)}%` }}
                  ></div>
                  <span className="bar-label">{formatDate(day.date)}</span>
                  <span className="bar-value">{formatCurrency(day.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Type Distribution */}
      <div className="chart-card">
        <h3>Order Type Distribution</h3>
        <div className="pie-chart-container">
          {reportData.charts?.order_type_distribution && (
            <div className="pie-chart-legend">
              {reportData.charts.order_type_distribution.map((type, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: `hsl(${index * 120}, 70%, 60%)` }}></span>
                  <span>{type.order_type}: {type.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Orders Tab Component
const OrdersTab = ({ reportData, formatCurrency, formatDate }) => (
  <div className="orders-tab">
    <div className="section-grid">
      {/* Order Status Breakdown */}
      <div className="data-card">
        <h3>Order Status Breakdown</h3>
        <div className="status-grid">
          {reportData.orders?.status_breakdown && reportData.orders.status_breakdown.map((statusItem, index) => (
            <div key={index} className="status-item">
              <span className={`status-badge ${statusItem.status}`}>{statusItem.status}</span>
              <span className="status-count">{statusItem.count} orders</span>
              <span className="status-total">{formatCurrency(statusItem.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="data-card full-width">
        <h3>Recent Orders</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {reportData.orders?.orders && reportData.orders.orders.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name || 'Walk-in'}</td>
                  <td>{order.order_type}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                  </td>
                  <td>{formatCurrency(order.total_amount)}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

// Menu Tab Component
const MenuTab = ({ reportData, formatCurrency }) => (
  <div className="menu-tab">
    <div className="section-grid">
      {/* Category Breakdown */}
      <div className="data-card">
        <h3>Menu Categories</h3>
        <div className="category-list">
          {reportData.menu?.category_breakdown && reportData.menu.category_breakdown.map((categoryItem, index) => (
            <div key={index} className="category-item">
              <span className="category-name">{categoryItem.category}</span>
              <span className="category-count">{categoryItem.count} items</span>
              <span className="category-price">Avg: {formatCurrency(categoryItem.avg_price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Performance */}
      <div className="data-card">
        <h3>Menu Performance</h3>
        <div className="performance-stats">
          {reportData.menu?.menu_performance && (
            <>
              <div className="stat-item">
                <span className="stat-label">Total Items:</span>
                <span className="stat-value">{reportData.menu.menu_performance.total_items}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Available:</span>
                <span className="stat-value">{reportData.menu.menu_performance.available_items}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Featured:</span>
                <span className="stat-value">{reportData.menu.menu_performance.featured_items}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Categories:</span>
                <span className="stat-value">{reportData.menu.menu_performance.categories}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="data-card full-width">
        <h3>Top Selling Items</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {reportData.menu?.top_selling_items && reportData.menu.top_selling_items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{item.total_sold}</td>
                  <td>{formatCurrency(item.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

// Inventory Tab Component
const InventoryTab = ({ reportData, formatCurrency }) => (
  <div className="inventory-tab">
    <div className="section-grid">
      {/* Stock Status */}
      <div className="data-card">
        <h3>Stock Status Overview</h3>
        <div className="stock-status">
          <div className="status-item critical">
            <span className="status-label">Critical Stock Items:</span>
            <span className="status-value">{reportData.inventory?.alerts?.critical_stock?.length || 0}</span>
          </div>
          <div className="status-item low">
            <span className="status-label">Low Stock Items:</span>
            <span className="status-value">{reportData.inventory?.alerts?.low_stock?.length || 0}</span>
          </div>
          <div className="status-item adequate">
            <span className="status-label">Total Items:</span>
            <span className="status-value">{reportData.inventory?.total_items || 0}</span>
          </div>
        </div>
        <div className="inventory-value">
          <strong>Total Value: {formatCurrency(reportData.inventory?.total_value)}</strong>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="data-card">
        <h3>Inventory by Category</h3>
        <div className="category-breakdown">
          {reportData.inventory?.category_breakdown && reportData.inventory.category_breakdown.map((categoryItem, index) => (
            <div key={index} className="category-row">
              <span className="category-name">{categoryItem.category}</span>
              <div className="category-stats">
                <span>{categoryItem.count} items</span>
                <span>{formatCurrency(categoryItem.total_value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Items */}
      <div className="data-card full-width">
        <h3>Items Requiring Attention</h3>
        <div className="alert-sections">
          {/* Critical Stock */}
          {reportData.inventory?.alerts?.critical_stock && reportData.inventory.alerts.critical_stock.length > 0 && (
            <div className="alert-section critical">
              <h4>🚨 Critical Stock</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Current Stock</th>
                      <th>Category</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.inventory.alerts.critical_stock.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td className="critical-quantity">{item.quantity}</td>
                        <td>{item.category}</td>
                        <td>{formatCurrency(item.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Low Stock */}
          {reportData.inventory?.alerts?.low_stock && reportData.inventory.alerts.low_stock.length > 0 && (
            <div className="alert-section low">
              <h4>⚠️ Low Stock</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Current Stock</th>
                      <th>Category</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.inventory.alerts.low_stock.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td className="low-quantity">{item.quantity}</td>
                        <td>{item.category}</td>
                        <td>{formatCurrency(item.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default Analytics;