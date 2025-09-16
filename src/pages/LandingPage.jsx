import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Users, ShoppingCart, BarChart3, Calendar, Settings } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Smart Dine</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-white text-red-600 px-4 py-2 rounded-md border border-red-600 hover:bg-red-50 transition-colors"
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
            Restaurant Management
            <span className="block text-red-600">Made Simple</span>
          </h2>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            Streamline your restaurant operations with our comprehensive management system. 
            From order taking to inventory management, we've got you covered.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link 
              to="/login" 
              className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              to="/signup" 
              className="bg-white text-red-600 px-8 py-3 rounded-lg text-lg font-medium border border-red-600 hover:bg-red-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Run Your Restaurant
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <ShoppingCart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Order Management</h4>
              <p className="text-gray-600">
                Efficiently manage orders from kitchen to table with real-time tracking and updates.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <ChefHat className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Menu Management</h4>
              <p className="text-gray-600">
                Create and manage your menu items, pricing, and availability with ease.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Staff Management</h4>
              <p className="text-gray-600">
                Manage your team with role-based access and performance tracking.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <BarChart3 className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h4>
              <p className="text-gray-600">
                Get insights into your business with detailed analytics and reporting.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Calendar className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Reservations</h4>
              <p className="text-gray-600">
                Manage table reservations and optimize your seating capacity.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Settings className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Inventory Control</h4>
              <p className="text-gray-600">
                Track inventory levels and manage supplier relationships efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-red-600 rounded-2xl p-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Restaurant?
          </h3>
          <p className="text-red-100 text-lg mb-6">
            Join thousands of restaurants already using Smart Dine to streamline their operations.
          </p>
          <Link 
            to="/signup" 
            className="bg-white text-red-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-6 w-6 text-red-600 mr-2" />
            <span className="text-xl font-bold">Smart Dine</span>
          </div>
          <p className="text-gray-400">
            © 2025 Smart Dine. All rights reserved. Restaurant Management System.
          </p>
        </div>
      </footer>
    </div>
  );
}