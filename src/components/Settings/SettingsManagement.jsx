import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Mail,
  Smartphone,
  Clock,
  DollarSign,
  Percent,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Download,
  Upload,
  AlertTriangle,
  Info,
  Store,
  CreditCard,
  Package,
  ChevronDown,
  ChevronRight,
  Monitor,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Zap,
  FileText,
  Calendar
} from 'lucide-react';

export function SettingsManagement() {
  const { appSettings, updateSettings, resetSettings, exportSettings, importSettings } = useApp();

  // Ensure appSettings has all required sections with defaults
  const safeSettings = {
    general: {
      restaurantName: 'My Restaurant',
      restaurantPhone: '+880 1234567890',
      restaurantEmail: 'info@myrestaurant.com',
      restaurantAddress: '123 Main Street, Dhaka, Bangladesh',
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      ...appSettings?.general
    },
    business: {
      openingHours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: false }
      },
      maxTableCapacity: 50,
      reservationAdvanceDays: 30,
      serviceCharge: 10,
      vatRate: 15,
      minimumOrderAmount: 100,
      loyaltyPointsRate: 5,
      ...appSettings?.business
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderAlerts: true,
      inventoryAlerts: true,
      paymentAlerts: true,
      systemAlerts: true,
      marketingEmails: false,
      weeklyReports: true,
      ...appSettings?.notifications
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      dataBackupFrequency: 'daily',
      twoFactorAuth: false,
      ipWhitelist: false,
      auditLogging: true,
      ...appSettings?.security
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      brandColor: '#dc2626',
      showAnimations: true,
      compactMode: false,
      showTooltips: true,
      ...appSettings?.display
    },
    payment: {
      acceptCash: true,
      acceptCard: true,
      acceptMobile: true,
      minimumCardAmount: 50,
      refundPolicy: 'full',
      tipSuggestions: [10, 15, 20],
      autoCalculateTip: false,
      splitBillEnabled: true,
      ...appSettings?.payment
    },
    inventory: {
      lowStockThreshold: 10,
      criticalStockThreshold: 5,
      autoReorder: false,
      trackExpiry: true,
      batchTracking: false,
      ...appSettings?.inventory
    }
  };

  const [activeTab, setActiveTab] = useState('general');
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    business: false,
    notifications: false,
    security: false,
    display: false,
    payment: false,
    inventory: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const fileInputRef = useRef(null);

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'business', label: 'Business', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'inventory', label: 'Inventory', icon: Package }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSettingChange = (category, setting, value) => {
    updateSettings(category, { [setting]: value });
  };

  const handleNestedSettingChange = (category, parentSetting, setting, value) => {
    const currentSettings = appSettings[category];
    updateSettings(category, {
      [parentSetting]: {
        ...currentSettings[parentSetting],
        [setting]: value
      }
    });
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Prepare settings data for API
      const settingsToSave = [];

      // Convert current settings to API format
      Object.entries(settings).forEach(([category, categorySettings]) => {
        Object.entries(categorySettings).forEach(([key, value]) => {
          settingsToSave.push({
            key: `${category}_${key}`,
            value: String(value),
            type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
            category: category,
            description: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`,
            is_public: category === 'general' // Make general settings public
          });
        });
      });

      // Save to backend
      const response = await fetch('http://localhost:8000/api/settings/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToSave })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const result = await response.json();

      if (result.success) {
        setSaveMessage('Settings saved successfully to database!');
        // Update context with saved settings
        updateSettings(settings);
      } else {
        throw new Error(result.message || 'Failed to save settings');
      }

      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Settings save error:', error);
      setSaveMessage('Error saving settings to database. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = (category) => {
    if (window.confirm(`Are you sure you want to reset ${category} settings to default values?`)) {
      resetSettings(category);
      setSaveMessage(`${category.charAt(0).toUpperCase() + category.slice(1)} settings reset successfully!`);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = importSettings(e.target.result);
          setSaveMessage(result.message);
          setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
          setSaveMessage('Error importing settings file.');
          setTimeout(() => setSaveMessage(''), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  // Temporarily allow all authenticated users for development
  // if (!user) {
  //   return (
  //     <div className="p-6">
  //       <div className="text-center py-12">
  //         <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
  //         <p className="text-gray-500">Please log in to access system settings.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (user?.role !== 'admin') {
  //   return (
  //     <div className="p-6">
  //       <div className="text-center py-12">
  //         <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
  //         <p className="text-gray-500">You don't have permission to access system settings.</p>
  //         <p className="text-xs text-gray-400 mt-2">Current role: {user?.role || 'undefined'}</p>
  //       </div>
  //     </div>
  //   );
  // }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Restaurant Information</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              value={safeSettings.general.restaurantName}
              onChange={(e) => handleSettingChange('general', 'restaurantName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={safeSettings.general.restaurantPhone}
              onChange={(e) => handleSettingChange('general', 'restaurantPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={safeSettings.general.restaurantEmail}
              onChange={(e) => handleSettingChange('general', 'restaurantEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={appSettings.general.currency}
              onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={appSettings.general.restaurantAddress}
              onChange={(e) => handleSettingChange('general', 'restaurantAddress', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={appSettings.general.timezone}
              onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="Asia/Dhaka">Asia/Dhaka</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={appSettings.general.dateFormat}
              onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="dd/MM/yyyy">DD/MM/YYYY</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Format
            </label>
            <select
              value={appSettings.general.timeFormat}
              onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="24h">24 Hour</option>
              <option value="12h">12 Hour</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h3>
        <div className="space-y-4">
          {Object.entries(appSettings.business.openingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-20">
                <span className="text-sm font-medium text-gray-900 capitalize">{day}</span>
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) => handleNestedSettingChange('business', 'openingHours', day, {
                      ...hours,
                      closed: !e.target.checked
                    })}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Open</span>
                </label>
              </div>

              {!hours.closed && (
                <>
                  <div>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleNestedSettingChange('business', 'openingHours', day, {
                        ...hours,
                        open: e.target.value
                      })}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <span className="text-gray-500">to</span>

                  <div>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleNestedSettingChange('business', 'openingHours', day, {
                        ...hours,
                        close: e.target.value
                      })}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {hours.closed && (
                <span className="text-gray-500 italic">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Rules</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Table Capacity
            </label>
            <input
              type="number"
              value={appSettings.business.maxTableCapacity}
              onChange={(e) => handleSettingChange('business', 'maxTableCapacity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
              max="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reservation Advance Days
            </label>
            <input
              type="number"
              value={appSettings.business.reservationAdvanceDays}
              onChange={(e) => handleSettingChange('business', 'reservationAdvanceDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
              max="365"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Charge (%)
            </label>
            <input
              type="number"
              value={appSettings.business.serviceCharge}
              onChange={(e) => handleSettingChange('business', 'serviceCharge', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
              max="30"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VAT Rate (%)
            </label>
            <input
              type="number"
              value={appSettings.business.vatRate}
              onChange={(e) => handleSettingChange('business', 'vatRate', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
              max="30"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Order Amount (৳)
            </label>
            <input
              type="number"
              value={appSettings.business.minimumOrderAmount}
              onChange={(e) => handleSettingChange('business', 'minimumOrderAmount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loyalty Points Rate
            </label>
            <div className="text-sm text-gray-500 mb-2">Points per ৳100 spent</div>
            <input
              type="number"
              value={appSettings.business.loyaltyPointsRate}
              onChange={(e) => handleSettingChange('business', 'loyaltyPointsRate', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
              max="10"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: Smartphone },
            { key: 'pushNotifications', label: 'Push Notifications', icon: Bell }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.notifications[key]}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'orderNotifications', label: 'New Orders' },
            { key: 'reservationNotifications', label: 'New Reservations' },
            { key: 'inventoryAlerts', label: 'Inventory Updates' },
            { key: 'lowStockAlerts', label: 'Low Stock Alerts' },
            { key: 'wasteAlerts', label: 'Waste Tracking Alerts' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.notifications[key]}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'dailyReports', label: 'Daily Reports', desc: 'Receive daily business summary' },
            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly performance analysis' },
            { key: 'monthlyReports', label: 'Monthly Reports', desc: 'Monthly business insights' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.notifications[key]}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              value={appSettings.security.passwordMinLength}
              onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="6"
              max="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={appSettings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="15"
              max="480"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={appSettings.security.maxLoginAttempts}
              onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="3"
              max="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Backup Frequency
            </label>
            <select
              value={appSettings.security.dataBackupFrequency}
              onChange={(e) => handleSettingChange('security', 'dataBackupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Features</h3>
        <div className="space-y-4">
          {[
            { key: 'passwordRequireSpecialChars', label: 'Require Special Characters', desc: 'Passwords must contain special characters' },
            { key: 'passwordRequireNumbers', label: 'Require Numbers', desc: 'Passwords must contain numbers' },
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Enable 2FA for additional security' },
            { key: 'autoLogout', label: 'Auto Logout', desc: 'Automatically log out inactive users' },
            { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all user activities for security audit' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.security[key]}
                  onChange={(e) => handleSettingChange('security', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Theme & Appearance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon }
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={value}
                    checked={appSettings.display.theme === value}
                    onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <select
              value={appSettings.display.fontSize}
              onChange={(e) => handleSettingChange('display', 'fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={appSettings.display.brandColor}
                onChange={(e) => handleSettingChange('display', 'brandColor', e.target.value)}
                className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={appSettings.display.brandColor}
                onChange={(e) => handleSettingChange('display', 'brandColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="#DC2626"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interface Settings</h3>
        <div className="space-y-4">
          {[
            { key: 'showImages', label: 'Show Images', desc: 'Display images in menu and other areas' },
            { key: 'compactMode', label: 'Compact Mode', desc: 'Use smaller spacing and compact layout' },
            { key: 'animationsEnabled', label: 'Animations', desc: 'Enable smooth animations and transitions' },
            { key: 'soundEnabled', label: 'Sound Effects', desc: 'Play sound for notifications and actions' },
            { key: 'highContrast', label: 'High Contrast', desc: 'Use high contrast colors for better visibility' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.display[key]}
                  onChange={(e) => handleSettingChange('display', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
        <div className="space-y-4">
          {[
            { key: 'acceptCash', label: 'Cash Payment', desc: 'Accept cash payments' },
            { key: 'acceptCard', label: 'Card Payment', desc: 'Accept credit/debit card payments' },
            { key: 'acceptMobile', label: 'Mobile Payment', desc: 'Accept mobile wallet payments (bKash, Nagad)' },
            { key: 'acceptOnline', label: 'Online Payment', desc: 'Accept online payment gateways' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.payment[key]}
                  onChange={(e) => handleSettingChange('payment', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Rules</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Card Amount (৳)
            </label>
            <input
              type="number"
              value={appSettings.payment.minimumCardAmount}
              onChange={(e) => handleSettingChange('payment', 'minimumCardAmount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Policy (days)
            </label>
            <select
              value={appSettings.payment.refundPolicy}
              onChange={(e) => handleSettingChange('payment', 'refundPolicy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="3 days">3 days</option>
              <option value="7 days">7 days</option>
              <option value="14 days">14 days</option>
              <option value="30 days">30 days</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tip Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip Suggestions (%)
            </label>
            <div className="flex space-x-3">
              {appSettings.payment.tipSuggestions.map((tip, index) => (
                <input
                  key={index}
                  type="number"
                  value={tip}
                  onChange={(e) => {
                    const newTips = [...appSettings.payment.tipSuggestions];
                    newTips[index] = parseInt(e.target.value);
                    handleSettingChange('payment', 'tipSuggestions', newTips);
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  max="50"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'autoCalculateTip', label: 'Auto Calculate Tip', desc: 'Automatically calculate tip suggestions' },
              { key: 'splitBillEnabled', label: 'Split Bill', desc: 'Allow customers to split bills' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appSettings.payment[key]}
                    onChange={(e) => handleSettingChange('payment', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventorySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Thresholds</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              value={appSettings.inventory.lowStockThreshold}
              onChange={(e) => handleSettingChange('inventory', 'lowStockThreshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critical Stock Threshold
            </label>
            <input
              type="number"
              value={appSettings.inventory.criticalStockThreshold}
              onChange={(e) => handleSettingChange('inventory', 'criticalStockThreshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Features</h3>
        <div className="space-y-4">
          {[
            { key: 'autoReorderEnabled', label: 'Auto Reorder', desc: 'Automatically reorder when stock is low' },
            { key: 'wasteTrackingEnabled', label: 'Waste Tracking', desc: 'Track food waste and spoilage' },
            { key: 'expirationAlerts', label: 'Expiration Alerts', desc: 'Alert when items are about to expire' },
            { key: 'costTrackingEnabled', label: 'Cost Tracking', desc: 'Track inventory costs and value' },
            { key: 'supplierNotifications', label: 'Supplier Notifications', desc: 'Send notifications to suppliers for reorders' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.inventory[key]}
                  onChange={(e) => handleSettingChange('inventory', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'business': return renderBusinessSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'display': return renderDisplaySettings();
      case 'payment': return renderPaymentSettings();
      case 'inventory': return renderInventorySettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your restaurant&apos;s system settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportSettings}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-brand-dark text-white px-4 py-2 rounded-md hover:bg-brand-light focus:ring-2 focus:ring-brand-light flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-brand-dark text-white px-4 py-2 rounded-md hover:bg-brand-light focus:ring-2 focus:ring-brand-light flex items-center disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportSettings}
        accept=".json"
        className="hidden"
      />

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-md ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <div className="flex">
            {saveMessage.includes('Error') ? (
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <Check className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span>{saveMessage}</span>
          </div>
        </div>
      )}

      {/* Settings Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {settingsTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {renderCurrentTab()}
        </div>

        {/* Action Bar */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleResetSettings(activeTab)}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset {settingsTabs.find(tab => tab.id === activeTab)?.label} Settings</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="bg-brand-dark text-white px-6 py-2 rounded-md hover:bg-brand-light focus:ring-2 focus:ring-brand-light flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
