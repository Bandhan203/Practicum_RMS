# Smart Dine POS - Visual UI Component Mapping (দৃশ্যমান গাইড)

## 🖼️ Page-wise UI Component Location Guide

### 🏠 Landing Page (প্রথম পেজ) - http://localhost:5174/
```
File: src/pages/LandingPage.jsx
└── Hero Section        → components/Landing/Hero.jsx
└── Features Section    → components/Landing/Features.jsx  
└── About Section       → components/Landing/About.jsx
└── Contact Section     → components/Landing/Contact.jsx
└── Footer             → components/Landing/Footer.jsx
```

### 🔑 Login Page - http://localhost:5174/login
```
File: src/components/Auth/LoginForm.jsx

UI Elements:
├── "Smart Dine POS" Title
├── Email Input Field
├── Password Input Field  
├── "Remember Me" Checkbox
├── "Login" Button
├── "Sign Up" Link
└── Demo Account Buttons
```

### 🏠 Admin Dashboard - http://localhost:5174/dashboard
```
File: src/components/Dashboard/ProfessionalDashboard.jsx

UI Elements:
├── Header Cards (Today's Sales, Orders, etc.)
├── Revenue Chart
├── Popular Items List
├── Recent Orders Table
├── Low Stock Alerts
└── Quick Action Buttons
```

### 🍽️ Menu Management - http://localhost:5174/admin/menu  
```
File: src/components/Menu/BackendMenuManagement.jsx

UI Elements:
├── "Add New Item" Button (top-right)
├── Search Bar
├── Category Filter Dropdown
├── View Toggle (Grid/List)
├── Menu Items Cards/List
│   ├── Item Image
│   ├── Item Name & Description
│   ├── Price & Category
│   ├── Available/Unavailable Toggle
│   ├── Edit Button (pencil icon)
│   └── Delete Button (trash icon)
├── Add/Edit Modal
│   ├── Item Name Input
│   ├── Description Textarea
│   ├── Price Input
│   ├── Category Select
│   ├── Preparation Time
│   ├── Image Upload
│   └── Available Checkbox
└── Statistics Cards (Total Items, Categories, etc.)
```

### 📝 Order Management - http://localhost:5174/admin/orders
```
File: src/components/Orders/SimpleOrderManagement.jsx

UI Elements:
├── "Add New Order" Button (top-right)
├── Status Filter Buttons (All, Pending, Preparing, etc.)
├── Order Type Filter (Dine-in, Takeaway, Delivery)
├── Orders Table
│   ├── Order Number
│   ├── Customer Name
│   ├── Order Type & Table
│   ├── Items Count
│   ├── Total Amount
│   ├── Status Badge
│   ├── Actions (View, Edit, Delete)
│   └── Status Change Dropdown
├── Order Details Modal
│   ├── Customer Information
│   ├── Order Items List
│   ├── Special Instructions
│   ├── Total Calculation
│   └── Status History
└── Add Order Modal (components/Orders/AddOrderModal.jsx)
    ├── Customer Info Form
    ├── Order Type Selection
    ├── Menu Items Selection
    ├── Quantity Controls
    └── Submit Button
```

### 💰 Billing System - http://localhost:5174/admin/billing
```
File: src/components/Billing/ProfessionalBillingSystem.jsx

UI Elements:
├── Bills Summary Cards
├── "Generate New Bill" Button
├── Bills Table
│   ├── Bill Number
│   ├── Order Reference
│   ├── Customer Name
│   ├── Amount
│   ├── Payment Status
│   ├── Payment Method
│   └── Actions (View, Print, Process Payment)
├── Payment Processing Modal
│   ├── Payment Method Selection
│   ├── Amount Input
│   ├── Reference Number
│   └── Process Button
├── Bill Details Modal
│   ├── Bill Information
│   ├── Order Items Breakdown
│   ├── Tax & Service Charges
│   ├── Total Calculation
│   └── Print Button
└── Completed Orders Section
    └── Orders Ready for Billing
```

### 📦 Inventory Management - http://localhost:5174/admin/inventory
```
File: src/components/Inventory/InventoryManagement.jsx

UI Elements:
├── "Add New Item" Button
├── Search & Filter Controls
├── Low Stock Alerts Panel
├── Inventory Items Table
│   ├── Item Name
│   ├── Category
│   ├── Current Stock
│   ├── Minimum Stock Level
│   ├── Unit Price
│   ├── Status (In Stock/Low Stock/Out of Stock)
│   └── Actions (Edit, Adjust Stock, Delete)
├── Stock Adjustment Modal
│   ├── Current Quantity Display
│   ├── New Quantity Input
│   ├── Adjustment Reason
│   └── Submit Button
├── Add/Edit Item Modal
│   ├── Item Name
│   ├── Category
│   ├── Initial Stock
│   ├── Minimum Stock Level
│   ├── Unit & Cost Price
│   └── Supplier Information
└── Statistics Dashboard
    ├── Total Items
    ├── Low Stock Items
    ├── Total Value
    └── Recent Adjustments
```

### 📊 Analytics & Reports - http://localhost:5174/admin/analytics
```
File: src/components/Analytics/ProfessionalAnalytics.jsx

UI Elements:
├── Date Range Picker
├── Export Options Dropdown (PDF, CSV, Excel)
├── Dashboard Metrics Cards
│   ├── Total Revenue
│   ├── Total Orders  
│   ├── Average Order Value
│   └── Customer Count
├── Revenue Trend Chart
├── Popular Items Chart
├── Sales by Category Chart
├── Order Status Distribution
├── Payment Methods Chart
├── Peak Hours Analysis
├── Top Customers Table
└── Recent Reports List
```

