import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DollarSign, ShoppingCart, Trash2, Users, TrendingUp, TrendingDown, AlertTriangle, Star, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

export function AdminDashboard() {
	const { 
		orders, 
		analytics, 
		inventory, 
		wasteLogs, 
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

	const todayWaste = wasteLogs.filter(log => 
		new Date(log.date).toDateString() === new Date().toDateString()
	).reduce((sum, log) => sum + log.cost, 0);

	const lowStockItems = inventory.filter(item => item.quantity <= item.threshold);

	const stats = [
		{
			title: 'Total Sales',
			value: `$${analytics.totalSales.toLocaleString()}`,
			icon: DollarSign,
			color: 'bg-green-500',
			change: '+12%',
			trend: 'up'
		},
		{
			title: "Today's Orders",
			value: todayOrders.toString(),
			icon: ShoppingCart,
			color: 'bg-blue-500',
			change: '+8%',
			trend: 'up'
		},
		{
			title: 'Food Waste',
			value: liveData ? `$${liveData.waste.todayWaste.toFixed(2)}` : `$${analytics.totalWaste.toLocaleString()}`,
			icon: Trash2,
			color: 'bg-red-500',
			change: '-5%',
			trend: 'down'
		},
		{
			title: 'Avg Order Value',
			value: `$${analytics.avgOrderValue.toFixed(2)}`,
			icon: Users,
			color: 'bg-purple-500',
			change: '+3%',
			trend: 'up'
		}
	];

	return (
		<div className="p-6 space-y-6">
		<div className="flex justify-between items-center">
			<h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
			<div className="flex items-center space-x-4">
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
		</div>			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">{stat.title}</p>
									<p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
								</div>
								<div className={`${stat.color} p-3 rounded-full`}>
									<Icon className="w-6 h-6 text-white" />
								</div>
							</div>
							<div className="mt-4 flex items-center">
								{stat.trend === 'up' ? (
									<TrendingUp className="w-4 h-4 text-green-500 mr-1" />
								) : (
									<TrendingDown className="w-4 h-4 text-red-500 mr-1" />
								)}
								<span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
									{stat.change}
								</span>
								<span className="text-sm text-gray-500 ml-2">vs last month</span>
							</div>
						</div>
					);
				})}
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={analytics.salesTrend}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis />
							<Tooltip />
							<Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2} />
						</LineChart>
					</ResponsiveContainer>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Food Waste Trend</h3>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={analytics.wasteTrend}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis />
							<Tooltip />
							<Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Additional Info */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Top Wasted Items</h3>
				<div className="space-y-3">
					{(liveData ? liveData.waste.topWastedItems : analytics.topWastedItems).map((item, index) => (
						<div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
							<div>
								<p className="font-medium text-gray-900">{item.item}</p>
								<p className="text-sm text-gray-500">
									{item.quantity} {liveData ? 'units' : item.unit || 'units'}
									{liveData && item.occurrences && (
										<span className="ml-2 text-xs text-gray-400">• {item.occurrences} incidents</span>
									)}
								</p>
								{liveData && item.primaryReason && (
									<p className="text-xs text-orange-600">Main cause: {item.primaryReason}</p>
								)}
							</div>
							<div className="text-right">
								<p className="font-semibold text-red-600">${item.cost.toFixed(2)}</p>
								{liveData && item.costImpactScore && (
									<p className="text-xs text-gray-500">Impact: {item.costImpactScore.toFixed(0)}</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
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
							<div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
								<div className="flex items-center">
									<AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
									<div>
										<p className="font-medium text-gray-900">{item.name}</p>
										<p className="text-sm text-gray-500">
											{item.quantity} {item.unit} remaining
											{liveData && item.estimatedDaysLeft !== undefined && (
												<span className="ml-2 text-xs text-orange-600">• ≈{item.estimatedDaysLeft} days left</span>
											)}
										</p>
									</div>
								</div>
								<div className="text-right">
									<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
										{liveData && item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Low Stock'}
									</span>
									{liveData && item.totalValue && (
										<p className="text-xs text-gray-500 mt-1">${item.totalValue.toFixed(2)} value</p>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-gray-500">
						<Star className="w-12 h-12 mx-auto mb-2" />
						<p>All items are well stocked!</p>
						{liveData && (
							<p className="text-sm">Average stock level: {liveData.stock.averageStockLevel.toFixed(1)}%</p>
						)}
					</div>
				)}
			</div>
			</div>
		</div>
	);
}
