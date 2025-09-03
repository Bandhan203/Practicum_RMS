import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChefHat, Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { RestaurantLogo } from '../common/RestaurantLogo';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: 'admin@restaurant.com',
    password: 'password'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect based on user role
      const { role } = result.user;
      
      switch (role) {
        case 'admin':
        case 'chef':
        case 'waiter':
          navigate('/dashboard');
          break;
        case 'customer':
          navigate('/customer/dashboard');
          break;
        default:
          navigate('/');
      }
    }
  };

  const demoAccounts = [
    { email: 'admin@restaurant.com', role: 'Admin', password: 'password' },
    { email: 'chef@restaurant.com', role: 'Chef', password: 'password' },
    { email: 'waiter@restaurant.com', role: 'Waiter', password: 'password' }
  ];

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
    setFormErrors({});
    if (error) clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Landing Page Button */}
        <div className="flex justify-start">
          <Link 
            to="/public"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors border border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center">
          <div className="flex justify-center">
            <RestaurantLogo className="w-16 h-16" fillColor="#C92E33" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Smart Dine
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your restaurant management account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                    formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                    formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign in
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Accounts:</h3>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => fillDemoCredentials(account.email, account.password)}
                className="text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-red-200"
              >
                <div className="font-medium text-gray-900">{account.role}</div>
                <div className="text-sm text-gray-500">{account.email}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              to="/signup" 
              className="font-medium text-red-600 hover:text-red-500 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
