import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DollarSign, ShoppingCart, Trash2, Users, AlertTriangle, Star, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StatCard } from '../common/StatCard';
import { ChartCard } from '../common/ChartCard';

export function AdminDashboard() {
	const { 
		orders, 
		analytics, 
		inventory, 
		calculateLiveWasteAnalytics,
		calculateLiveStockAnalytics 
	} = useApp();

	const [liveData, setLiveData] = useState(null);
	const [lastUpdate, setLastUpdate] = useState(new Date());

	// Update live data every 60 seconds for admin dashboard
	useEffect(() => {
		const updateLiveData = () => {
			const wasteAnalytics = calculateLiveWasteAnalytics();
			const stockAnalytics = calculateLiveStockAnalytics();
			setLiveData({ waste: wasteAnalytics, stock: stockAnalytics });
			setLastUpdate(new Date());
		};

		updateLiveData();
		const interval = setInterval(updateLiveData, 60000); // Update every minute for admin

		return () => clearInterval(interval);
	}, [calculateLiveWasteAnalytics, calculateLiveStockAnalytics]);

	const todayOrders = orders.filter(order => 
		new Date(order.createdAt).toDateString() === new Date().toDateString()
	).length;

	const lowStockItems = inventory.filter(item => item.quantity <= item.threshold);

	return (
		<div className="p-6 space-y-8 bg-gray-50 min-h-screen font-inter">
			{/* Header Section */}
			<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Smart Dine Dashboard</h1>
					<p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your restaurant today.</p>
				</div>
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-2">
						<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
						<span className="text-sm font-medium text-gray-700">Status: Healthy</span>
					</div>
					<div className="text-sm text-gray-500">
						{new Date().toLocaleDateString('en-US', { 
							weekday: 'long', 
							year: 'numeric', 
							month: 'long', 
							day: 'numeric' 
						})}
					</div>
					{liveData && (
						<div className="flex items-center space-x-2 text-xs text-gray-400">
							<RefreshCw className="w-3 h-3" />
							<span>Updated {formatDistanceToNow(lastUpdate)} ago</span>
						</div>
					)}
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					icon={DollarSign}
					title="Total Revenue"
					value={`৳${analytics.totalSales.toLocaleString()}`}
					accentColor="bg-green-500"
					subtext="This month"
					percentageChange="+12.5%"
					changeType="positive"
				/>
				<StatCard
					icon={ShoppingCart}
					title="Today's Orders"
					value={todayOrders.toString()}
					accentColor="bg-blue-500"
					subtext="Today"
					percentageChange="+8.2%"
					changeType="positive"
				/>
				<StatCard
					icon={Trash2}
					title="Food Waste"
					value={liveData ? `৳${liveData.waste.todayWaste.toFixed(2)}` : `৳${analytics.totalWaste.toLocaleString()}`}
					accentColor="bg-purple-500"
					subtext="This week"
					percentageChange="-5.1%"
					changeType="positive"
				/>
				<StatCard
					icon={Users}
					title="Avg Order Value"
					value={`৳${analytics.avgOrderValue.toFixed(2)}`}
					accentColor="bg-orange-500"
					subtext="Per order"
					percentageChange="+3.7%"
					changeType="positive"
				/>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
				<ChartCard
					title="Daily Revenue & Profit Trends"
					chartType="line"
					chartData={[
						{ name: 'Jan', revenue: 45000, profit: 18000, orders: 230 },
						{ name: 'Feb', revenue: 52000, profit: 21000, orders: 280 },
						{ name: 'Mar', revenue: 48000, profit: 19200, orders: 265 },
						{ name: 'Apr', revenue: 61000, profit: 25500, orders: 315 },
						{ name: 'May', revenue: 58000, profit: 23800, orders: 298 },
						{ name: 'Jun', revenue: 67000, profit: 28200, orders: 345 },
						{ name: 'Jul', revenue: 72000, profit: 31000, orders: 380 },
						{ name: 'Aug', revenue: 69000, profit: 29500, orders: 365 },
						{ name: 'Sep', revenue: 74000, profit: 32800, orders: 390 },
						{ name: 'Oct', revenue: 78000, profit: 35100, orders: 405 },
						{ name: 'Nov', revenue: 82000, profit: 37500, orders: 425 },
						{ name: 'Dec', revenue: 89000, profit: 41200, orders: 465 },
					]}
					height={350}
				/>
				<ChartCard
					title="Sales Distribution by Category"
					chartType="pie"
					chartData={[
						{ name: 'Main Courses', value: 42, revenue: 125000 },
						{ name: 'Appetizers', value: 22, revenue: 65000 },
						{ name: 'Beverages', value: 18, revenue: 54000 },
						{ name: 'Desserts', value: 12, revenue: 36000 },
						{ name: 'Special Items', value: 6, revenue: 18000 },
					]}
					height={350}
				/>
			</div>

			{/* Additional Analytics Charts */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
				<ChartCard
					title="Weekly Order Volume"
					chartType="area"
					chartData={[
						{ name: 'Week 1', orders: 145, avgValue: 850 },
						{ name: 'Week 2', orders: 182, avgValue: 920 },
						{ name: 'Week 3', orders: 168, avgValue: 875 },
						{ name: 'Week 4', orders: 203, avgValue: 1050 },
						{ name: 'Week 5', orders: 195, avgValue: 980 },
						{ name: 'Week 6', orders: 221, avgValue: 1120 },
						{ name: 'Week 7', orders: 238, avgValue: 1200 },
						{ name: 'Week 8', orders: 215, avgValue: 1080 },
					]}
					height={350}
				/>
				<ChartCard
					title="Customer Satisfaction Trends"
					chartType="line"
					chartData={[
						{ name: 'Jan', satisfaction: 4.2, reviews: 85 },
						{ name: 'Feb', satisfaction: 4.3, reviews: 92 },
						{ name: 'Mar', satisfaction: 4.1, reviews: 78 },
						{ name: 'Apr', satisfaction: 4.5, reviews: 105 },
						{ name: 'May', satisfaction: 4.4, reviews: 98 },
						{ name: 'Jun', satisfaction: 4.6, reviews: 112 },
						{ name: 'Jul', satisfaction: 4.7, reviews: 128 },
						{ name: 'Aug', satisfaction: 4.5, reviews: 115 },
						{ name: 'Sep', satisfaction: 4.8, reviews: 135 },
						{ name: 'Oct', satisfaction: 4.6, reviews: 122 },
						{ name: 'Nov', satisfaction: 4.7, reviews: 140 },
						{ name: 'Dec', satisfaction: 4.9, reviews: 158 },
					]}
					height={350}
				/>
			</div>

			{/* Business Insights */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Top Wasted Items */}
				<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
								<Trash2 className="w-5 h-5 text-red-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Top Wasted Items</h3>
								<p className="text-sm text-gray-500">Items with highest waste cost</p>
							</div>
						</div>
						<div className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full">
							৳{liveData ? liveData.waste.todayWaste.toFixed(0) : analytics.totalWaste.toFixed(0)} lost
						</div>
					</div>
					<div className="space-y-3">
						{(liveData ? liveData.waste.topWastedItems : analytics.topWastedItems).map((item, index) => (
							<div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
								<div className="flex items-center space-x-3">
									<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
										{index + 1}
									</div>
									<div>
										<p className="font-medium text-gray-900">{item.item}</p>
										<div className="flex items-center space-x-2 text-sm text-gray-500">
											<span>{item.quantity} {liveData ? 'units' : item.unit || 'units'}</span>
											{liveData && item.occurrences && (
												<span>• {item.occurrences} incidents</span>
											)}
										</div>
										{liveData && item.primaryReason && (
											<p className="text-xs text-orange-600 mt-1">
												<span className="font-medium">Reason:</span> {item.primaryReason}
											</p>
										)}
									</div>
								</div>
								<div className="text-right">
									<p className="font-semibold text-red-600">৳{item.cost.toFixed(2)}</p>
									{liveData && item.costImpactScore && (
										<p className="text-xs text-gray-500">Impact: {item.costImpactScore.toFixed(0)}</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Low Stock Alert */}
				<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
								<AlertTriangle className="w-5 h-5 text-yellow-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
								<p className="text-sm text-gray-500">Items requiring attention</p>
							</div>
						</div>
						{liveData && (
							<div className="flex items-center space-x-2">
								<span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
									{liveData.stock.stockAlerts.critical} Critical
								</span>
								<span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
									{liveData.stock.stockAlerts.total} Total
								</span>
							</div>
						)}
					</div>
					{(liveData ? liveData.stock.lowStockItems : lowStockItems).length > 0 ? (
						<div className="space-y-3">
							{(liveData ? liveData.stock.lowStockItems : lowStockItems).map((item, index) => (
								<div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
									<div className="flex items-center space-x-3">
										<AlertTriangle className="w-5 h-5 text-yellow-500" />
										<div>
											<p className="font-medium text-gray-900">{item.name}</p>
											<div className="flex items-center space-x-2 text-sm text-gray-500">
												<span>{item.quantity} {item.unit} remaining</span>
												{liveData && item.estimatedDaysLeft !== undefined && (
													<span>• ≈{item.estimatedDaysLeft} days left</span>
												)}
											</div>
										</div>
									</div>
									<div className="text-right">
										<span className={`px-2 py-1 text-xs rounded-full font-medium ${
											liveData && item.priority === 'critical' 
												? 'bg-red-100 text-red-800' 
												: 'bg-yellow-100 text-yellow-800'
										}`}>
											{liveData && item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Low Stock'}
										</span>
										{liveData && item.totalValue && (
											<p className="text-xs text-gray-500 mt-1">৳{item.totalValue.toFixed(2)} value</p>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Star className="w-8 h-8 text-green-600" />
							</div>
							<h4 className="font-medium text-gray-900 mb-2">All Stock Levels Healthy</h4>
							<p className="text-gray-500">All items are well stocked!</p>
							{liveData && (
								<p className="text-sm text-gray-400 mt-1">
									Average stock level: {liveData.stock.averageStockLevel.toFixed(1)}%
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
