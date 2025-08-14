import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { 
  ShoppingCart, 
  LogOut,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { RestaurantLogo } from '../common/RestaurantLogo';

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const { cart } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path) => {
    if (path === '/customer') {
      return location.pathname === '/customer';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Restaurant Name */}
            <Link to="/customer" className="flex items-center space-x-3">
              <RestaurantLogo className="w-8 h-8" fillColor="#C92E33" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Smart Dine</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Delicious Food Awaits</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/customer/menu" 
                className={`transition-colors font-medium ${
                  isActive('/customer/menu') 
                    ? 'text-brand-dark' 
                    : 'text-gray-700 hover:text-brand-dark'
                }`}
              >
                Menu
              </Link>
              <Link 
                to="/customer/orders" 
                className={`transition-colors font-medium ${
                  isActive('/customer/orders') 
                    ? 'text-brand-dark' 
                    : 'text-gray-700 hover:text-brand-dark'
                }`}
              >
                My Orders
              </Link>
              <Link 
                to="/customer/reservations" 
                className={`transition-colors font-medium ${
                  isActive('/customer/reservations') 
                    ? 'text-brand-dark' 
                    : 'text-gray-700 hover:text-brand-dark'
                }`}
              >
                Reservations
              </Link>
              <Link 
                to="/customer/loyalty" 
                className={`transition-colors font-medium ${
                  isActive('/customer/loyalty') 
                    ? 'text-brand-dark' 
                    : 'text-gray-700 hover:text-brand-dark'
                }`}
              >
                Rewards
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-brand-dark transition-colors rounded-lg hover:bg-gray-100">
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || 'G'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name || 'Guest'}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-brand-dark transition-colors rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              <Link 
                to="/customer/menu" 
                className={`block transition-colors font-medium py-2 ${
                  isActive('/customer/menu') 
                    ? 'text-brand-dark' 
                    : 'text-gray-700 hover:text-brand-dark'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link 
                to="/customer/orders" 
                className={`block transition-colors font-medium py-2 ${
                  isActive('/customer/orders') 
                    ? 'text-brand-dark' 
                    : 'text-gray-700 hover:text-brand-dark'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
              <Link 
                to="/customer/reservations" 
                className={`block transition-colors font-medium py-2 ${
                  isActive('/customer/reservations') 
                    ? 'text-brand-dark' 
                    : 'text-gray-700 hover:text-brand-dark'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Reservations
              </Link>
              <Link 
                to="/customer/loyalty" 
                className={`block transition-colors font-medium py-2 ${
                  isActive('/customer/loyalty') 
                    ? 'text-brand-dark' 
                    : 'text-gray-700 hover:text-brand-dark'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Rewards
              </Link>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0) || 'G'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name || 'Guest'}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Customer Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <RestaurantLogo className="w-8 h-8" fillColor="#C92E33" />
                <h3 className="text-lg font-bold text-gray-900">Smart Dine</h3>
              </div>
              <p className="text-gray-600 text-sm max-w-md">
                Experience the finest dining with our carefully crafted menu and exceptional service. 
                Order online for pickup or delivery.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/customer/menu" className="hover:text-brand-dark transition-colors">Menu</Link></li>
                <li><Link to="/customer/orders" className="hover:text-brand-dark transition-colors">My Orders</Link></li>
                <li><Link to="/customer/reservations" className="hover:text-brand-dark transition-colors">Reservations</Link></li>
                <li><Link to="/customer/loyalty" className="hover:text-brand-dark transition-colors">Loyalty Program</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>123 Main Street</li>
                <li>Dhaka, Bangladesh</li>
                <li>+880-1234-567890</li>
                <li>info@smartdine.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
            <p>&copy; 2025 Smart Dine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
