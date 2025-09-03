import React from 'react';
import { ShoppingCart, Clock, Star, Heart, User, MapPin } from '../common/Icons';

export function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Smart Dine</h1>
          <p className="text-gray-600">Your personalized dining experience</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Menu</h3>
            <p className="text-gray-600 text-sm">Explore our delicious menu items</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Order</h3>
            <p className="text-gray-600 text-sm">Order your favorites instantly</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Favorites</h3>
            <p className="text-gray-600 text-sm">View your favorite dishes</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reservations</h3>
            <p className="text-gray-600 text-sm">Book a table</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order #12345</h3>
                  <p className="text-sm text-gray-600">2 items • ৳450.00</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Delivered
                </span>
                <p className="text-sm text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order #12344</h3>
                  <p className="text-sm text-gray-600">3 items • ৳675.00</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Preparing
                </span>
                <p className="text-sm text-gray-500 mt-1">30 min ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Dish Name {item}</h3>
                  <p className="text-sm text-gray-600">Delicious description</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 ml-1">4.5</span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">৳{(150 + item * 50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
