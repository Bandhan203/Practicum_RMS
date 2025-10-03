# Component Usage & Dependencies Map (কোথায় কী ব্যবহার হয়)

## 🔗 Component Relationship & Usage Guide

### 🏠 App.jsx - Main App Structure
```javascript
App.jsx (মূল ফাইল)
├── AuthProvider (contexts/AuthContext.jsx)
├── ApiAppProvider (contexts/ApiAppContext.jsx)  
├── AppProvider (contexts/AppContext.jsx)
├── SettingsProvider (contexts/SettingsContext.jsx)
├── Routes:
│   ├── "/" → LandingPage (pages/LandingPage.jsx)
│   ├── "/login" → LoginForm (components/Auth/LoginForm.jsx)
│   ├── "/signup" → SignupPage (pages/SignupPage.jsx)
│   └── "/dashboard/*" → MainLayout
│       └── MainLayout Component:
│           ├── Header (components/Layout/Header.jsx)
│           ├── Sidebar (components/Layout/Sidebar.jsx)
│           └── Content Routes:
│               ├── "/dashboard" → ProfessionalDashboard
│               ├── "/menu" → BackendMenuManagement
│               ├── "/orders" → SimpleOrderManagement
│               ├── "/inventory" → InventoryManagement
│               ├── "/analytics" → ProfessionalAnalytics
│               ├── "/billing" → ProfessionalBillingSystem
│               └── "/settings" → DynamicSettingsManagement
```

---

## 📱 Individual Component Dependencies

### 🏠 ProfessionalDashboard.jsx
```javascript
Used Components:
├── StatCard (components/common/StatCard.jsx)
├── ChartCard (components/common/ChartCard.jsx)  
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── Icons from Lucide React
├── Charts from Recharts library

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
├── useApp (contexts/AppContext.jsx)
└── useApiApp (contexts/ApiAppContext.jsx)

Used Services:
├── analyticsAPI (services/analyticsAPI.js)
├── orderService (services/orderService.js)
└── unifiedPOSAPI (services/unifiedPOSAPI.js)
```

### 🍽️ BackendMenuManagement.jsx
```javascript
Used Components:
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── Icons (Plus, Edit, Trash2, Star, etc.)

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
└── Redux Store (store/features/menuSlice.js)

Used Services:
├── menuAPI (services/api.js)
└── API calls to /api/menu-items

Modal Components:
└── Built-in Add/Edit Item Modal (same file)
```

### 📝 SimpleOrderManagement.jsx  
```javascript
Used Components:
├── AddOrderModal (components/Orders/AddOrderModal.jsx)
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── Icons (Clock, CheckCircle, XCircle, etc.)

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
└── Redux Store (store/features/orderSlice.js)

Used Services:
├── Order API calls
└── Menu API calls (for order creation)

Child Components:
└── AddOrderModal
    ├── Uses menuSlice for menu items
    ├── Uses orderSlice for order creation
    └── Form validation & submission
```

### 💰 ProfessionalBillingSystem.jsx
```javascript
Used Components:
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── DateRangePicker (components/common/DateRangePicker.jsx)
├── Icons (CreditCard, FileText, Printer, etc.)

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
└── useApp (contexts/AppContext.jsx)

Used Services:
├── billingAPI (services/billingAPI.js)
├── orderService (services/orderService.js)
└── PDF generation utilities

Built-in Modals:
├── Payment Processing Modal
├── Bill Details Modal
└── Generate Bill Modal
```

### 📦 InventoryManagement.jsx
```javascript
Used Components:
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── StatCard (components/common/StatCard.jsx)
├── Icons (Package, AlertTriangle, TrendingUp, etc.)

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
└── useApp (contexts/AppContext.jsx)

Used Services:
├── Inventory API calls
└── Statistics calculations

Built-in Modals:
├── Add Item Modal
├── Edit Item Modal
└── Stock Adjustment Modal
```

### 📊 ProfessionalAnalytics.jsx
```javascript
Used Components:
├── ChartCard (components/common/ChartCard.jsx)
├── StatCard (components/common/StatCard.jsx)
├── DateRangePicker (components/common/DateRangePicker.jsx)
├── ExportOptions (components/common/ExportOptions.jsx)
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── Charts from Recharts (BarChart, LineChart, PieChart)

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
└── useApp (contexts/AppContext.jsx)

Used Services:
├── analyticsAPI (services/analyticsAPI.js)
├── Export services
└── Data processing utilities
```

### ⚙️ DynamicSettingsManagement.jsx
```javascript
Used Components:
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── Icons (Settings, Save, RefreshCw, etc.)

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
├── useSettings (contexts/SettingsContext.jsx)
└── useApp (contexts/AppContext.jsx)

Used Services:
├── settingsAPI (services/settingsAPI.js)
└── Configuration management

Features:
├── Tabbed interface for different setting categories
├── Form validation
├── Batch settings update
└── Real-time preview
```

---

## 🎨 Layout Components Dependencies

### 🔝 Header.jsx
```javascript
Used Components:
├── RestaurantLogo (components/common/RestaurantLogo.jsx)
├── Icons (Menu, Bell, User, LogOut)

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
└── useResponsive (hooks/useResponsive.js)

Features:
├── Mobile responsive hamburger menu
├── User profile dropdown
├── Notifications (if implemented)
└── Logout functionality
```

