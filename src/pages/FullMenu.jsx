import { useState } from 'react';
import { Search, Filter, Star, Plus } from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';

export function FullMenu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'All', 'Appetizers', 'Main Course', 'Rice & Biryani', 'Desserts', 'Beverages', 'Soups'
  ];

  const menuItems = [
    // Appetizers
    {
      id: 1,
      name: "Chicken Wings",
      description: "Crispy chicken wings with your choice of sauce",
      price: 320,
      image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
      rating: 4.6,
      category: "Appetizers",
      isVeg: false,
      spicy: true
    },
    {
      id: 2,
      name: "Vegetable Spring Rolls",
      description: "Fresh vegetables wrapped in crispy pastry",
      price: 250,
      image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&h=300&fit=crop",
      rating: 4.3,
      category: "Appetizers",
      isVeg: true,
      spicy: false
    },

    // Main Course
    {
      id: 3,
      name: "Butter Chicken",
      description: "Tender chicken in a rich, creamy tomato-based sauce",
      price: 450,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
      rating: 4.8,
      category: "Main Course",
      isVeg: false,
      spicy: true
    },
    {
      id: 4,
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon grilled to perfection",
      price: 680,
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      rating: 4.7,
      category: "Main Course",
      isVeg: false,
      spicy: false
    },
    {
      id: 5,
      name: "Vegetable Curry",
      description: "Mixed vegetables in aromatic curry sauce",
      price: 380,
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
      rating: 4.4,
      category: "Main Course",
      isVeg: true,
      spicy: true
    },

    // Rice & Biryani
    {
      id: 6,
      name: "Beef Biryani",
      description: "Fragrant basmati rice layered with tender beef",
      price: 520,
      image: "https://images.unsplash.com/photo-1563379091339-03246963d999?w=400&h=300&fit=crop",
      rating: 4.9,
      category: "Rice & Biryani",
      isVeg: false,
      spicy: true
    },
    {
      id: 7,
      name: "Chicken Fried Rice",
      description: "Wok-fried rice with chicken and vegetables",
      price: 420,
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
      rating: 4.5,
      category: "Rice & Biryani",
      isVeg: false,
      spicy: false
    },
    {
      id: 8,
      name: "Vegetable Biryani",
      description: "Aromatic basmati rice with mixed vegetables",
      price: 380,
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop",
      rating: 4.3,
      category: "Rice & Biryani",
      isVeg: true,
      spicy: true
    },

    // Desserts
    {
      id: 9,
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with molten center",
      price: 280,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
      rating: 4.7,
      category: "Desserts",
      isVeg: true,
      spicy: false
    },
    {
      id: 10,
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee and mascarpone",
      price: 320,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
      rating: 4.6,
      category: "Desserts",
      isVeg: true,
      spicy: false
    },

    // Beverages
    {
      id: 11,
      name: "Fresh Lime Soda",
      description: "Refreshing lime soda with mint",
      price: 120,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop",
      rating: 4.2,
      category: "Beverages",
      isVeg: true,
      spicy: false
    },
    {
      id: 12,
      name: "Mango Lassi",
      description: "Traditional yogurt drink with fresh mango",
      price: 150,
      image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop",
      rating: 4.5,
      category: "Beverages",
      isVeg: true,
      spicy: false
    },

    // Soups
    {
      id: 13,
      name: "Tomato Soup",
      description: "Rich and creamy tomato soup with herbs",
      price: 180,
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
      rating: 4.3,
      category: "Soups",
      isVeg: true,
      spicy: false
    },
    {
      id: 14,
      name: "Chicken Corn Soup",
      description: "Hearty soup with chicken and sweet corn",
      price: 220,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
      rating: 4.4,
      category: "Soups",
      isVeg: false,
      spicy: false
    }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#C92E33] to-[#E6353B] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Our Full Menu</h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Discover our complete collection of authentic dishes, crafted with love and the finest ingredients.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C92E33] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#C92E33] text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No dishes found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.isVeg && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          VEG
                        </span>
                      )}
                      {item.spicy && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          🌶️ SPICY
                        </span>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-white rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-900">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-[#C92E33] font-medium uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-[#C92E33]">
                        ৳ {item.price}
                      </div>
                      
                      <button className="bg-gradient-to-r from-[#C92E33] to-[#E6353B] text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-110">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600">
              Quick access to your favorite food categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1).map((category) => {
              const itemCount = menuItems.filter(item => item.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group"
                >
                  <div className="text-2xl mb-2">
                    {category === 'Appetizers' && '🥗'}
                    {category === 'Main Course' && '🍽️'}
                    {category === 'Rice & Biryani' && '🍚'}
                    {category === 'Desserts' && '🍰'}
                    {category === 'Beverages' && '🥤'}
                    {category === 'Soups' && '🍲'}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#C92E33] transition-colors">
                    {category}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {itemCount} items
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
