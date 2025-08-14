import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Phone, Clock } from 'lucide-react';

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/public' },
    { name: 'Menu', href: '/public/menu' },
    { name: 'About', href: '/public/about' },
    { name: 'Contact', href: '/public/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[#C92E33] to-[#E6353B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>+880 1234-567890</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Open: 10:00 AM - 11:00 PM</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                                  className="modern-button-secondary group"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Login</span>
                  <span className="text-slate-400">/</span>
                  <span>Signup</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/public" className="flex items-center space-x-3">
            <img 
              src="/src/assets/images/Smart Dine.svg" 
              alt="Smart Dine" 
              className="w-10 h-10"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div 
              className="w-10 h-10 bg-gradient-to-br from-[#C92E33] to-[#E6353B] rounded-lg flex items-center justify-center"
              style={{ display: 'none' }}
            >
              <span className="text-white font-bold text-lg">SD</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Dine</h1>
              <p className="text-sm text-gray-600">Authentic Flavors</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-[#C92E33]'
                    : 'text-gray-700 hover:text-[#C92E33]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-700 hover:text-[#C92E33] transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-[#C92E33] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>

            <Link
              to="/login"
                                className="modern-button-primary group"
            >
              <span className="relative z-10 flex items-center space-x-2 font-inter">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Order Online</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C92E33] to-[#E6353B] rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-[#C92E33] transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-[#C92E33]'
                    : 'text-gray-700 hover:text-[#C92E33]'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center py-4 px-8 bg-gradient-to-r from-[#C92E33] via-[#E6353B] to-[#C92E33] text-white font-bold tracking-wide rounded-2xl shadow-lg shadow-red-500/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2 font-inter">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Order Online</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
