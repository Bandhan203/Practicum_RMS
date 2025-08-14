import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import LandingPage from './components/Landing/LandingPage';
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

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Customer Protected Route Component
function CustomerProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect non-customers away from customer portal
  if (user?.role !== 'customer') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Admin Protected Route Component (for admin/chef/waiter)
function AdminProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect customers to customer portal
  if (user?.role === 'customer') {
    return <Navigate to="/customer" replace />;
  }
  
  return children;
}

// Public Route Component (redirect to appropriate dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return children;
  }
  
  // Redirect to appropriate dashboard based on role
  if (user?.role === 'customer') {
    return <Navigate to="/customer" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
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

  // Render the appropriate component based on current route
  const renderContent = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/dashboard':
        return <DashboardRoute />;
      case '/menu':
        return <MenuRoute />;
      case '/orders':
        return <OrderManagement />;
      case '/analytics':
        return <AnalyticsDashboard />;
      case '/waste':
        return <WasteManagement />;
      case '/inventory':
        return <InventoryManagement />;
      case '/reservations':
        return <ReservationManagement />;
      case '/users':
        return <UserManagement />;
      case '/reports':
        return <ReportsManagement />;
      case '/settings':
        return <SettingsManagement />;
      case '/loyalty':
        return <CustomerDashboard />;
      default:
        return <DashboardRoute />;
    }
  };

  return (
    <div className="pt-16">
      <Header toggleSidebar={toggleSidebar} />
      <div className="relative">
        <Sidebar />
        <main className={getMainContentClass()}>
          <div className="h-full overflow-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Landing Page - accessible without login */}
        <Route path="/public" element={<CustomerLanding />} />
        <Route path="/public/menu" element={<FullMenu />} />
        <Route path="/public/about" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-900">About Us - Coming Soon</h1></div>} />
        <Route path="/public/contact" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-900">Contact Us - Coming Soon</h1></div>} />

        {/* Landing Page - only for non-authenticated users */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              user?.role === 'customer' ? <Navigate to="/customer" replace /> : <Navigate to="/dashboard" replace />
            ) : <Navigate to="/public" replace />
          } 
        />
        
        {/* Login Page */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } 
        />
        
        {/* Signup Page */}
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupForm />
            </PublicRoute>
          } 
        />
        
        {/* Customer Portal Routes */}
        <Route 
          path="/customer/*" 
          element={
            <CustomerProtectedRoute>
              <CustomerLayout />
            </CustomerProtectedRoute>
          }
        >
          <Route index element={<CustomerPortalDashboard />} />
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="orders" element={<div className="p-6"><h1 className="text-2xl font-bold">Customer Orders</h1><p>Order tracking and history coming soon...</p></div>} />
          <Route path="reservations" element={<div className="p-6"><h1 className="text-2xl font-bold">Reservations</h1><p>Table reservation system coming soon...</p></div>} />
          <Route path="loyalty" element={<div className="p-6"><h1 className="text-2xl font-bold">Loyalty Program</h1><p>Rewards and points system coming soon...</p></div>} />
          <Route path="reviews" element={<div className="p-6"><h1 className="text-2xl font-bold">Reviews</h1><p>Review system coming soon...</p></div>} />
          <Route path="support" element={<div className="p-6"><h1 className="text-2xl font-bold">Customer Support</h1><p>Help and support system coming soon...</p></div>} />
          <Route path="cart" element={<div className="p-6"><h1 className="text-2xl font-bold">Shopping Cart</h1><p>Cart management coming soon...</p></div>} />
        </Route>
        
        {/* Admin/Staff Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/menu" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/waste" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/reservations" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/loyalty" 
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? (user?.role === 'customer' ? "/customer" : "/dashboard") : "/"} replace />} />
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
