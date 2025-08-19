import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  User, 
  ShoppingCart, 
  Settings, 
  Bell,
  Shield,
  Menu
} from 'lucide-react';
import { RestaurantLogo } from '../common/RestaurantLogo';

export function Header({ toggleSidebar }) {
  const { cart } = useApp();

  const cartItemCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className="bg-white shadow-md border-b border-gray-100 fixed top-0 left-0 right-0 z-30 backdrop-blur-sm">
      <div className="flex items-center h-16">
        <div className="flex justify-between items-center w-full">
          {/* Left side - Logo area matching sidebar width */}
          <div className="flex items-center w-64 px-4 border-r border-gray-100">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:text-brand-light hover:bg-gray-50 md:hidden transition-colors mr-2"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo and Brand Name */}
            <div className="flex items-center space-x-3">
              <RestaurantLogo className="w-8 h-8" fillColor="#C92E33" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Smart Dine</h1>
                <h1 className="text-lg font-bold text-gray-900 sm:hidden">Smart Dine</h1>
              </div>
            </div>
          </div>

          {/* Right side - Search and user actions */}
          <div className="flex-1 flex justify-between items-center px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* User actions area */}
            <div className="flex items-center space-x-3">
              {/* Role Switcher */}
              <div className="hidden lg:flex items-center space-x-2">
                <select
                  value={user.role}
                  onChange={(e) => switchRole(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
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
                  <button className="p-2 text-gray-500 hover:text-brand-light transition-colors rounded-xl hover:bg-gray-50">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand-light text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-brand-light transition-colors rounded-xl hover:bg-gray-50">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-xs rounded-full w-2 h-2"></span>
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                
                {/* Mobile User Avatar */}
                <div className="sm:hidden w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center">
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
      </div>
    </header>
  );
}
