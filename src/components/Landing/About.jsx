import React from 'react';
import { Star, Quote } from 'lucide-react';

const About = () => {
  const stats = [
    { number: "500+", label: "Restaurants Served", description: "Trusted by restaurants worldwide" },
    { number: "99.9%", label: "System Uptime", description: "Reliable 24/7 operations" },
    { number: "40%", label: "Cost Reduction", description: "Average savings achieved" },
    { number: "24/7", label: "Customer Support", description: "Always here to help" }
  ];

  const testimonials = [
    {
      name: "Sarah Ahmed",
      role: "Restaurant Owner",
      restaurant: "Spice Garden",
      content: "Smart Dine revolutionized our operations. We've reduced food waste by 35% and increased our profit margins significantly.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c2f8?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Mohammad Rahman",
      role: "General Manager",
      restaurant: "Royal Feast",
      content: "The inventory management alone has saved us countless hours. The real-time analytics help us make better decisions daily.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Fatima Khan",
      role: "Head Chef",
      restaurant: "Taste of Bengal",
      content: "Kitchen operations are so much smoother now. Order tracking and prep time optimization have improved our service quality.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Built by Restaurant Experts for{' '}
              <span className="text-brand-dark">Restaurant Success</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Smart Dine's team combines decades of restaurant industry experience with cutting-edge technology 
              to create solutions that actually work in real restaurant environments.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From small cafes to large restaurant chains, Smart Dine scales with your business, 
              providing the tools you need to optimize operations, reduce costs, and improve customer satisfaction.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 font-medium">4.9/5 Customer Rating</span>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Industry Expertise</h4>
                    <p className="text-gray-600">Built by people who understand restaurant operations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Easy Implementation</h4>
                    <p className="text-gray-600">Quick setup with minimal disruption to operations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Continuous Support</h4>
                    <p className="text-gray-600">Dedicated support team available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-brand-dark mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Section */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h3>
            <p className="text-lg text-gray-600">Real feedback from restaurant owners and managers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-brand-light mb-4 opacity-20" />
                
                <p className="text-gray-600 mb-6 leading-relaxed">{testimonial.content}</p>
                
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-brand-dark font-medium">{testimonial.restaurant}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
