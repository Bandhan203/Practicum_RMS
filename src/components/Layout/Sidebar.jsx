import React, { useState, useEffect } from 'react';
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
  FileText,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onCollapseChange }) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false); // Don't collapse on mobile, use overlay instead
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Notify parent of collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && !event.target.closest('.sidebar')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, setIsOpen]);

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

  const handleMenuItemClick = (itemId) => {
    setActiveTab(itemId);
    if (isMobile) {
      setIsOpen(false); // Close sidebar on mobile after selection
    }
  };

  const sidebarWidth = isCollapsed && !isMobile ? 'w-16' : 'w-64';
  const sidebarClasses = `
    sidebar fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg z-40 
    transition-all duration-300 ease-in-out overflow-hidden
    ${sidebarWidth}
    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses} style={{ overflowX: 'hidden' }}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {user?.role === 'admin' ? 'Admin Panel' : 
               user?.role === 'chef' ? 'Chef Dashboard' :
               user?.role === 'waiter' ? 'Waiter Panel' :
               'Customer Portal'}
            </h2>
          )}

          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 h-[calc(100vh-12rem)] scrollbar-hide">
          <div className={`space-y-1 ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left 
                    transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-[#6B0000] text-white shadow-md'
                      : 'text-gray-600 hover:text-white hover:bg-[#6B0000] hover:shadow-sm'
                    }
                    ${isCollapsed && !isMobile ? 'justify-center' : ''}
                  `}
                  title={isCollapsed && !isMobile ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
                  
                  {(!isCollapsed || isMobile) && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="
                      absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm 
                      rounded opacity-0 group-hover:opacity-100 transition-opacity 
                      pointer-events-none whitespace-nowrap z-50
                    ">
                      {item.label}
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-black rounded-l" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
          <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-[#6B0000] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {user?.role || 'Role'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for desktop when sidebar is not fixed */}
      {!isMobile && (
        <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ${sidebarWidth}`} />
      )}
    </>
  );
}
