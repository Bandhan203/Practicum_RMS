import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Bell,
  Shield,
  Menu,
  LogOut,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { RestaurantLogo } from '../common/RestaurantLogo';

export function Header({ toggleSidebar, userRole }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFullNotifications, setShowFullNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Mock notification data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #1234 has been placed by Customer Jane',
      time: '2 minutes ago',
      read: false,
      icon: 'clock'
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Tomatoes are running low (8kg remaining)',
      time: '15 minutes ago',
      read: false,
      icon: 'warning'
    },
    {
      id: 3,
      type: 'order',
      title: 'Order Completed',
      message: 'Order #1230 has been served to Table 5',
      time: '1 hour ago',
      read: true,
      icon: 'success'
    },
    {
      id: 4,
      type: 'reservation',
      title: 'New Reservation',
      message: 'Table for 4 booked for tonight at 7:00 PM',
      time: '2 hours ago',
      read: true,
      icon: 'clock'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false); // Close dropdown
    setShowFullNotifications(true); // Open full modal
  };

  const handleCloseFullNotifications = () => {
    setShowFullNotifications(false);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (iconType) => {
    switch (iconType) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    // Navigate to login page
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-100 fixed top-0 left-0 right-0 z-30 backdrop-blur-sm">
      <div className="flex items-center h-16">
        <div className="flex justify-between items-center w-full">
          {/* Left side - Logo area matching sidebar width */}
          <div className="flex items-center w-64 px-4 border-r border-gray-100">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:text-brand-light hover:bg-gray-50 md:hidden transition-colors mr-2"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo and Brand Name */}
            <div className="flex items-center space-x-3">
              <RestaurantLogo className="w-8 h-8" />
              <h1 className="text-xl font-bold text-brand-dark hidden sm:block">RMS</h1>
            </div>
          </div>

          {/* Right side - Actions and User */}
          <div className="flex-1 flex items-center justify-between px-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* User actions area */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={handleNotificationClick}
                  className="p-2 text-gray-500 hover:text-brand-light transition-colors rounded-xl hover:bg-gray-50 relative"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-brand-light hover:text-brand-dark transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {notification.time}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-2">
                                    {!notification.read && (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Mark as read"
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(notification.id)}
                                      className="p-1 hover:bg-gray-200 rounded"
                                      title="Delete notification"
                                    >
                                      <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button 
                          onClick={handleViewAllNotifications}
                          className="w-full text-center text-sm text-brand-light hover:text-brand-dark transition-colors font-medium"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Settings and Logout */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700 capitalize">{userRole || 'User'}</span>
                </div>
                
                {/* Mobile User Avatar */}
                <div className="sm:hidden w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{userRole?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Notifications Modal */}
      {showFullNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
              <div className="flex items-center space-x-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-brand-light hover:text-brand-dark transition-colors font-medium"
                  >
                    Mark all as read ({unreadCount})
                  </button>
                )}
                <button
                  onClick={handleCloseFullNotifications}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p>You&apos;re all caught up! No new notifications at this time.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className={`text-base font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-3 space-x-4">
                                <span className="text-xs text-gray-400">
                                  {notification.time}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  notification.type === 'order' ? 'bg-blue-100 text-blue-800' :
                                  notification.type === 'inventory' ? 'bg-yellow-100 text-yellow-800' :
                                  notification.type === 'reservation' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {notification.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Delete notification"
                              >
                                <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {notifications.length} total notifications
                </p>
                <button
                  onClick={handleCloseFullNotifications}
                  className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-dark transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
