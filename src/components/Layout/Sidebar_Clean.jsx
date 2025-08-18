import React, { useState } from 'react';
import {
  Home,
  Menu as MenuIcon,
  Calendar,
  Package,
  Trash2,
  BarChart3,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onCollapseChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'menu', icon: MenuIcon, label: 'Menu Management' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'reservations', icon: Calendar, label: 'Reservations' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'waste', icon: Trash2, label: 'Waste Management' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const handleItemClick = (itemId) => {
    setActiveTab(itemId);
    // Close mobile sidebar after selection
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    onCollapseChange && onCollapseChange(!collapsed);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with Collapse Button */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            {!collapsed && (
              <h2 className="text-lg font-semibold text-gray-800">Restaurant Management</h2>
            )}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`
                        w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-brand-light text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-brand-dark'
                        }
                        ${collapsed ? 'justify-center' : 'justify-start space-x-3'}
                      `}
                      title={collapsed ? item.label : ''}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      {!collapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-100 p-4">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                  <p className="text-xs text-gray-500 truncate">Administrator</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
