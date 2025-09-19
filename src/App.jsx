import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealTimeDataProvider } from './contexts/RealTimeDataContext';
import { ApiAppProvider } from './contexts/ApiAppContext';
import { Header } from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { ApiMenuManagement as MenuManagement } from './components/Menu/ApiMenuManagement';
import { OrderManagement } from './components/Orders/OrderManagement';
import { UserManagement } from './components/Users/UserManagement';
import { RealTimeBillingSystem } from './components/Billing/RealTimeBillingSystem';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { SettingsManagement } from './components/Settings/SettingsManagement';
import { InventoryManagement } from './components/Inventory/InventoryManagement';
import Analytics from './components/Analytics/Analytics';
import RealTimeAnalyticsDashboard from './components/Analytics/RealTimeAnalyticsDashboard';
import { CustomerMenuRedux } from './components/Menu/CustomerMenuRedux';
import { LoginForm } from './components/Auth/LoginForm';
import SignupPage from './pages/SignupPage';
import { LandingPage } from './pages/LandingPage';
import { useAuth } from './contexts/AuthContext';



// Main Layout Component
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, loading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Redirect to dashboard if on root
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  // Get active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/admin/menu')) return 'menu';
    if (path.includes('/admin/orders')) return 'orders';
    if (path.includes('/admin/inventory')) return 'inventory';
    if (path.includes('/admin/analytics')) return 'analytics';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/billing')) return 'billing';
    if (path.includes('/admin/settings')) return 'settings';
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

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
              {/* Admin Routes - Use relative paths since we're inside /admin/* or /dashboard/* */}
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="analytics-realtime" element={<RealTimeAnalyticsDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="billing" element={<RealTimeBillingSystem />} />
              <Route path="settings" element={<SettingsManagement />} />
              {/* Default route for /dashboard */}
              <Route path="" element={<AdminDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <ApiAppProvider>
        <AppProvider>
          <RealTimeDataProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/public" element={<LandingPage />} />
              <Route path="/menu" element={<CustomerMenuRedux />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard/*" element={<MainLayout />} />
              <Route path="/admin/*" element={<MainLayout />} />
            </Routes>
          </RealTimeDataProvider>
        </AppProvider>
      </ApiAppProvider>
    </AuthProvider>
  );
}

export default App;
