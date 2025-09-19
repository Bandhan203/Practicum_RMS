import React from 'react';

// Test component to verify all imports work
import { MenuManagement } from './Menu/MenuManagement';
import { OrderManagement } from './Orders/OrderManagement';
import { UserManagement } from './Users/UserManagement';
import { BillingSystem } from './Billing/BillingSystem';
import { AdminDashboard } from './Dashboard/AdminDashboard';
import { ChefDashboard } from './Dashboard/ChefDashboard';
import { StaffDashboard } from './Dashboard/StaffDashboard';
import { SettingsManagement } from './Settings/SettingsManagement';
import { Header } from './Layout/Header';
import Sidebar from './Layout/Sidebar';

export function TestComponent() {
  return (
    <div>
      <h1>All Components Test</h1>
      <p>If you see this, all components are imported correctly!</p>
      <ul>
        <li>✅ MenuManagement</li>
        <li>✅ OrderManagement</li>
        <li>✅ UserManagement</li>
        <li>✅ BillingSystem</li>
        <li>✅ AdminDashboard</li>
        <li>✅ ChefDashboard</li>
        <li>✅ StaffDashboard</li>
        <li>✅ SettingsManagement</li>
        <li>✅ Header</li>
        <li>✅ Sidebar</li>
      </ul>
    </div>
  );
}