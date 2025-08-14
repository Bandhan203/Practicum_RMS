import React from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign, 
  Smartphone,
  ChefHat,
  FileText,
  AlertTriangle,
  Calendar
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights into sales, inventory, and customer behavior with interactive dashboards and detailed reports.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels, set automatic reorder points, and prevent wastage with smart inventory optimization.",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Manage employee schedules, track performance, and streamline communication across all departments.",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: ChefHat,
      title: "Kitchen Management",
      description: "Optimize kitchen operations with order tracking, prep time monitoring, and recipe management.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: DollarSign,
      title: "Financial Tracking",
      description: "Monitor profits, expenses, and cash flow with comprehensive financial reporting and forecasting.",
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      icon: Calendar,
      title: "Reservation System",
      description: "Manage table bookings, waitlists, and customer preferences with an integrated reservation platform.",
      color: "bg-pink-50 text-pink-600"
    },
    {
      icon: AlertTriangle,
      title: "Waste Management",
      description: "Track food waste, identify patterns, and implement strategies to reduce costs and environmental impact.",
      color: "bg-red-50 text-red-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your restaurant data anywhere with our fully responsive design that works on all devices.",
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Enterprise-grade security with encrypted data storage, regular backups, and compliance standards.",
      color: "bg-gray-50 text-gray-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your{' '}
            <span className="text-brand-dark">Restaurant</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools designed specifically for restaurant operations, 
            from front-of-house to back-of-house management.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-brand-light transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-brand-dark to-brand-light rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Restaurant with Smart Dine?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join hundreds of restaurants already using Smart Dine to streamline operations and boost profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-brand-dark px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-dark transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
