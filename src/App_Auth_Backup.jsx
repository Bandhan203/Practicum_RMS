import React, { useState } from 'react';

// Simple authentication simulation
const useSimpleAuth = () => {
  const [user, setUser] = useState(null);
  
  const login = (email, password) => {
    // Simple demo login
    if (email === 'admin@test.com' && password === 'password') {
      setUser({ email, name: 'Admin User' });
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return { user, login, logout };
};

// Login Component
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin(email, password)) {
      setError('');
    } else {
      setError('Invalid credentials. Try admin@test.com / password');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          🍽️ Smart Dine Login
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="admin@test.com"
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="password"
              required
            />
          </div>
          
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '20px', 
              padding: '10px',
              backgroundColor: '#ffe6e6',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Login
          </button>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e9f7fe', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>Demo Credentials:</strong><br />
          Email: admin@test.com<br />
          Password: password
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ user, onLogout }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h1 style={{ color: '#333', marginBottom: '20px' }}>
            🎉 Welcome to Smart Dine Dashboard!
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '15px' }}>
            Hello <strong>{user.name}</strong> ({user.email})
          </p>
          <p style={{ color: '#666', marginBottom: '25px' }}>
            🚀 Authentication is working perfectly! You're successfully logged in.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e8f5e8', 
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2d5a2d' }}>✅ Login System</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Working</p>
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>🔐 Authentication</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Active</p>
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#d1ecf1', 
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>📱 React App</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Running</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
        
        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#155724' }}>
            🎯 Next Steps for Your Restaurant Management System:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#155724' }}>
            <li>✅ Authentication System - <strong>COMPLETED</strong></li>
            <li>📋 Menu Management</li>
            <li>📦 Order Management</li>
            <li>👥 User Management</li>
            <li>📊 Analytics Dashboard</li>
            <li>🏪 Inventory Management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const { user, login, logout } = useSimpleAuth();

  return (
    <div>
      {user ? (
        <Dashboard user={user} onLogout={logout} />
      ) : (
        <LoginPage onLogin={login} />
      )}
    </div>
  );
}

export default App;
