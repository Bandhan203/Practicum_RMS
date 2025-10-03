# Smart Dine POS - Restaurant Point of Sale System

A simplified, powerful Point of Sale (POS) System designed specifically for small to medium restaurants. Built with modern technologies and focused on admin-controlled restaurant operations.

## 🏪 System Overview
This is a **single-admin POS system** where the restaurant owner/manager has complete control over all operations including menu management, order processing, billing, inventory tracking, and analytics.

## ✨ Core Features
- **Complete Restaurant Management**: Single admin interface for all operations
- **Menu Management**: Create, edit, and manage all menu items with categories
- **Order Processing**: Take orders, track status, and manage kitchen workflow
- **Real-time Billing**: Generate bills, process payments, and print receipts
- **Inventory Control**: Track stock levels, manage supplies, and set alerts
- **Analytics Dashboard**: Sales reports, popular items, revenue tracking
- **Settings Management**: Restaurant configuration and system preferences

## 🛠️ Technology Stack
- **Frontend**: React 18 + Redux Toolkit + Vite + Tailwind CSS
- **Backend**: Laravel 10+ + PHP + SQLite/MySQL
- **Authentication**: Laravel Sanctum (JWT Tokens)
- **UI Components**: Lucide Icons + Custom Components
- **Charts & Reports**: Recharts library + PDF generation

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- PHP 8.1+ and Composer
- SQLite (default) or MySQL/PostgreSQL

### Backend Setup (Laravel API)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run database migrations and seeders
php artisan migrate
php artisan db:seed

# Start the API server
php artisan serve --port=8000
```

### Frontend Setup (React App)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000/api
- **Default Admin**: admin@restaurant.com / password

## 📋 System Modules

### 1. 🍽️ Menu Management
- Add/edit/delete menu items
- Organize items by categories
- Set prices, preparation time, and availability
- Upload item images
- Track popular items

### 2. 📝 Order Processing
- Create new orders (dine-in, takeaway, delivery)
- Real-time order status tracking
- Kitchen workflow management
- Order modifications and cancellations
- Customer information management

### 3. 💰 Billing System
- Automatic bill generation from completed orders
- Multiple payment methods (cash, card, digital)
- Tax and service charge calculations
- Receipt printing and email
- Payment tracking and history

### 4. 📦 Inventory Management
- Stock level monitoring
- Low stock alerts and notifications
- Supplier management
- Cost tracking and waste logging
- Automatic menu item availability updates

### 5. 📊 Analytics & Reports
- Daily/weekly/monthly sales reports
- Popular items and customer preferences
- Revenue tracking and profit margins
- Staff performance insights
- Export reports (PDF, CSV, Excel)

### 6. ⚙️ System Settings
- Restaurant information and branding
- Tax rates and service charges
- Payment method configuration
- Notification preferences
- User account management

## 🏗️ Architecture

### Admin-Only Access Model
- **Single Role**: All users are system administrators
- **Full Access**: Complete control over all restaurant operations
- **Simplified Workflow**: No role-based restrictions or complex permissions
- **Easy Management**: Single interface for all POS functions

### Data Flow
```
Admin Interface → React Components → Redux Store → API Calls → Laravel Backend → Database
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Smart Dine POS
```

### Database Configuration
The system uses SQLite by default. To use MySQL/PostgreSQL, update the `backend/.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smart_dine_pos
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## 📱 Features Overview

### Dashboard
- Real-time sales metrics
- Today's orders and revenue
- Quick access to all modules
- System status indicators

### Order Workflow
1. **Order Creation**: Take customer orders with menu selection
2. **Kitchen Processing**: Track preparation status
3. **Order Completion**: Mark as ready and notify customer
4. **Billing**: Generate and process payment
5. **Receipt**: Print or email receipt to customer

### Inventory Tracking
- Automatic stock deduction with orders
- Low stock alerts when items run low
- Supplier management for restocking
- Cost analysis and profit tracking

## 🚢 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Deploy to hosting provider (Netlify, Vercel, etc.)
# Deploy Laravel backend to web hosting
```

### Environment Setup
- Configure production API URLs
- Set up SSL certificates
- Configure database connections
- Set up backup procedures

## 🔐 Security Features
- JWT token-based authentication
- Secure password hashing
- Input validation and sanitization
- CORS protection
- SQL injection prevention

## 📞 Support & Documentation
- Complete API documentation in `/backend/README.md`
- Frontend component documentation in source files
- Database schema documentation in migration files

## 📄 License
MIT License - Feel free to use this system for your restaurant business.
