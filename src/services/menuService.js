import React from 'react';
import { menuAPI } from './api';
import toast from 'react-hot-toast';

/**
 * Simple Menu Service
 * Handles all menu-related database operations independently
 */
class MenuService {
  constructor() {
    this.menuItems = [];
    this.loading = false;
    this.listeners = [];
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(listener => listener(this.menuItems, this.loading));
  }

  // Get all menu items from backend
  async getMenuItems() {
    // Prevent multiple simultaneous calls
    if (this.loading) {
      console.log('MenuService: Already loading, skipping duplicate request');
      return { success: false, error: 'Already loading' };
    }

    this.loading = true;
    this.notify();

    try {
      console.log('MenuService: Fetching menu items from API...');
      const response = await menuAPI.getMenuItems();

      if (response.data) {
        this.menuItems = response.data;
        console.log('MenuService: Successfully loaded', this.menuItems.length, 'menu items');
      } else {
        this.menuItems = [];
        console.log('MenuService: No menu items found in response');
      }

      return { success: true, data: this.menuItems };
    } catch (error) {
      console.error('MenuService: Error fetching menu items:', error);
      toast.error('Failed to load menu items');
      this.menuItems = [];
      return { success: false, error: error.message };
    } finally {
      this.loading = false;
      this.notify();
    }
  }

  // Create new menu item
  async createMenuItem(itemData) {
    try {
      console.log('MenuService: Creating new menu item...');
      const response = await menuAPI.createMenuItem(itemData);

      if (response.data) {
        // Add to local array
        this.menuItems.unshift(response.data);
        this.notify();

        // Force refresh from server to ensure consistency
        await this.getMenuItems();

        console.log('MenuService: Successfully created menu item with ID:', response.data.id);
        return { success: true, data: response.data, message: 'Menu item created successfully!' };
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('MenuService: Error creating menu item:', error.message);
      const errorMessage = this.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }

  // Update existing menu item
  async updateMenuItem(id, itemData) {
    try {
      console.log('MenuService: Updating menu item ID:', id);
      const response = await menuAPI.updateMenuItem(id, itemData);

      if (response.data) {
        // Update in local array
        this.menuItems = this.menuItems.map(item =>
          item.id === id ? response.data : item
        );
        this.notify();

        console.log('MenuService: Successfully updated menu item ID:', id);
        return { success: true, data: response.data, message: 'Menu item updated successfully!' };
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('MenuService: Error updating menu item:', error.message);
      const errorMessage = this.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }

  // Delete menu item
  async deleteMenuItem(id) {
    try {
      console.log('MenuService: Deleting menu item ID:', id);
      const response = await menuAPI.deleteMenuItem(id);

      // Remove from local array
      this.menuItems = this.menuItems.filter(item => item.id !== id);
      this.notify();

      console.log('MenuService: Successfully deleted menu item ID:', id);
      return { success: true, message: 'Menu item deleted successfully!' };
    } catch (error) {
      console.error('MenuService: Error deleting menu item:', error.message);
      const errorMessage = this.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }

  // Get single menu item by ID
  getMenuItem(id) {
    return this.menuItems.find(item => item.id === id);
  }

  // Get menu items by category
  getMenuItemsByCategory(category) {
    if (category === 'all') return this.menuItems;
    return this.menuItems.filter(item => item.category === category);
  }

  // Get available menu items
  getAvailableMenuItems() {
    return this.menuItems.filter(item => item.available);
  }

  // Get categories
  getCategories() {
    const categories = new Set(this.menuItems.map(item => item.category));
    return ['all', ...Array.from(categories)];
  }

  // Search menu items
  searchMenuItems(searchTerm) {
    if (!searchTerm) return this.menuItems;

    const term = searchTerm.toLowerCase();
    return this.menuItems.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  }

  // Helper method to extract error messages
  getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors);
      return errors.flat().join(', ');
    }
    return error.message || 'An error occurred';
  }

  // Get current state
  getCurrentState() {
    return {
      menuItems: this.menuItems,
      loading: this.loading,
      count: this.menuItems.length,
      availableCount: this.menuItems.filter(item => item.available).length,
      categories: this.getCategories()
    };
  }
}

// Create a singleton instance
const menuService = new MenuService();

// Export the service
export default menuService;

// Export hook for React components
export const useMenuService = () => {
  const [state, setState] = React.useState(menuService.getCurrentState());

  React.useEffect(() => {
    const unsubscribe = menuService.subscribe((menuItems, loading) => {
      setState({
        menuItems,
        loading,
        count: menuItems.length,
        availableCount: menuItems.filter(item => item.available).length,
        categories: menuService.getCategories()
      });
    });

    // Load menu items on mount only if not already loaded and not currently loading
    if (menuService.menuItems.length === 0 && !menuService.loading) {
      console.log('useMenuService: Loading menu items for the first time...');
      menuService.getMenuItems();
    } else {
      console.log('useMenuService: Menu items already loaded or loading, skipping API call');
    }

    return unsubscribe;
  }, []);

  return {
    ...state,

    // Actions
    createMenuItem: menuService.createMenuItem.bind(menuService),
    updateMenuItem: menuService.updateMenuItem.bind(menuService),
    deleteMenuItem: menuService.deleteMenuItem.bind(menuService),
    getMenuItem: menuService.getMenuItem.bind(menuService),
    getMenuItemsByCategory: menuService.getMenuItemsByCategory.bind(menuService),
    getAvailableMenuItems: menuService.getAvailableMenuItems.bind(menuService),
    searchMenuItems: menuService.searchMenuItems.bind(menuService),
    refreshMenuItems: menuService.getMenuItems.bind(menuService)
  };
};
