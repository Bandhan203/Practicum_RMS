import api from './api.js';

class SettingsAPI {
  // Get all settings
  async getAllSettings() {
    try {
      const response = await api.get('/settings');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {}
      };
    }
  }

  // Get settings by category
  async getSettingsByCategory(category) {
    try {
      const response = await api.get('/settings', {
        params: { category }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(`Failed to fetch ${category} settings:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {}
      };
    }
  }

  // Get public settings
  async getPublicSettings() {
    try {
      const response = await api.get('/settings/public');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {}
      };
    }
  }

  // Get a specific setting
  async getSetting(key) {
    try {
      const response = await api.get(`/settings/${key}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(`Failed to fetch setting ${key}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  // Create or update a setting
  async setSetting(key, value, type = 'string', category = 'general', description = null, isPublic = false) {
    try {
      const response = await api.post('/settings', {
        key,
        value,
        type,
        category,
        description,
        is_public: isPublic
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Failed to set setting ${key}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  // Update multiple settings at once
  async updateBatchSettings(settings) {
    try {
      const response = await api.post('/settings/batch', {
        settings
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to update batch settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      };
    }
  }

  // Delete a setting
  async deleteSetting(key) {
    try {
      const response = await api.delete(`/settings/${key}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Failed to delete setting ${key}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Export settings as JSON
  async exportSettings() {
    try {
      const result = await this.getAllSettings();
      if (result.success) {
        const settingsData = {
          exported_at: new Date().toISOString(),
          version: '1.0',
          settings: result.data
        };
        
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `restaurant_settings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return {
          success: true,
          message: 'Settings exported successfully'
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Failed to export settings:', error);
      return {
        success: false,
        error: 'Failed to export settings'
      };
    }
  }

  // Import settings from JSON file
  async importSettings(file) {
    try {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const settingsData = JSON.parse(e.target.result);
            
            if (!settingsData.settings) {
              resolve({
                success: false,
                error: 'Invalid settings file format'
              });
              return;
            }

            // Convert settings object to array format for batch update
            const settingsArray = Object.entries(settingsData.settings).map(([key, value]) => ({
              key,
              value,
              type: this.detectType(value),
              category: this.getCategoryFromKey(key),
              description: `Imported setting: ${key}`,
              is_public: false
            }));

            const result = await this.updateBatchSettings(settingsArray);
            resolve(result);
          } catch (parseError) {
            resolve({
              success: false,
              error: 'Failed to parse settings file'
            });
          }
        };
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Failed to import settings:', error);
      return {
        success: false,
        error: 'Failed to import settings'
      };
    }
  }

  // Helper method to detect value type
  detectType(value) {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'json';
    return 'string';
  }

  // Helper method to get category from key
  getCategoryFromKey(key) {
    if (key.startsWith('restaurant_')) return 'general';
    if (key.startsWith('business_')) return 'business';
    if (key.startsWith('notification_')) return 'notifications';
    if (key.startsWith('security_')) return 'security';
    if (key.startsWith('display_')) return 'display';
    if (key.startsWith('payment_')) return 'payment';
    if (key.startsWith('inventory_')) return 'inventory';
    return 'general';
  }

  // Generate PDF report of current settings
  async generateSettingsPDF() {
    try {
      const result = await this.getAllSettings();
      if (!result.success) {
        return result;
      }

      // Import jsPDF dynamically
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Restaurant Settings Report', 105, y, { align: 'center' });
      y += 15;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, y, { align: 'center' });
      y += 20;

      // Group settings by category
      const settingsByCategory = {};
      Object.entries(result.data).forEach(([key, value]) => {
        const category = this.getCategoryFromKey(key);
        if (!settingsByCategory[category]) {
          settingsByCategory[category] = [];
        }
        settingsByCategory[category].push({ key, value });
      });

      // Render each category
      Object.entries(settingsByCategory).forEach(([category, settings]) => {
        // Category header
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(category.charAt(0).toUpperCase() + category.slice(1) + ' Settings', 14, y);
        y += 10;

        // Settings in category
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        settings.forEach(({ key, value }) => {
          const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;
          
          doc.text(`${key}: ${truncatedValue}`, 16, y);
          y += 6;

          // Check if we need a new page
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });

        y += 10; // Space between categories
      });

      // Save the PDF
      const fileName = `restaurant_settings_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      return {
        success: true,
        message: 'Settings PDF generated successfully'
      };
    } catch (error) {
      console.error('Failed to generate settings PDF:', error);
      return {
        success: false,
        error: 'Failed to generate settings PDF'
      };
    }
  }
}

// Create singleton instance
const settingsAPI = new SettingsAPI();

export default settingsAPI;
