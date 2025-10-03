import React, { useState, useEffect } from 'react';
import { useApiApp } from '../../contexts/useApiApp';
import './Analytics.css';

const Analytics = () => {
  const { api } = useApiApp();
  const [dashboardData, setDashboardData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: '',
    enabled: false
  });

  // Period options for the dropdown
  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Fetch dashboard data
  const fetchDashboardData = async (period = selectedPeriod, customStart = null, customEnd = null) => {
    try {
      if (refreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      let params = { period };
      
      // If custom date range is enabled, add start and end dates
      if (period === 'custom' && customStart && customEnd) {
        params.start_date = customStart;
        params.end_date = customEnd;
      }
      
      const response = await api.get('/simple-analytics/dashboard-stats', { params });
      
      if (response.success) {
        setDashboardData(response.data);
        console.log('Dashboard data fetched:', response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch tab-specific data
  const fetchTabData = async (tab, period = selectedPeriod) => {
    try {
      setLoading(true);
      let endpoint = '';
      let params = { period };
      
      // Add custom date range if applicable
      if (period === 'custom' && customDateRange.start && customDateRange.end) {
        params.start_date = customDateRange.start;
        params.end_date = customDateRange.end;
      }
      
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
      
      const response = await api.get(endpoint, { params });
      
      if (response.success) {
        switch(tab) {
          case 'orders':
            setOrdersData(response.data);
            break;
          case 'menu':
            setMenuData(response.data);
            break;
          case 'inventory':
            setInventoryData(response.data);
            break;
        }
        console.log(`${tab} data fetched:`, response.data);
      } else {
        throw new Error(response.message || `Failed to fetch ${tab} data`);
      }
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
      setError(`Failed to fetch ${tab} data`);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and period change
  useEffect(() => {
    if (selectedPeriod === 'custom' && customDateRange.enabled && customDateRange.start && customDateRange.end) {
      fetchDashboardData(selectedPeriod, customDateRange.start, customDateRange.end);
    } else if (selectedPeriod !== 'custom') {
      fetchDashboardData(selectedPeriod);
    }
  }, [selectedPeriod, customDateRange]);

  // Handle period change
  const handlePeriodChange = (period) => {
    console.log('Period changed to:', period);
    setSelectedPeriod(period);
    
    if (period === 'custom') {
      setCustomDateRange(prev => ({ ...prev, enabled: true }));
    } else {
      setCustomDateRange(prev => ({ ...prev, enabled: false }));
      // Reset tab data when period changes
      setOrdersData(null);
      setMenuData(null);
      setInventoryData(null);
    }
  };

  // Handle custom date range change
  const handleCustomDateChange = (field, value) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      console.log('Applying custom date range:', customDateRange.start, 'to', customDateRange.end);
      fetchDashboardData('custom', customDateRange.start, customDateRange.end);
    }
  };

  // Handle tab changes and load data if needed
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Load tab-specific data if not already loaded or if we need fresh data
    if (tab !== 'overview') {
      const currentPeriod = selectedPeriod === 'custom' && customDateRange.enabled ? 'custom' : selectedPeriod;
      fetchTabData(tab, currentPeriod);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    
    if (activeTab === 'overview') {
      if (selectedPeriod === 'custom' && customDateRange.enabled) {
        fetchDashboardData('custom', customDateRange.start, customDateRange.end);
      } else {
        fetchDashboardData(selectedPeriod);
      }
    } else {
      const currentPeriod = selectedPeriod === 'custom' && customDateRange.enabled ? 'custom' : selectedPeriod;
      fetchTabData(activeTab, currentPeriod);
    }
  };

  const formatCurrency = (amount) => {
    return '৳' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get icon for summary cards
  const getIconForCard = (iconName) => {
    const icons = {
      'dollar-sign': '💰',
      'shopping-cart': '🛒',
      'target': '🎯',
      'alert-triangle': '⚠️',
      'menu': '📋',
      'users': '👥'
    };
    return icons[iconName] || '📊';
  };

  if (loading && !dashboardData) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={() => fetchDashboardData()} className="retry-button">
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
        <div className="header-content">
          <div className="header-text">
            <h1>📊 Analytics & Reports</h1>
            <p>Real-time Business Analytics and Custom Report System</p>
          </div>
          
          {/* Period Selector and Controls */}
          <div className="header-controls">
            <div className="period-selector">
              <label htmlFor="period-select">Select Period:</label>
              <select 
                id="period-select"
                value={selectedPeriod} 
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="period-select"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleRefresh} 
              className="refresh-button"
              disabled={refreshing}
            >
              {refreshing ? '🔄' : '↻'} Refresh
            </button>
          </div>
        </div>
        
        {/* Custom Date Range Picker */}
        {selectedPeriod === 'custom' && (
          <div className="custom-date-range">
            <div className="date-inputs">
              <div className="date-input-group">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label>End Date:</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                  className="date-input"
                />
              </div>
              <button 
                onClick={applyCustomDateRange}
                className="apply-date-button"
                disabled={!customDateRange.start || !customDateRange.end}
              >
                Apply Range
              </button>
            </div>
          </div>
        )}
        
        {/* Date Range Display */}
        {dashboardData?.date_range && (
          <div className="date-range-display">
            <span>📅 Report Period: {formatDate(dashboardData.date_range.start)} to {formatDate(dashboardData.date_range.end)}</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {dashboardData?.summary_cards && (
        <div className="summary-cards">
          {dashboardData.summary_cards.map((card, index) => (
            <div key={index} className={`summary-card ${card.color}`}>
              <div className="card-icon">
                {getIconForCard(card.icon)}
              </div>
              <div className="card-content">
                <h3>{card.value}</h3>
                <p>{card.title}</p>
                {card.change && (
                  <small>{card.change}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Updating data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          📈 Orders Analysis
        </button>
        <button
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => handleTabChange('menu')}
        >
          🍽️ Menu Performance
        </button>
        <button
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabChange('inventory')}
        >
          📦 Inventory Status
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            dashboardData={dashboardData} 
            formatCurrency={formatCurrency} 
            formatDate={formatDate} 
          />
        )}
        {activeTab === 'orders' && (
          <OrdersTab 
            ordersData={ordersData} 
            formatCurrency={formatCurrency} 
            formatDate={formatDate}
            loading={loading}
          />
        )}
        {activeTab === 'menu' && (
          <MenuTab 
            menuData={menuData} 
            formatCurrency={formatCurrency} 
            loading={loading}
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab 
            inventoryData={inventoryData} 
            formatCurrency={formatCurrency} 
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ dashboardData, formatCurrency, formatDate }) => (
  <div className="overview-tab">
    <div className="overview-grid">
      {/* Revenue Trend Chart */}
      <div className="chart-card">
        <h3>💰 Revenue Trend</h3>
        <div className="chart-container">
          {dashboardData?.charts?.revenue_trend && dashboardData.charts.revenue_trend.length > 0 ? (
            <div className="simple-bar-chart">
              {dashboardData.charts.revenue_trend.slice(-10).map((item, index) => {
                const maxRevenue = Math.max(...dashboardData.charts.revenue_trend.map(d => d.revenue));
                const height = maxRevenue > 0 ? Math.max((item.revenue / maxRevenue) * 100, 5) : 5;
                
                return (
                  <div key={index} className="bar-item">
                    <div 
                      className="bar" 
                      style={{ height: `${height}%` }}
                      title={`${formatDate(item.date)}: ${formatCurrency(item.revenue)}`}
                    ></div>
                    <span className="bar-label">{formatDate(item.date)}</span>
                    <span className="bar-value">৳{item.revenue}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-chart-data">No revenue data available for this period</div>
          )}
        </div>
      </div>

      {/* Order Type Distribution */}
      <div className="chart-card">
        <h3>🍽️ Order Type Distribution</h3>
        <div className="pie-chart-container">
          {dashboardData?.charts?.order_type_distribution && dashboardData.charts.order_type_distribution.length > 0 ? (
            <div className="pie-chart-legend">
              {dashboardData.charts.order_type_distribution.map((type, index) => {
                const colors = ['#4F46E5', '#059669', '#DC2626', '#7C2D12'];
                const total = dashboardData.charts.order_type_distribution.reduce((sum, item) => sum + item.count, 0);
                const percentage = total > 0 ? Math.round((type.count / total) * 100) : 0;
                
                return (
                  <div key={index} className="legend-item">
                    <span 
                      className="legend-color" 
                      style={{ backgroundColor: colors[index] || '#6B7280' }}
                    ></span>
                    <span>{type.type}: {type.count} orders ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-chart-data">Order type data not available</div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="data-card full-width">
        <h3>📊 Key Performance Indicators (KPIs)</h3>
        <div className="performance-stats">
          {dashboardData?.kpis && (
            <>
              <div className="stat-item">
                <span className="stat-label">Total Revenue:</span>
                <span className="stat-value">{formatCurrency(dashboardData.kpis.total_revenue)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Orders:</span>
                <span className="stat-value">{dashboardData.kpis.total_orders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Order Value:</span>
                <span className="stat-value">{formatCurrency(dashboardData.kpis.average_order_value)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Menu Items:</span>
                <span className="stat-value">{dashboardData.kpis.available_menu_items}/{dashboardData.kpis.total_menu_items}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Inventory Items:</span>
                <span className="stat-value">{dashboardData.kpis.total_inventory_items}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Stock Alerts:</span>
                <span className="stat-value critical">{dashboardData.kpis.low_stock_items} Low Stock</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Orders Tab Component
const OrdersTab = ({ ordersData, formatCurrency, formatDate, loading }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading orders data...</p>
      </div>
    );
  }

  if (!ordersData) {
    return (
      <div className="error-state">
        <p>Orders data not available</p>
      </div>
    );
  }

  return (
    <div className="orders-tab">
      <div className="section-grid">
        {/* Order Status Breakdown */}
        <div className="data-card">
          <h3>📊 Order Status Breakdown</h3>
          <div className="status-grid">
            {ordersData.status_breakdown && ordersData.status_breakdown.map((statusItem, index) => (
              <div key={index} className="status-item">
                <span className={`status-badge ${statusItem.status}`}>{statusItem.status}</span>
                <div className="status-details">
                  <span className="status-count">{statusItem.count} orders</span>
                  <span className="status-total">{formatCurrency(statusItem.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Type Breakdown */}
        <div className="data-card">
          <h3>🍽️ Order Type Analysis</h3>
          <div className="payment-methods">
            {ordersData.type_breakdown && ordersData.type_breakdown.map((typeItem, index) => (
              <div key={index} className="payment-item">
                <span className="payment-method">{typeItem.type}</span>
                <div className="payment-stats">
                  <span>{typeItem.count} orders</span>
                  <span>{formatCurrency(typeItem.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="data-card">
          <h3>⏰ Peak Hours</h3>
          <div className="category-list">
            {ordersData.peak_hours && ordersData.peak_hours.slice(0, 5).map((hour, index) => (
              <div key={index} className="category-item">
                <span className="category-name">{hour.hour}:00</span>
                <div className="category-stats">
                  <span>{hour.orders} orders</span>
                  <span>{formatCurrency(hour.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="data-card full-width">
          <h3>📋 Recent Orders</h3>
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
                {ordersData.orders && ordersData.orders.slice(0, 15).map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name || 'Walk-in'}</td>
                    <td>
                      <span className={`status-badge ${order.order_type}`}>
                        {order.order_type === 'dine-in' ? 'Dine-in' : 'Pickup'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.status}`}>{order.status}</span>
                    </td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{order.order_items?.length || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Trend Chart */}
        {ordersData.daily_trend && ordersData.daily_trend.length > 0 && (
          <div className="data-card full-width">
            <h3>📈 Daily Order Trend</h3>
            <div className="trend-chart">
              {ordersData.daily_trend.slice(-14).map((day, index) => {
                const maxOrders = Math.max(...ordersData.daily_trend.map(d => d.orders));
                const height = maxOrders > 0 ? Math.max((day.orders / maxOrders) * 100, 5) : 5;
                
                return (
                  <div key={index} className="trend-item">
                    <div className="trend-bar">
                      <div 
                        className="trend-fill" 
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <div className="trend-label">{formatDate(day.date)}</div>
                    <div className="trend-value">{day.orders} orders</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Menu Tab Component
const MenuTab = ({ menuData, formatCurrency, loading }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading menu data...</p>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="error-state">
        <p>Menu data not available</p>
      </div>
    );
  }

  return (
    <div className="menu-tab">
      <div className="section-grid">
        {/* Category Breakdown */}
        <div className="data-card">
          <h3>🍽️ Menu Categories</h3>
          <div className="category-list">
            {menuData.category_breakdown && menuData.category_breakdown.map((categoryItem, index) => (
              <div key={index} className="category-item">
                <span className="category-name">{categoryItem.category}</span>
                <div className="category-stats">
                  <span>{categoryItem.count} items</span>
                  <span>Avg: {formatCurrency(categoryItem.avg_price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Performance */}
        <div className="data-card">
          <h3>📈 Menu Performance</h3>
          <div className="performance-stats">
            {menuData.summary && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Total Items:</span>
                  <span className="stat-value">{menuData.summary.total_items}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Available:</span>
                  <span className="stat-value">{menuData.summary.available_items}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Categories:</span>
                  <span className="stat-value">{menuData.summary.categories}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Price:</span>
                  <span className="stat-value">{formatCurrency(menuData.summary.avg_price)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="data-card full-width">
          <h3>🏆 Popular Menu Items</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity Sold</th>
                  <th>Total Revenue</th>
                  <th>Order Count</th>
                </tr>
              </thead>
              <tbody>
                {menuData.popular_items && menuData.popular_items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.total_sold}</td>
                    <td>{formatCurrency(item.total_revenue)}</td>
                    <td>{item.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Tab Component
const InventoryTab = ({ inventoryData, formatCurrency, loading }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading inventory data...</p>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="error-state">
        <p>Inventory data not available</p>
      </div>
    );
  }

  return (
    <div className="inventory-tab">
      <div className="section-grid">
        {/* Stock Status */}
        <div className="data-card">
          <h3>📦 Stock Status Overview</h3>
          <div className="stock-status">
            <div className="status-item critical">
              <span className="stat-label">Critical Stock:</span>
              <span className="stat-value">{inventoryData.alerts?.critical_stock?.length || 0}</span>
            </div>
            <div className="status-item low">
              <span className="stat-label">Low Stock:</span>
              <span className="stat-value">{inventoryData.alerts?.low_stock?.length || 0}</span>
            </div>
            <div className="status-item adequate">
              <span className="stat-label">Total Items:</span>
              <span className="stat-value">{inventoryData.summary?.total_items || 0}</span>
            </div>
          </div>
          <div className="inventory-value">
            <strong>Total Value: {formatCurrency(inventoryData.summary?.total_value || 0)}</strong>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="data-card">
          <h3>📊 Inventory by Category</h3>
          <div className="category-breakdown">
            {inventoryData.category_breakdown && inventoryData.category_breakdown.map((categoryItem, index) => (
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
          <h3>⚠️ Items Requiring Attention</h3>
          <div className="alert-sections">
            {/* Critical Stock */}
            {inventoryData.alerts?.critical_stock && inventoryData.alerts.critical_stock.length > 0 && (
              <div className="alert-section critical">
                <h4>🚨 Critical Stock</h4>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Current Stock</th>
                        <th>Category</th>
                        <th>Unit Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.alerts.critical_stock.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td className="critical-quantity">{item.quantity} {item.unit}</td>
                          <td>{item.category}</td>
                          <td>{formatCurrency(item.cost_per_unit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Low Stock */}
            {inventoryData.alerts?.low_stock && inventoryData.alerts.low_stock.length > 0 && (
              <div className="alert-section low">
                <h4>⚠️ Low Stock</h4>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Current Stock</th>
                        <th>Category</th>
                        <th>Unit Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.alerts.low_stock.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td className="low-quantity">{item.quantity} {item.unit}</td>
                          <td>{item.category}</td>
                          <td>{formatCurrency(item.cost_per_unit)}</td>
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
};

export default Analytics;