import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your{' '}
              <span className="text-brand-dark">Restaurant</span>{' '}
              with Smart Dine
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Smart Dine is a modern point of sale system with inventory tracking, 
              order management, payment processing, and efficient operations management. 
              Boost efficiency and reduce costs by up to 40%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/login" 
                className="bg-brand-dark text-white px-8 py-4 rounded-lg hover:bg-brand-light transition-all duration-300 flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 hover:border-brand-dark transition-all duration-300 flex items-center justify-center gap-2 text-lg font-semibold">
                <Play size={20} /> Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-dark mb-2">500+</div>
                <div className="text-gray-600 font-medium">Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-dark mb-2">99.9%</div>
                <div className="text-gray-600 font-medium">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-dark mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-2 text-xs text-gray-500 font-medium">Smart Dine Dashboard</div>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-semibold text-gray-700">Today&apos;s Revenue</div>
                    <div className="text-lg font-bold text-brand-dark">৳45,850</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-dark h-2 rounded-full w-3/4 transition-all duration-1000"></div>
                  </div>
                  <div className="text-xs text-green-600 mt-1">↗ +12% from yesterday</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Orders</div>
                    <div className="text-xl font-bold text-blue-600">142</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Tables</div>
                    <div className="text-xl font-bold text-green-600">24/28</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-brand-light text-white p-3 rounded-full shadow-lg animate-bounce">
              <div className="text-xs font-bold">LIVE</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