### ⚙️ Settings - http://localhost:5174/admin/settings
```
File: src/components/Settings/DynamicSettingsManagement.jsx

UI Elements:
├── Settings Categories Tabs
│   ├── General Settings
│   ├── Business Information
│   ├── Payment Configuration
│   ├── Tax & Charges
│   └── Notifications
├── General Settings Tab
│   ├── Restaurant Name
│   ├── Address & Contact
│   ├── Operating Hours
│   └── Currency Selection
├── Business Information Tab
│   ├── Logo Upload
│   ├── Business License
│   ├── Description
│   └── Social Media Links
├── Payment Configuration Tab
│   ├── Accepted Payment Methods
│   ├── Minimum Amounts
│   └── Gateway Settings
├── Tax & Charges Tab
│   ├── Tax Rate Percentage
│   ├── Service Charge
│   └── Discount Settings
└── Notifications Tab
    ├── Email Notifications
    ├── SMS Notifications
    ├── Push Notifications
    └── Alert Preferences
```

---

## 🎨 Layout Components (সব পেজে দেখা যায়)

### 🔝 Header Component
```
File: src/components/Layout/Header.jsx

UI Elements:
├── Menu Toggle Button (mobile)
├── Restaurant Logo/Name
├── Page Title (dynamic)
├── Search Bar (if enabled)
├── Notifications Bell Icon
├── User Profile Dropdown
│   ├── Profile Picture
│   ├── Admin Name
│   ├── "Settings" Link
│   └── "Logout" Button
└── Current Time Display
```

### 📋 Sidebar Component  
```
File: src/components/Layout/Sidebar.jsx

UI Elements:
├── Panel Title ("Admin Panel")
├── Navigation Menu Items
│   ├── 🏠 Dashboard
│   ├── 🍽️ Menu Management
│   ├── 📝 Order Management  
│   ├── 📦 Inventory Management
│   ├── 📊 Analytics & Reports
│   ├── 💰 Billing System
│   └── ⚙️ Settings
├── Active Item Highlight
└── User Info Footer
    ├── Admin Avatar
    ├── "Admin" Text
    ├── "System Administrator"
    └── Logout Icon
```

---

## 🔍 কিভাবে Specific Element খুঁজবেন

### Method 1: Browser Inspect করে
```
1. F12 চাপুন → Developer Tools খুলবে
2. Elements tab এ যান
3. Select element tool (pointer) ক্লিক করুন  
4. যে UI element পরিবর্তন করতে চান সেখানে ক্লিক করুন
5. HTML code দেখুন এবং class names note করুন
6. VS Code এ Ctrl+Shift+F দিয়ে সেই class/text খুঁজুন
```

### Method 2: Text Content দিয়ে খুঁজুন
```
1. VS Code এ Ctrl+Shift+F চাপুন
2. UI তে যে text দেখছেন সেটা type করুন
3. কোন file এ match পাবেন দেখুন
4. সেই file open করে edit করুন
```

### Method 3: Component Name দিয়ে খুঁজুন
```
1. Browser console এ React Developer Tools install করুন
2. Components tab দেখুন
3. Component name পাবেন
4. সেই component file খুঁজুন
```

---

## 🎯 Common UI Elements এর Quick Reference

### 🔘 Buttons
```
Primary Button: "bg-red-600 hover:bg-red-700 text-white"
Secondary Button: "bg-gray-200 hover:bg-gray-300 text-gray-800"  
Success Button: "bg-green-600 hover:bg-green-700 text-white"
Danger Button: "bg-red-600 hover:bg-red-700 text-white"
```

### 📝 Form Elements
```
Input Field: "border border-gray-300 rounded-md px-3 py-2"
Select Dropdown: "border border-gray-300 rounded-md px-3 py-2"
Textarea: "border border-gray-300 rounded-md px-3 py-2"
Checkbox: "rounded border-gray-300"
```

### 📊 Cards & Containers
```
Card: "bg-white rounded-lg shadow border"
Stats Card: "bg-white p-6 rounded-lg shadow"
Modal: "fixed inset-0 bg-black bg-opacity-50"
Table: "min-w-full divide-y divide-gray-200"
```

### 🏷️ Status Badges
```
Success: "bg-green-100 text-green-800"
Warning: "bg-yellow-100 text-yellow-800"  
Error: "bg-red-100 text-red-800"
Info: "bg-blue-100 text-blue-800"
```

---

## 🚀 Quick Edit Examples

### Dashboard Title পরিবর্তন করতে:
```javascript
// File: src/components/Dashboard/ProfessionalDashboard.jsx
// Line খুঁজুন যেখানে লেখা আছে:
<h1 className="text-2xl font-bold text-gray-900">
  Restaurant Dashboard  // এই text পরিবর্তন করুন
</h1>
```

### Menu Item Card এর Design পরিবর্তন করতে:
```javascript
// File: src/components/Menu/BackendMenuManagement.jsx
// Menu item card এর structure খুঁজুন:
<div className="bg-white rounded-lg shadow-md"> // এই classes পরিবর্তন করুন
```

### Sidebar Menu Item যোগ করতে:
```javascript
// File: src/components/Layout/Sidebar.jsx
// menuItems array খুঁজুন এবং নতুন item যোগ করুন:
const menuItems = [
  // existing items...
  { id: 'reports', label: 'Reports', icon: FileText }, // নতুন item
];
```

এই গাইড ব্যবহার করে আপনি যেকোনো UI element সহজেই খুঁজে পেয়ে edit করতে পারবেন! 🎯