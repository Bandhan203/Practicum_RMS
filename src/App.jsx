import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Header } from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { MenuManagement } from './components/Menu/MenuManagement';
import { OrderManagement } from './components/Orders/OrderManagement';
import { UserManagement } from './components/Users/UserManagement';
import { BillingSystem } from './components/Billing/BillingSystem';

// Login Component with Role Selection
function LoginWithRoles() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Store user role in localStorage for simplicity
    localStorage.setItem('userRole', selectedRole);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Redirect based on role
    switch(selectedRole) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'waiter':
        navigate('/waiter/orders');
        break;
      case 'cashier':
        navigate('/cashier/billing');
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restaurant Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the system
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Select Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="admin">Admin</option>
                  <option value="waiter">Waiter</option>
                  <option value="cashier">Cashier</option>
                </select>
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
                  defaultValue="user@restaurant.com"
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
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                localStorage.removeItem('userRole');
                localStorage.removeItem('isAuthenticated');
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Dashboard Component
function SimpleDashboard() {
  const userRole = localStorage.getItem('userRole') || 'admin';
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Restaurant Management System ({userRole})</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Menu Items</h3>
          <p className="text-3xl font-bold text-green-600">156</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Today's Revenue</h3>
          <p className="text-3xl font-bold text-yellow-600">$1,234</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
          <p className="text-3xl font-bold text-purple-600">8</p>
        </div>
      </div>
    </div>
  );
}

// Main Layout Component
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const userRole = localStorage.getItem('userRole') || 'admin';
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Get active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/menu')) return 'menu';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/users')) return 'users';
    if (path.includes('/billing')) return 'billing';
    return 'dashboard';
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

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header toggleSidebar={toggleSidebar} userRole={userRole} />
      <div className="relative">
        <Sidebar 
          activeTab={activeTab} 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          userRole={userRole}
        />
        <main className={getMainContentClass()}>
          <div className="h-full overflow-auto p-6">
            <Routes>
              {/* Admin Routes */}
              {userRole === 'admin' && (
                <>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/dashboard" element={<SimpleDashboard />} />
                  <Route path="/menu" element={<MenuManagement />} />
                  <Route path="/orders" element={<OrderManagement />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/billing" element={<BillingSystem />} />
                </>
              )}
              
              {/* Waiter Routes */}
              {userRole === 'waiter' && (
                <>
                  <Route path="/" element={<Navigate to="/waiter/orders" replace />} />
                  <Route path="/orders" element={<OrderManagement />} />
                  <Route path="/menu" element={<MenuManagement readOnly={true} />} />
                </>
              )}
              
              {/* Cashier Routes */}
              {userRole === 'cashier' && (
                <>
                  <Route path="/" element={<Navigate to="/cashier/billing" replace />} />
                  <Route path="/billing" element={<BillingSystem />} />
                  <Route path="/orders" element={<OrderManagement readOnly={true} />} />
                </>
              )}
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
        {/* Login Route */}
        <Route path="/login" element={<LoginWithRoles />} />
        
        {/* Protected Routes */}
        <Route path="/admin/*" element={<MainLayout />} />
        <Route path="/waiter/*" element={<MainLayout />} />
        <Route path="/cashier/*" element={<MainLayout />} />
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
