import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  ShoppingCart, 
  Calendar, 
  Package, 
  Trash2, 
  Users, 
  Menu as MenuIcon,
  Home,
  UtensilsCrossed,
  Clock,
  Star,
  Settings,
  FileText
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'menu', label: 'Menu', icon: MenuIcon },
          { id: 'reservations', label: 'Reservations', icon: Calendar },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'waste', label: 'Waste Log', icon: Trash2 },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];
      case 'chef':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'waste', label: 'Waste Log', icon: Trash2 },
          { id: 'inventory', label: 'Inventory', icon: Package }
        ];
      case 'waiter':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'reservations', label: 'Reservations', icon: Calendar },
          { id: 'menu', label: 'Menu', icon: MenuIcon }
        ];
      case 'customer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
          { id: 'orders', label: 'My Orders', icon: Clock },
          { id: 'reservations', label: 'Reservations', icon: Calendar },
          { id: 'loyalty', label: 'Loyalty', icon: Star }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          {user?.role === 'admin' ? 'Admin Panel' : 
           user?.role === 'chef' ? 'Chef Dashboard' :
           user?.role === 'waiter' ? 'Waiter Panel' :
           'Customer Portal'}
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#6B0000] text-white border-r-4 border-white shadow-md'
                    : 'text-gray-600 hover:text-white hover:bg-[#6B0000]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
