import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, ArrowRight, Users, Award, Heart } from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';

export function CustomerLanding() {
  const featuredDishes = [
    {
      id: 1,
      name: "Butter Chicken",
      description: "Tender chicken in a rich, creamy tomato-based sauce with aromatic spices",
      price: 450,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
      rating: 4.8,
      reviews: 124,
      category: "Main Course"
    },
    {
      id: 2,
      name: "Beef Biryani",
      description: "Fragrant basmati rice layered with tender beef and traditional spices",
      price: 520,
      image: "https://images.unsplash.com/photo-1563379091339-03246963d999?w=400&h=300&fit=crop",
      rating: 4.9,
      reviews: 98,
      category: "Rice & Biryani"
    },
    {
      id: 3,
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
      price: 280,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
      rating: 4.7,
      reviews: 87,
      category: "Desserts"
    }
  ];

  const stats = [
    { icon: Users, value: "2000+", label: "Happy Customers" },
    { icon: Award, value: "50+", label: "Awards Won" },
    { icon: Heart, value: "4.8", label: "Average Rating" },
    { icon: Clock, value: "30min", label: "Average Delivery" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop')"
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-[#E6353B]">Smart Dine</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-200 leading-relaxed">
              Experience authentic flavors and exceptional service. 
              From traditional recipes to modern culinary innovations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/public/menu"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#C92E33] to-[#E6353B] text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                See Full Menu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#C92E33] font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 border-2 border-transparent hover:border-[#C92E33]"
              >
                Order Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#C92E33] to-[#E6353B] text-white rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Featured Dishes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and chef-recommended dishes, 
              crafted with the finest ingredients and authentic recipes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredDishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#C92E33] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {dish.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{dish.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{dish.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{dish.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-[#C92E33]">
                      ৳ {dish.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dish.reviews} reviews
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-[#C92E33] to-[#E6353B] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/public/menu"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#C92E33] to-[#E6353B] text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              See Full Menu
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Smart Dine has been serving authentic flavors and creating memorable dining 
                experiences for over a decade. Our passion for culinary excellence drives us 
                to source the finest ingredients and preserve traditional cooking methods.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Every dish tells a story, every ingredient has a purpose, and every meal 
                is a celebration of flavor, culture, and community.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#C92E33] mb-1">10+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#C92E33] mb-1">200+</div>
                  <div className="text-gray-600">Menu Items</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop"
                alt="Restaurant Interior"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Visit Us Today
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Located in the heart of the city, we&apos;re easily accessible and ready to serve you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-[#C92E33] text-white p-3 rounded-full">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">123 Main Street, Dhaka, Bangladesh 1000</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-[#C92E33] text-white p-3 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Opening Hours</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Monday - Friday: 10:00 AM - 11:00 PM</p>
                    <p>Saturday - Sunday: 9:00 AM - 12:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Interactive Map Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
