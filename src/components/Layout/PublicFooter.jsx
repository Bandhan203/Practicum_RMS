import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/src/assets/images/Smart Dine.svg" 
                alt="Smart Dine" 
                className="w-8 h-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div 
                className="w-8 h-8 bg-gradient-to-br from-[#C92E33] to-[#E6353B] rounded-lg flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <span className="text-white font-bold text-sm">SD</span>
              </div>
              <h3 className="text-xl font-bold">Smart Dine</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Experience authentic flavors and exceptional service at Smart Dine. 
              We bring you the finest culinary traditions with a modern twist.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/public" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/public/menu" className="text-gray-400 hover:text-white transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/public/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/public/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Order Online
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#C92E33] mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Main Street<br />
                  Dhaka, Bangladesh 1000
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#C92E33] flex-shrink-0" />
                <span className="text-gray-400">+880 1234-567890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#C92E33] flex-shrink-0" />
                <span className="text-gray-400">info@smartdine.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Opening Hours</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#C92E33] flex-shrink-0" />
                <div className="text-gray-400">
                  <p className="font-medium">Monday - Friday</p>
                  <p>10:00 AM - 11:00 PM</p>
                </div>
              </div>
              <div className="text-gray-400 ml-8">
                <p className="font-medium">Saturday - Sunday</p>
                <p>9:00 AM - 12:00 AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Smart Dine. All rights reserved. | Designed with ❤️ for food lovers</p>
        </div>
      </div>
    </footer>
  );
}