### 📋 Sidebar.jsx
```javascript
Used Components:
├── Icons (Home, ShoppingCart, Menu, Users, etc.)
├── User avatar/profile section

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
├── useResponsive (hooks/useResponsive.js)
└── React Router (useNavigate, useLocation)

Features:
├── Active menu item highlighting
├── Mobile responsive collapse/expand
├── User info display at bottom
└── Logout functionality
```

---

## 🔐 Authentication Components

### 🔑 LoginForm.jsx
```javascript
Used Components:
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── Icons (Eye, EyeOff for password visibility)

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
└── React Router (useNavigate)

Features:
├── Form validation
├── Remember me functionality
├── Demo account buttons
├── Error handling
└── Redirect after login
```

### 📝 SignupForm.jsx
```javascript
Used Components:
├── LoadingSpinner (components/common/LoadingSpinner.jsx)
├── Password strength indicator

Used Contexts:
├── useAuth (contexts/AuthContext.jsx)
└── React Router (useNavigate)

Features:
├── Form validation
├── Password strength checking
├── Admin role assignment (simplified)
└── Redirect after signup
```

---

## 🛠️ Common/Shared Components Usage

### 📊 StatCard.jsx (Statistics Cards)
```javascript
Used in:
├── ProfessionalDashboard.jsx (revenue, orders, customers)
├── InventoryManagement.jsx (stock levels, alerts)
├── ProfessionalAnalytics.jsx (analytics metrics)
└── Any component needing metric display

Props:
├── title (string)
├── value (string/number)  
├── icon (React component)
├── color (string)
└── trend (optional)
```

### 📈 ChartCard.jsx (Chart Container)
```javascript
Used in:
├── ProfessionalDashboard.jsx (revenue charts)
├── ProfessionalAnalytics.jsx (all analytics charts)
└── Any component needing chart display

Props:
├── title (string)
├── children (chart component)
├── height (optional)
└── loading (boolean)
```

### ⏳ LoadingSpinner.jsx
```javascript
Used in:
├── All data-fetching components
├── Form submission states
├── Page loading states
└── Modal loading states

Props:
├── size (small, medium, large)
└── color (optional)
```

### 🎭 Icons.jsx (Icon Definitions)
```javascript
Re-exports from Lucide React:
├── Navigation icons (Home, Menu, Settings)
├── Action icons (Plus, Edit, Trash, Save)
├── Status icons (Check, X, Alert, Info)
├── Business icons (ShoppingCart, Package, CreditCard)
└── User icons (User, LogIn, LogOut)

Used everywhere for consistent iconography
```

---

## 🌐 API Services Usage Map

### 🔌 api.js (Main API Service)
```javascript
Used by:
├── All components making API calls
├── Redux slices for async actions
└── Service-specific API files

Features:
├── JWT token management
├── Request/response interceptors
├── Error handling
└── Base URL configuration
```

### 🍽️ menuService.js
```javascript
Used by:
├── BackendMenuManagement.jsx
├── AddOrderModal.jsx (for menu items)
├── menuSlice.js (Redux)
└── Any component needing menu data
```

### 📝 orderService.js
```javascript
Used by:
├── SimpleOrderManagement.jsx
├── ProfessionalBillingSystem.jsx
├── orderSlice.js (Redux)
└── Dashboard components (for metrics)
```

### 💰 billingAPI.js
```javascript
Used by:
├── ProfessionalBillingSystem.jsx
├── Dashboard components (for revenue)
└── Analytics components (for financial data)
```

---

## 🏪 Redux Store Usage

### 🔐 authSlice.js
```javascript
Used by:
├── All protected components (for user data)
├── LoginForm.jsx (for authentication)
├── Header.jsx (for user display)
└── ProtectedRoute.jsx (for route protection)
```

### 🍽️ menuSlice.js
```javascript
Used by:
├── BackendMenuManagement.jsx (main usage)
├── AddOrderModal.jsx (for menu selection)
└── Any component displaying menu items
```

### 📝 orderSlice.js
```javascript
Used by:
├── SimpleOrderManagement.jsx (main usage)
├── Dashboard components (for order metrics)
└── Billing components (for order data)
```

---

## 🎯 Quick Component Location Reference

### যদি আপনি খুঁজছেন:

#### 🎨 **UI Design/Styling**
- **Colors & Themes**: `tailwind.config.js` + individual component files
- **Global Styles**: `src/index.css`
- **Responsive Design**: `src/styles/responsive.css`

#### 📱 **Page Layouts**
- **Main Layout**: `src/App.jsx` (MainLayout component)
- **Header**: `src/components/Layout/Header.jsx`
- **Sidebar**: `src/components/Layout/Sidebar.jsx`

#### 🔧 **Functionality**
- **Authentication**: `src/contexts/AuthContext.jsx`
- **API Calls**: `src/services/` folder
- **State Management**: `src/store/` folder
- **Business Logic**: Individual component files

#### 🚀 **Performance**
- **Loading States**: `src/components/common/LoadingSpinner.jsx`
- **Error Handling**: `src/components/common/ErrorBoundary.jsx`
- **Caching**: Redux store + Context APIs

এই গাইড ব্যবহার করে আপনি যেকোনো component এর dependency বুঝতে পারবেন এবং সঠিক জায়গায় edit করতে পারবেন! 🎯