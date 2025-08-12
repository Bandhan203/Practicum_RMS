import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Main App Content with Authentication Check
function AppContent() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return <Layout />;
}

// Main Layout Component for Authenticated Users
function Layout() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-gray-50 pt-16">
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
              {/* Dashboard Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                user?.role === 'customer' ? <CustomerDashboard /> :
                user?.role === 'chef' ? <ChefDashboard /> :
                <AdminDashboard />
              } />
              
              {/* Menu Routes */}
              <Route path="/menu" element={
                user?.role === 'customer' ? <CustomerMenu /> : <MenuManagement />
              } />
              
              {/* Admin/Staff Routes */}
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/waste" element={<WasteManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/reservations" element={<ReservationManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/reports" element={<ReportsManagement />} />
              <Route path="/settings" element={<SettingsManagement />} />
              
              {/* Loyalty placeholder - using customer dashboard for now */}
              <Route path="/loyalty" element={<CustomerDashboard />} />
              
              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
