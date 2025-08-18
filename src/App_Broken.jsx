import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Header } from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import LandingPage from './components/Landing/LandingPage';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { MenuManagement } from './components/Menu/MenuManagement';
import { OrderManagement } from './components/Orders/OrderManagement';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { WasteManagement } from './components/Waste/WasteManagement';
import { InventoryManagement } from './components/Inventory/InventoryManagement';
import { ReservationManagement } from './components/Reservations/ReservationManagement';
import { UserManagement } from './components/Users/UserManagement';
import { ReportsManagement } from './components/Reports/ReportsManagement';
import { SettingsManagement } from './components/Settings/SettingsManagement';

// Simple Login Component (without authentication)
function SimpleLogin() {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // Simple redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restaurant Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue="admin@restaurant.com"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  defaultValue="password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleLogin}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign in
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/signup')}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Sign up
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Signup Component (without authentication)
function SimpleSignup() {
  const navigate = useNavigate();
  
  const handleSignup = () => {
    // Simple redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our Restaurant Management System
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleSignup}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Create Account
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Sign in
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Layout Component
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Get active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    return path.substring(1); // Remove leading slash
  };

// Admin Dashboard Layout Component
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Get active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    return path.substring(1); // Remove leading slash
  };

  const activeTab = getActiveTab();

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate main content margin based on sidebar state
  const getMainContentClass = () => {
    if (isMobile) {
      return "flex-1 min-h-[calc(100vh-4rem)] ml-0 transition-all duration-300 ease-in-out";
    }
    
    const marginLeft = 'ml-64'; // Fixed sidebar width
    return `flex-1 min-h-[calc(100vh-4rem)] ${marginLeft} transition-all duration-300 ease-in-out`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header toggleSidebar={toggleSidebar} />
      <div className="relative">
        <Sidebar 
          activeTab={activeTab} 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <main className={getMainContentClass()}>
          <div className="h-full overflow-auto p-6">
            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/waste" element={<WasteManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/reservations" element={<ReservationManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/reports" element={<ReportsManagement />} />
              <Route path="/settings" element={<SettingsManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<SimpleLogin />} />
        <Route path="/signup" element={<SimpleSignup />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminLayout />} />
        
        {/* Redirect old admin routes to new structure */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/menu" element={<Navigate to="/admin/menu" replace />} />
        <Route path="/orders" element={<Navigate to="/admin/orders" replace />} />
        <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
        <Route path="/waste" element={<Navigate to="/admin/waste" replace />} />
        <Route path="/inventory" element={<Navigate to="/admin/inventory" replace />} />
        <Route path="/reservations" element={<Navigate to="/admin/reservations" replace />} />
        <Route path="/users" element={<Navigate to="/admin/users" replace />} />
        <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
        <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
