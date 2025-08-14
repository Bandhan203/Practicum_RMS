import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { RestaurantLogo } from '../common/RestaurantLogo';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <RestaurantLogo fillColor="#C92E33" className="w-8 h-8" />
            <span className="text-xl font-bold text-brand-dark">Smart Dine</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-brand-dark transition-colors">Home</a>
            <a href="#features" className="text-gray-700 hover:text-brand-dark transition-colors">Features</a>
            <a href="#about" className="text-gray-700 hover:text-brand-dark transition-colors">About</a>
            <a href="#contact" className="text-gray-700 hover:text-brand-dark transition-colors">Contact</a>
            <div className="flex items-center space-x-3">
              <Link 
                to="/login" 
                className="text-brand-dark hover:text-brand-light transition-colors font-medium"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-brand-dark text-white px-6 py-2 rounded-lg hover:bg-brand-light transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-brand-dark transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-brand-dark">Home</a>
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-brand-dark">Features</a>
              <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-brand-dark">About</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-brand-dark">Contact</a>
              <div className="flex space-x-3 mx-3 mt-4">
                <Link 
                  to="/login" 
                  className="flex-1 text-center border border-brand-dark text-brand-dark px-4 py-2 rounded-lg hover:bg-brand-dark hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="flex-1 text-center bg-brand-dark text-white px-4 py-2 rounded-lg hover:bg-brand-light transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
