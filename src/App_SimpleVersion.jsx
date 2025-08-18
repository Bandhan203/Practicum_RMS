import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { ChefDashboard } from './components/Dashboard/ChefDashboard';
import { CustomerDashboard } from './components/Dashboard/CustomerDashboard';
import { MenuManagement } from './components/Menu/MenuManagement';
import { CustomerMenu } from './components/Menu/CustomerMenu';
import { OrderManagement } from './components/Orders/OrderManagement';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { WasteManagement } from './components/Waste/WasteManagement';
import { InventoryManagement } from './components/Inventory/InventoryManagement';
import { ReservationManagement } from './components/Reservations/ReservationManagement';
import { UserManagement } from './components/Users/UserManagement';
import { ReportsManagement } from './components/Reports/ReportsManagement';
import { SettingsManagement } from './components/Settings/SettingsManagement';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Dashboard Route Component (role-based)
function DashboardRoute() {
  const { user } = useAuth();
  
  if (user?.role === 'customer') return <CustomerDashboard />;
  if (user?.role === 'chef') return <ChefDashboard />;
  return <AdminDashboard />;
}

// Menu Route Component (role-based)
function MenuRoute() {
  const { user } = useAuth();
  
  return user?.role === 'customer' ? <CustomerMenu /> : <MenuManagement />;
}

// Main Layout Component
function MainLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Don't show layout on login page
  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate main content margin based on sidebar state
  const getMainContentClass = () => {
    if (isMobile) {
      return "flex-1 min-h-[calc(100vh-4rem)] ml-0 transition-all duration-300 ease-in-out";
    }
    
    const marginLeft = sidebarCollapsed ? 'ml-16' : 'ml-64';
    return `flex-1 min-h-[calc(100vh-4rem)] ${marginLeft} transition-all duration-300 ease-in-out`;
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="relative">
        <Sidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onCollapseChange={setSidebarCollapsed}
        />
        <main className={getMainContentClass()}>
          <div className="h-full overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/menu" element={<MenuRoute />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/waste" element={<WasteManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/reservations" element={<ReservationManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/reports" element={<ReportsManagement />} />
              <Route path="/settings" element={<SettingsManagement />} />
              <Route path="/loyalty" element={<CustomerDashboard />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

function MainApp() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && location.pathname !== '/login' && (
        <div className="pt-16">
          <MainLayout />
        </div>
      )}
      
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
          } 
        />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <div /> {/* Empty div as routes are handled in MainLayout */}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
