import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Star, Clock, Gift, ShoppingCart, Calendar, TrendingUp, Award, Heart } from 'lucide-react';

export function CustomerDashboard() {
	const { user } = useAuth();
	const { orders, cart } = useApp();

	const customerOrders = orders.filter(order => order.customerId === user?.id);
	const recentOrders = customerOrders.slice(0, 3);
	const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
	const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);

	const loyaltyProgress = ((user?.points || 0) % 100) / 100 * 100;
	const nextRewardPoints = 100 - ((user?.points || 0) % 100);

	const stats = [
		{
			title: 'Total Orders',
			value: customerOrders.length.toString(),
			icon: ShoppingCart,
			color: 'bg-brand-dark'
		},
		{
			title: 'Total Spent',
			   value: `৳ ${totalSpent.toFixed(2)}`,
			icon: TrendingUp,
			color: 'bg-brand-light'
		},
		{
			title: 'Loyalty Points',
			value: (user?.points || 0).toString(),
			icon: Star,
			color: 'bg-brand-light'
		},
		{
			title: 'Cart Items',
			value: cartTotal.toString(),
			icon: Gift,
			color: 'bg-brand-dark'
		}
	];

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
					<p className="text-gray-600">Ready to enjoy some delicious food?</p>
				</div>
				<div className="text-sm text-gray-500">
					{new Date().toLocaleDateString('en-US', { 
						weekday: 'long', 
						year: 'numeric', 
						month: 'long', 
						day: 'numeric' 
					})}
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex flex-col h-full">
							<div className="flex items-center justify-between flex-1">
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
									<p className="text-2xl font-semibold text-gray-900 truncate">{stat.value}</p>
								</div>
								<div className={`${stat.color} p-3 rounded-full flex-shrink-0 ml-4`}>
									<Icon className="w-6 h-6 text-white" />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Loyalty Progress */}
			<div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="text-lg font-semibold">Loyalty Rewards</h3>
						<p className="text-purple-100">You're {nextRewardPoints} points away from your next reward!</p>
					</div>
					<Award className="w-8 h-8 text-white" />
				</div>
				<div className="w-full bg-purple-400 rounded-full h-3">
					<div 
						className="bg-white h-3 rounded-full transition-all duration-500"
						style={{ width: `${loyaltyProgress}%` }}
					></div>
				</div>
				<div className="mt-2 text-sm text-purple-100">
					{user?.points || 0} / {Math.ceil((user?.points || 0) / 100) * 100} points
				</div>
			</div>

			{/* Recent Orders */}
			<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
				{recentOrders.length > 0 ? (
					<div className="space-y-4">
						{recentOrders.map((order) => (
							<div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className={`w-3 h-3 rounded-full ${
										order.status === 'served' ? 'bg-brand-light' :
										order.status === 'ready' ? 'bg-brand-dark' :
										order.status === 'preparing' ? 'bg-yellow-500' :
										'bg-gray-500'
									}`}></div>
									<div>
										<p className="font-medium text-gray-900">Order #{order.id}</p>
										<p className="text-sm text-gray-500">
											{order.items.map(item => item.menuItemName).join(', ')}
										</p>
									</div>
								</div>
								<div className="text-right">
									   <p className="font-semibold text-gray-900">৳ {order.totalAmount.toFixed(2)}</p>
									<p className="text-sm text-gray-500 capitalize">{order.status}</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-gray-500">
						<ShoppingCart className="w-12 h-12 mx-auto mb-2" />
						<p>No orders yet. Ready to place your first order?</p>
					</div>
				)}
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
					<div className="flex items-center justify-between flex-1">
						<div className="flex-1 min-w-0">
							<h4 className="font-semibold text-gray-900 mb-1 truncate">Browse Menu</h4>
							<p className="text-sm text-gray-500 truncate">Discover new dishes</p>
						</div>
						<Heart className="w-8 h-8 text-red-500 flex-shrink-0 ml-4" />
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
					<div className="flex items-center justify-between flex-1">
						<div className="flex-1 min-w-0">
							<h4 className="font-semibold text-gray-900 mb-1 truncate">Make Reservation</h4>
							<p className="text-sm text-gray-500 truncate">Book a table</p>
						</div>
						<Calendar className="w-8 h-8 text-blue-500 flex-shrink-0 ml-4" />
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
					<div className="flex items-center justify-between flex-1">
						<div className="flex-1 min-w-0">
							<h4 className="font-semibold text-gray-900 mb-1 truncate">Track Orders</h4>
							<p className="text-sm text-gray-500 truncate">Real-time updates</p>
						</div>
						<Clock className="w-8 h-8 text-green-500 flex-shrink-0 ml-4" />
					</div>
				</div>
			</div>
		</div>
	);
}
