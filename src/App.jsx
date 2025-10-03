import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealTimeDataProvider } from './contexts/RealTimeDataContext';
import { ApiAppProvider } from './contexts/ApiAppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Header } from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { BackendMenuManagement } from './components/Menu/BackendMenuManagement';
import { SimpleOrderManagement } from './components/Orders/SimpleOrderManagement';
import { RealTimeBillingSystem } from './components/Billing/RealTimeBillingSystem';
import ProfessionalBillingSystem from './components/Billing/ProfessionalBillingSystem';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import ProfessionalDashboard from './components/Dashboard/ProfessionalDashboard';
import { DynamicSettingsManagement } from './components/Settings/DynamicSettingsManagement';
import { InventoryManagement } from './components/Inventory/InventoryManagement';
import Analytics from './components/Analytics/Analytics';
import RealTimeAnalyticsDashboard from './components/Analytics/RealTimeAnalyticsDashboard';
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
    if (path === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  // Get active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/menu')) return 'menu';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/inventory')) return 'inventory';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/billing')) return 'billing';
    if (path.includes('/settings')) return 'settings';
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
              <Route path="dashboard" element={<ProfessionalDashboard />} />
              <Route path="menu" element={<BackendMenuManagement />} />
              <Route path="orders" element={<SimpleOrderManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="analytics-realtime" element={<RealTimeAnalyticsDashboard />} />
              <Route path="billing" element={<ProfessionalBillingSystem />} />
              <Route path="settings" element={<DynamicSettingsManagement />} />
              {/* Default route for /dashboard */}
              <Route path="" element={<ProfessionalDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}


function App() {
  return (
    <SettingsProvider>
    <AuthProvider>
      <ApiAppProvider>
        <AppProvider>
          <RealTimeDataProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/public" element={<LandingPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes - Simplified admin-only access */}
              <Route path="/dashboard/*" element={<MainLayout />} />
              <Route path="/admin/*" element={<MainLayout />} />
            </Routes>
          </RealTimeDataProvider>
        </AppProvider>
      </ApiAppProvider>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
