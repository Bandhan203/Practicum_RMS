import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { 
  User, 
  ShoppingCart, 
  LogOut, 
  Settings, 
  Bell,
  ChefHat,
  Shield,
  Users,
  Crown,
  Menu
} from 'lucide-react';
import { RestaurantLogo } from '../common/RestaurantLogo';

export function Header({ toggleSidebar }) {
  const { user, logout, switchRole } = useAuth();
  const { cart } = useApp();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'chef': return <ChefHat className="w-4 h-4" />;
      case 'waiter': return <Users className="w-4 h-4" />;
      case 'customer': return <Crown className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden mr-2"
            >
              <Menu className="w-6 h-6" />
            </button>

            <RestaurantLogo className="w-8 h-8 mr-3" fillColor="#6B0000" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Restaurant Pro</h1>
            <h1 className="text-lg font-bold text-gray-900 sm:hidden">RMS</h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Role Switcher (Demo) - Hidden on small screens */}
            <div className="hidden lg:flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Role:</label>
              <select
                value={user.role}
                onChange={(e) => switchRole(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="customer">Customer</option>
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Cart (Customer only) */}
            {user.role === 'customer' && (
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                {getRoleIcon(user.role)}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              
              {/* Mobile User Avatar */}
              <div className="sm:hidden w-8 h-8 bg-[#6B0000] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
