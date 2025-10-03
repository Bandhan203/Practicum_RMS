import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ShoppingCart, BarChart3, Settings, Receipt, Package } from 'lucide-react';
import { RestaurantLogo } from '../components/common/RestaurantLogo';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <RestaurantLogo className="h-10 w-10 mr-3" fillColor="#E6353B" />
              <h1 className="text-2xl font-bold text-gray-900">Smart Dine POS</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="bg-brand-light text-white px-4 py-2 rounded-md hover:bg-brand-dark transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-white text-brand-light px-4 py-2 rounded-md border border-brand-light hover:bg-red-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Point of Sale System
            <span className="block text-brand-light">Made Simple</span>
          </h2>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            Streamline your restaurant operations with our modern POS system. 
            From order processing to payment handling, we've got everything covered.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link 
              to="/login" 
              className="bg-brand-light text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-dark transition-colors"
            >
              Get Started
            </Link>
            <Link 
              to="/signup" 
              className="bg-white text-brand-light px-8 py-3 rounded-lg text-lg font-medium border border-brand-light hover:bg-red-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for Your POS System
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <CreditCard className="h-12 w-12 text-brand-light mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Billing & Payment</h4>
              <p className="text-gray-600">
                Process payments quickly with multiple payment methods and generate professional bills instantly.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <ShoppingCart className="h-12 w-12 text-brand-light mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Order Management</h4>
              <p className="text-gray-600">
                Manage orders efficiently from kitchen to table with real-time status tracking and updates.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <Receipt className="h-12 w-12 text-brand-light mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Menu Management</h4>
              <p className="text-gray-600">
                Create and manage your menu items, categories, pricing, and availability with ease.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <BarChart3 className="h-12 w-12 text-brand-light mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h4>
              <p className="text-gray-600">
                Get detailed insights into sales, revenue, and business performance with comprehensive analytics.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <Package className="h-12 w-12 text-brand-light mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Inventory Control</h4>
              <p className="text-gray-600">
                Track inventory levels, manage stock alerts, and handle supplier relationships efficiently.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <Settings className="h-12 w-12 text-brand-light mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h4>
              <p className="text-gray-600">
                Customize your POS system with flexible settings for taxes, discounts, and business rules.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section
        <div className="mt-20 bg-gradient-to-r from-brand-light to-brand-dark rounded-2xl p-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Restaurant?
          </h3>
          <p className="text-red-100 text-lg mb-6">
            Join thousands of restaurants already using Smart Dine POS to streamline their operations.
          </p>
          <Link 
            to="/signup" 
            className="bg-white text-brand-dark px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div> */}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <RestaurantLogo className="h-8 w-8 mr-2" fillColor="#E6353B" />
            <span className="text-xl font-bold">Smart Dine POS</span>
          </div>
          <p className="text-gray-400">
            © 2025 Smart Dine. All rights reserved. Point of Sale System for Restaurants.
          </p>
        </div>
      </footer>
    </div>
  );
}