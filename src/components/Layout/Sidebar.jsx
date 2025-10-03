import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import {
  Home,
  ShoppingCart,
  Menu as MenuIcon,
  Users,
  CreditCard,
  LogOut,
  Settings,
  Package,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ activeTab, isOpen, setIsOpen }) => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  // Fixed: All userRole references removed for admin-only access

  // Handle logout
  const handleLogout = useCallback(() => {
    // Clear user data
    localStorage.removeItem('isAuthenticated');
    // Navigate to login page
    navigate('/login');
  }, [navigate]);

  // Get current panel name based on active tab
  const getCurrentPanelName = useCallback(() => {
    switch (activeTab) {
      case 'dashboard': return 'Admin Panel';
      case 'orders': return 'Order Management';
      case 'menu': return 'Menu Management';
      case 'inventory': return 'Inventory Management';
      case 'analytics': return 'Analytics & Reports';
      case 'billing': return 'Billing System';
      default: return 'Admin Panel';
    }
  }, [activeTab]);

  // Optimized outside click handler for mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar')) {
        setIsOpen(false);
      }
    };

    // Add slight delay to prevent immediate triggering
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen, setIsOpen]);

  // Admin menu items
  const menuItems = useMemo(() => {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'menu', label: 'Menu Management', icon: MenuIcon },
      { id: 'orders', label: 'Order Management', icon: ShoppingCart },
      { id: 'inventory', label: 'Inventory Management', icon: Package },
      { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
      { id: 'billing', label: 'Billing System', icon: CreditCard },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];
  }, []);

  // Menu item click handler
  const handleMenuItemClick = useCallback((itemId) => {
    // Route to dashboard paths for consistent navigation
    navigate(`/dashboard/${itemId}`);
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setIsOpen(false);
    }
  }, [navigate, isMobile, setIsOpen]);

  // Memoized sidebar classes for better performance
  const sidebarClasses = useMemo(() => {
    const baseClasses = 'sidebar fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg z-40 border-r border-gray-100 flex flex-col';
    const widthClass = 'w-64';
    const transformClass = isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0';
    
    return `${baseClasses} ${widthClass} ${transformClass} transform transition-transform duration-200 ease-out`;
  }, [isMobile, isOpen]);

  return (
    <>
      {/* Mobile overlay for better performance */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* Header - Dynamic Panel Name */}
        <div className="flex items-center justify-center p-4 border-b border-gray-100 flex-shrink-0">
          <div className="text-center w-full">
            <h2 className="text-sm font-bold text-red-600 truncate px-2">
              {getCurrentPanelName()}
            </h2>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hidden">
          <div className="space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const isActive = (location.pathname === '/dashboard' && item.id === 'dashboard') ||
                              location.pathname === `/dashboard/${item.id}`;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                    transition-all duration-150 ease-out group
                    ${isActive 
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  aria-label={item.label}
                >
                  <item.icon 
                    className={`w-5 h-5 mr-3 transition-colors duration-150 ${
                      isActive ? 'text-red-700' : 'text-gray-500 group-hover:text-gray-700'
                    }`} 
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer - User Info */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  System Administrator
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
