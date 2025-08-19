import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Package,
  Trash2,
  ChefHat,
  RefreshCw,
  Eye,
  Calendar,
  Activity
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function ChefDashboard() {
  const { 
    orders, 
    getLiveAnalytics, 
    calculateLiveWasteAnalytics, 
    calculateLiveStockAnalytics,
    wasteLogs,
    inventory 
  } = useApp();
  const { user } = useAuth();
  
  const [liveData, setLiveData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedWasteItem, setSelectedWasteItem] = useState(null);
  const [selectedStockItem, setSelectedStockItem] = useState(null);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const updateLiveData = () => {
      const wasteAnalytics = calculateLiveWasteAnalytics();
      const stockAnalytics = calculateLiveStockAnalytics();
      setLiveData({ waste: wasteAnalytics, stock: stockAnalytics });
      setLastUpdate(new Date());
    };

    updateLiveData();
    const interval = setInterval(updateLiveData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [calculateLiveWasteAnalytics, calculateLiveStockAnalytics]);

  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  );

  const activeOrders = orders.filter(order => 
    ['pending', 'preparing', 'ready'].includes(order.status)
  );

  if (!liveData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading kitchen analytics...</p>
        </div>
      </div>
    );
  }

  const renderStockAlertLevel = (item) => {
    const percentage = (item.quantity / item.threshold) * 100;
    if (percentage <= 20) return { color: 'bg-red-500', text: 'Critical', textColor: 'text-red-700' };
    if (percentage <= 50) return { color: 'bg-orange-500', text: 'Low', textColor: 'text-orange-700' };
    if (percentage <= 80) return { color: 'bg-yellow-500', text: 'Medium', textColor: 'text-yellow-700' };
    return { color: 'bg-green-500', text: 'Good', textColor: 'text-green-700' };
  };

  const getWasteTrendIcon = (cost) => {
    if (cost > 50) return { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-100' };
    if (cost > 20) return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' };
    return { icon: Activity, color: 'text-green-500', bg: 'bg-green-100' };
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Command Center</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {user?.name} • Last updated {formatDistanceToNow(lastUpdate)} ago
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4" />
          <span>Auto-refresh every 30s</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today&apos;s Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{todayOrders.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{activeOrders.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today&apos;s Waste</p>
              <p className="text-2xl font-semibold text-gray-900">৳ {liveData.waste.todayWaste.toFixed(2)}</p>
            </div>
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {liveData.waste.todayWasteCount} items logged
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">{liveData.stock.stockAlerts.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="mt-2 text-xs text-red-500">
            {liveData.stock.stockAlerts.critical} critical items
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Enhanced Low Stock Alert Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Live Stock Monitoring</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  {liveData.stock.stockAlerts.critical} Critical
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                  {liveData.stock.stockAlerts.high} High Priority
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {liveData.stock.lowStockItems.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveData.stock.lowStockItems.map((item, index) => {
                  const alertLevel = renderStockAlertLevel(item);
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedStockItem(item)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${alertLevel.color}`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} {item.unit} left • {item.category}
                          </p>
                          <p className="text-xs text-gray-400">
                            Updated {formatDistanceToNow(new Date(item.lastUpdated))} ago
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${alertLevel.textColor} ${alertLevel.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                          {alertLevel.text}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          ৳ {item.totalValue.toFixed(2)} value
                        </p>
                        <p className="text-xs text-orange-600 font-medium">
                          ≈{item.estimatedDaysLeft} days left
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>All ingredients are well stocked!</p>
                <p className="text-sm">Average stock level: {liveData.stock.averageStockLevel.toFixed(1)}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Top Wasted Items Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Waste Analysis & Optimization</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  ৳ {liveData.waste.weekWaste.toFixed(0)} This Week
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {liveData.waste.wasteFrequency.toFixed(1)}/day avg
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {liveData.waste.topWastedItems.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveData.waste.topWastedItems.map((item, index) => {
                  const trendInfo = getWasteTrendIcon(item.cost);
                  const TrendIcon = trendInfo.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedWasteItem(item)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${trendInfo.bg}`}>
                          <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.item}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity.toFixed(1)} units • {item.occurrences} times
                          </p>
                          <p className="text-xs text-gray-400">
                            Primary reason: {item.primaryReason}
                          </p>
                          <p className="text-xs text-gray-400">
                            Last waste: {formatDistanceToNow(item.lastWasteDate)} ago
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">৳ {item.cost.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Avg: {item.avgQuantityPerWaste.toFixed(1)} per incident
                        </p>
                        <p className="text-xs font-medium text-orange-600">
                          Impact Score: {item.costImpactScore.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trash2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No waste recorded recently!</p>
                <p className="text-sm">Excellent kitchen efficiency!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Item Modals */}
      {selectedStockItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stock Details: {selectedStockItem.name}</h3>
              <button 
                onClick={() => setSelectedStockItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="font-semibold">{selectedStockItem.quantity} {selectedStockItem.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Threshold</p>
                  <p className="font-semibold">{selectedStockItem.threshold} {selectedStockItem.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Level</p>
                  <p className="font-semibold">{selectedStockItem.stockPercentage.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Days Left</p>
                  <p className="font-semibold">{selectedStockItem.estimatedDaysLeft} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="font-semibold">৳ {selectedStockItem.totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold">{formatDistanceToNow(new Date(selectedStockItem.lastUpdated))} ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedWasteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Waste Analysis: {selectedWasteItem.item}</h3>
              <button 
                onClick={() => setSelectedWasteItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Wasted</p>
                  <p className="font-semibold">{selectedWasteItem.quantity.toFixed(1)} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="font-semibold text-red-600">৳ {selectedWasteItem.cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Waste Incidents</p>
                  <p className="font-semibold">{selectedWasteItem.occurrences}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg per Incident</p>
                  <p className="font-semibold">{selectedWasteItem.avgQuantityPerWaste.toFixed(1)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Waste Reasons</p>
                <div className="space-y-1">
                  {Object.entries(selectedWasteItem.reasons).map(([reason, count]) => (
                    <div key={reason} className="flex justify-between text-sm">
                      <span>{reason}</span>
                      <span className="font-medium">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Waste Date</p>
                <p className="font-semibold">{format(selectedWasteItem.lastWasteDate, 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
