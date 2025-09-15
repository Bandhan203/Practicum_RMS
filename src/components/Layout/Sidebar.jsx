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
  Settings
} from 'lucide-react';

const Sidebar = ({ activeTab, isOpen, setIsOpen, userRole }) => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle logout
  const handleLogout = useCallback(() => {
    // Clear user data
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    // Navigate to login page
    navigate('/login');
  }, [navigate]);

  // Get current panel name based on active tab and role
  const getCurrentPanelName = useCallback(() => {
    const roleNames = {
      admin: 'Admin Panel',
      waiter: 'Waiter Panel',
      cashier: 'Cashier Panel',
      staff: 'Staff Panel'
    };
    
    if (activeTab === 'dashboard') {
      return roleNames[userRole] || 'Dashboard';
    }

    switch (activeTab) {
      case 'orders': return 'Order Management';
      case 'menu': return 'Menu Management';
      case 'users': return 'User Management';
      case 'billing': return 'Billing System';
      default: return roleNames[userRole] || 'Dashboard';
    }
  }, [activeTab, userRole]);

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

  // Role-based menu items
  const menuItems = useMemo(() => {
    const baseItems = {
      admin: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'menu', label: 'Menu Management', icon: MenuIcon },
        { id: 'orders', label: 'Order Management', icon: ShoppingCart },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'billing', label: 'Billing System', icon: CreditCard },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
      chef: [
        { id: 'chef-dashboard', label: 'Chef Dashboard', icon: Home },
        { id: 'orders', label: 'Order Management', icon: ShoppingCart },
        { id: 'menu', label: 'Menu Management', icon: MenuIcon },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
      waiter: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'orders', label: 'Order Management', icon: ShoppingCart },
        { id: 'menu', label: 'Menu Management', icon: MenuIcon },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
      cashier: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'billing', label: 'Billing System', icon: CreditCard },
        { id: 'orders', label: 'Order Management', icon: ShoppingCart },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
      staff: [
        { id: 'staff-dashboard', label: 'Staff Dashboard', icon: Home },
        { id: 'orders', label: 'Order Management', icon: ShoppingCart },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    };
    return baseItems[userRole] || baseItems.admin;
  }, [userRole]);

  // Optimized menu item click handler
  const handleMenuItemClick = useCallback((itemId) => {
    // Route to the correct path for the current role
    let basePath = userRole;
    // Special case for admin dashboard
    if (userRole === 'admin' && itemId === 'dashboard') basePath = 'admin';
    if (userRole === 'chef' && itemId === 'chef-dashboard') basePath = 'chef';
    if (userRole === 'staff' && itemId === 'staff-dashboard') basePath = 'staff';
    let path = `/${basePath}/${itemId}`;
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  }, [navigate, isMobile, setIsOpen, userRole]);

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
              const isActive = location.pathname === `/${userRole}/${item.id}` || 
                              (location.pathname === `/${userRole}` && item.id === 'dashboard') ||
                              (location.pathname === `/${userRole}/dashboard` && item.id === 'dashboard');
              
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
                <span className="text-white text-sm font-medium">
                  {userRole?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {userRole || 'User'}
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
