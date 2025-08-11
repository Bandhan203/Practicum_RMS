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
  Crown
} from 'lucide-react';

export function Header() {
  const { user, logout, switchRole } = useAuth();
  const { cart } = useApp();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getRoleIcon = (role: string) => {
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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <ChefHat className="w-8 h-8 text-orange-500 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Restaurant Pro</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Role Switcher (Demo) */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Role:</label>
              <select
                value={user.role}
                onChange={(e) => switchRole(e.target.value as any)}
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
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="w-6 h-6" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getRoleIcon(user.role)}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}