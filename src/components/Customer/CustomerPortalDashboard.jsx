import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { 
  ShoppingCart, 
  Star, 
  Clock, 
  Award,
  TrendingUp,
  Heart,
  Calendar,
  Gift
} from 'lucide-react';

export function CustomerPortalDashboard() {
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
      color: 'bg-blue-500'
    },
    {
      title: 'Total Spent',
      value: `৳ ${totalSpent.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Loyalty Points',
      value: (user?.points || 0).toString(),
      icon: Star,
      color: 'bg-yellow-500'
    },
    {
      title: 'Cart Items',
      value: cartTotal.toString(),
      icon: Gift,
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    {
      title: 'Browse Menu',
      description: 'Discover new dishes',
      icon: Heart,
      color: 'bg-red-500',
      href: '/customer/menu'
    },
    {
      title: 'Make Reservation',
      description: 'Book a table',
      icon: Calendar,
      color: 'bg-blue-500',
      href: '/customer/reservations'
    },
    {
      title: 'Track Orders',
      description: 'Real-time updates',
      icon: Clock,
      color: 'bg-green-500',
      href: '/customer/orders'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-dark to-brand-light rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Guest'}!</h1>
            <p className="text-brand-100">Ready to enjoy some delicious food?</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-brand-100">Today's Date</p>
            <p className="text-lg font-semibold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loyalty Progress */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Loyalty Rewards</h3>
            <p className="text-purple-100">You're {nextRewardPoints} points away from your next reward!</p>
          </div>
          <Award className="w-10 h-10 text-white" />
        </div>
        <div className="w-full bg-purple-400 rounded-full h-4 mb-2">
          <div 
            className="bg-white h-4 rounded-full transition-all duration-500"
            style={{ width: `${loyaltyProgress}%` }}
          ></div>
        </div>
        <div className="text-sm text-purple-100">
          {user?.points || 0} / {Math.ceil((user?.points || 0) / 100) * 100} points
        </div>
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      order.status === 'served' ? 'bg-green-500' :
                      order.status === 'ready' ? 'bg-blue-500' :
                      order.status === 'preparing' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} items • {order.items.map(item => item.menuItemName).slice(0, 2).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
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
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">No orders yet</p>
              <p>Ready to place your first order?</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <a
                  key={index}
                  href={action.href}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer"
                >
                  <div className={`${action.color} p-3 rounded-lg group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-brand-dark transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
