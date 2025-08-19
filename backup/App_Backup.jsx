import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/Auth/ProtectedRoute';
import { LoginForm } from './components/Auth/LoginForm';
import { CustomerLanding } from './pages/CustomerLanding';
import { FullMenu } from './pages/FullMenu';

// Simple Welcome Page for testing
function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Smart Dine!</h1>
        <p className="text-gray-600 mb-6">Authentication system is working perfectly!</p>
        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
          <a
            href="/public"
            className="block w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Public Site
          </a>
        </div>
      </div>
    </div>
  );
}

// Simple Dashboard for testing
function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">You are successfully logged in!</h2>
          <p className="text-gray-600 mb-4">The authentication system is working correctly.</p>
          <button 
            onClick={() => {
              localStorage.removeItem('restaurant_user');
              window.location.href = '/';
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/public" element={<CustomerLanding />} />
            <Route path="/public/menu" element={<FullMenu />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } />
            
            {/* Protected Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SimpleDashboard />
              </ProtectedRoute>
            } />
            
            {/* Welcome/Test Route */}
            <Route path="/welcome" element={<WelcomePage />} />
            
            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
