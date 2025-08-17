import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ProtectedRoute, PublicRoute } from './components/Auth/ProtectedRoute';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { Header } from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
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
// Customer Portal Components
import { CustomerLayout } from './components/Customer/CustomerLayout';
import { CustomerPortalDashboard } from './components/Customer/CustomerPortalDashboard';
// Public Pages
import { CustomerLanding } from './pages/CustomerLanding';
import { FullMenu } from './pages/FullMenu';
import { useAuth } from './contexts/AuthContext';

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

// Main Layout Component for Admin/Staff
function MainLayout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    
    return "flex-1 min-h-[calc(100vh-4rem)] ml-64 transition-all duration-300 ease-in-out";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />
        
        {/* Main content */}
        <main className={getMainContentClass()}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Main App Component
function MainApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/public" element={<CustomerLanding />} />
        <Route path="/public/menu" element={<FullMenu />} />
        <Route path="/public/about" element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-900">About Us - Coming Soon</h1>
          </div>
        } />
        <Route path="/public/contact" element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-900">Contact Us - Coming Soon</h1>
          </div>
        } />
        
        {/* Authentication Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignupForm />
          </PublicRoute>
        } />

        {/* Customer Portal Routes */}
        <Route path="/customer/*" element={
          <ProtectedRoute requiredRole="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CustomerPortalDashboard />} />
          <Route path="dashboard" element={<CustomerPortalDashboard />} />
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="orders" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Customer Orders</h1>
              <p>Order tracking and history coming soon...</p>
            </div>
          } />
          <Route path="reservations" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Reservations</h1>
              <p>Table reservation system coming soon...</p>
            </div>
          } />
          <Route path="loyalty" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Loyalty Program</h1>
              <p>Rewards and points system coming soon...</p>
            </div>
          } />
          <Route path="reviews" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Reviews</h1>
              <p>Review system coming soon...</p>
            </div>
          } />
          <Route path="support" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Customer Support</h1>
              <p>Help and support system coming soon...</p>
            </div>
          } />
          <Route path="cart" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
              <p>Cart management coming soon...</p>
            </div>
          } />
        </Route>

        {/* Admin/Staff Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'chef', 'waiter']}>
            <MainLayout>
              <DashboardRoute />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/menu" element={
          <ProtectedRoute allowedRoles={['admin', 'chef', 'waiter']}>
            <MainLayout>
              <MenuRoute />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['admin', 'chef', 'waiter']}>
            <MainLayout>
              <OrderManagement />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['admin', 'chef']}>
            <MainLayout>
              <AnalyticsDashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/waste" element={
          <ProtectedRoute allowedRoles={['admin', 'chef']}>
            <MainLayout>
              <WasteManagement />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['admin', 'chef']}>
            <MainLayout>
              <InventoryManagement />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reservations" element={
          <ProtectedRoute allowedRoles={['admin', 'waiter']}>
            <MainLayout>
              <ReservationManagement />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout>
              <UserManagement />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout>
              <ReportsManagement />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout>
              <SettingsManagement />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/public" replace />} />
        
        {/* Redirect any unknown routes */}
        <Route path="*" element={<Navigate to="/public" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
