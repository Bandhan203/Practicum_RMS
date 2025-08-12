import React, { createContext, useContext, useState, useEffect } from 'react';
// Remove type imports

const AppContext = createContext(undefined);

// Mock data
const mockMenuItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    price: 18.99,
    category: 'Pizza',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=500',
    available: true,
    featured: true,
    ingredients: ['Tomato sauce', 'Mozzarella', 'Basil'],
    preparationTime: 15
  },
  // ...other items...
];

const mockOrders = [
  {
    id: '1',
    customerId: '4',
    customerName: 'Customer Jane',
    items: [{ menuItemId: '1', menuItemName: 'Margherita Pizza', quantity: 1, price: 18.99 }],
    totalAmount: 18.99,
    status: 'preparing',
    tableNumber: 5,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    estimatedTime: 15
  },
  // Pending Orders
  {
    id: '2',
    customerId: '5',
    customerName: 'Mike Johnson',
    items: [
      { menuItemId: '2', menuItemName: 'Chicken Caesar Salad', quantity: 1, price: 16.99 },
      { menuItemId: '8', menuItemName: 'Garlic Bread', quantity: 2, price: 8.99 }
    ],
    totalAmount: 34.97,
    status: 'pending',
    tableNumber: 3,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    estimatedTime: 20,
    specialInstructions: 'Extra dressing on the side, please'
  },
  {
    id: '3',
    customerId: '6',
    customerName: 'Sarah Wilson',
    items: [
      { menuItemId: '4', menuItemName: 'Beef Burger', quantity: 2, price: 22.99 },
      { menuItemId: '7', menuItemName: 'French Fries', quantity: 2, price: 9.99 }
    ],
    totalAmount: 65.96,
    status: 'pending',
    tableNumber: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    estimatedTime: 25,
    specialInstructions: 'Medium well burgers, extra crispy fries'
  },
  {
    id: '4',
    customerId: '7',
    customerName: 'David Chen',
    items: [
      { menuItemId: '3', menuItemName: 'Spaghetti Carbonara', quantity: 1, price: 19.99 }
    ],
    totalAmount: 19.99,
    status: 'pending',
    tableNumber: 12,
    createdAt: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
    estimatedTime: 18
  },
  // Served Orders
  {
    id: '5',
    customerId: '8',
    customerName: 'Emma Brown',
    items: [
      { menuItemId: '1', menuItemName: 'Margherita Pizza', quantity: 1, price: 18.99 },
      { menuItemId: '9', menuItemName: 'Chocolate Cake', quantity: 1, price: 12.99 }
    ],
    totalAmount: 31.98,
    status: 'served',
    tableNumber: 6,
    createdAt: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
    estimatedTime: 15
  },
  {
    id: '6',
    customerId: '9',
    customerName: 'Robert Taylor',
    items: [
      { menuItemId: '5', menuItemName: 'Fish & Chips', quantity: 1, price: 21.99 },
      { menuItemId: '10', menuItemName: 'Iced Tea', quantity: 2, price: 4.99 }
    ],
    totalAmount: 31.97,
    status: 'served',
    tableNumber: 15,
    createdAt: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
    estimatedTime: 22
  },
  {
    id: '7',
    customerId: '10',
    customerName: 'Lisa Anderson',
    items: [
      { menuItemId: '6', menuItemName: 'Vegetable Stir Fry', quantity: 1, price: 17.99 },
      { menuItemId: '11', menuItemName: 'Fresh Juice', quantity: 1, price: 6.99 }
    ],
    totalAmount: 24.98,
    status: 'served',
    tableNumber: 4,
    createdAt: new Date(Date.now() - 150 * 60 * 1000), // 2.5 hours ago
    estimatedTime: 16
  },
  // Cancelled Orders
  {
    id: '8',
    customerId: '11',
    customerName: 'Tom Wilson',
    items: [
      { menuItemId: '4', menuItemName: 'Beef Burger', quantity: 3, price: 22.99 },
      { menuItemId: '7', menuItemName: 'French Fries', quantity: 3, price: 9.99 }
    ],
    totalAmount: 98.94,
    status: 'cancelled',
    tableNumber: 2,
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    estimatedTime: 25,
    specialInstructions: 'Customer left due to long wait time'
  },
  {
    id: '9',
    customerId: '12',
    customerName: 'Anna Garcia',
    items: [
      { menuItemId: '2', menuItemName: 'Chicken Caesar Salad', quantity: 1, price: 16.99 }
    ],
    totalAmount: 16.99,
    status: 'cancelled',
    tableNumber: 9,
    createdAt: new Date(Date.now() - 75 * 60 * 1000), // 1.25 hours ago
    estimatedTime: 20,
    specialInstructions: 'Customer allergic to croutons - cancelled after ordering'
  },
  // Ready Orders
  {
    id: '10',
    customerId: '13',
    customerName: 'Chris Martinez',
    items: [
      { menuItemId: '3', menuItemName: 'Spaghetti Carbonara', quantity: 2, price: 19.99 },
      { menuItemId: '8', menuItemName: 'Garlic Bread', quantity: 1, price: 8.99 }
    ],
    totalAmount: 48.97,
    status: 'ready',
    tableNumber: 7,
    createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    estimatedTime: 18
  }
];

const mockReservations = [
  {
    id: '1',
    customerName: 'John Doe',
    customerEmail: 'john@email.com',
    customerPhone: '+1234567890',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: '19:00',
    guests: 4,
    tableNumber: 12,
    status: 'confirmed'
  }
];

const mockWasteLogs = [
  {
    id: '1',
    itemName: 'Tomatoes',
    quantity: 2,
    unit: 'kg',
    reason: 'Overripe',
    cost: 8.50,
    loggedBy: 'Chef Mario',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    category: 'Vegetables'
  },
  {
    id: '2',
    itemName: 'Lettuce',
    quantity: 1.5,
    unit: 'kg',
    reason: 'Wilted',
    cost: 4.50,
    loggedBy: 'Chef Mario',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    category: 'Vegetables'
  },
  {
    id: '3',
    itemName: 'Chicken Breast',
    quantity: 0.8,
    unit: 'kg',
    reason: 'Past expiry',
    cost: 12.00,
    loggedBy: 'Chef Antonio',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    category: 'Meat'
  },
  {
    id: '4',
    itemName: 'Mozzarella',
    quantity: 0.5,
    unit: 'kg',
    reason: 'Moldy',
    cost: 8.75,
    loggedBy: 'Chef Mario',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    category: 'Dairy'
  },
  {
    id: '5',
    itemName: 'Basil',
    quantity: 0.2,
    unit: 'kg',
    reason: 'Dried out',
    cost: 6.20,
    loggedBy: 'Chef Antonio',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    category: 'Herbs'
  },
  {
    id: '6',
    itemName: 'Bread',
    quantity: 2,
    unit: 'loaves',
    reason: 'Stale',
    cost: 5.50,
    loggedBy: 'Chef Mario',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    category: 'Bakery'
  },
  {
    id: '7',
    itemName: 'Salmon',
    quantity: 1.2,
    unit: 'kg',
    reason: 'Overcooked',
    cost: 28.50,
    loggedBy: 'Chef Antonio',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    category: 'Fish'
  },
  {
    id: '8',
    itemName: 'Bell Peppers',
    quantity: 0.6,
    unit: 'kg',
    reason: 'Soft spots',
    cost: 3.60,
    loggedBy: 'Chef Mario',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    category: 'Vegetables'
  }
];

const mockInventory = [
  {
    id: '1',
    name: 'Tomatoes',
    quantity: 8,
    unit: 'kg',
    category: 'Vegetables',
    threshold: 10,
    cost: 4.25,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    criticalLevel: 5
  },
  {
    id: '2',
    name: 'Lettuce',
    quantity: 4,
    unit: 'kg',
    category: 'Vegetables',
    threshold: 8,
    cost: 3.00,
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    criticalLevel: 3
  },
  {
    id: '3',
    name: 'Chicken Breast',
    quantity: 12,
    unit: 'kg',
    category: 'Meat',
    threshold: 15,
    cost: 15.00,
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000),
    criticalLevel: 8
  },
  {
    id: '4',
    name: 'Mozzarella',
    quantity: 6,
    unit: 'kg',
    category: 'Dairy',
    threshold: 12,
    cost: 17.50,
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
    criticalLevel: 4
  },
  {
    id: '5',
    name: 'Salmon',
    quantity: 3,
    unit: 'kg',
    category: 'Fish',
    threshold: 6,
    cost: 23.75,
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000),
    criticalLevel: 2
  },
  {
    id: '6',
    name: 'Basil',
    quantity: 0.8,
    unit: 'kg',
    category: 'Herbs',
    threshold: 2,
    cost: 31.00,
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    criticalLevel: 0.5
  },
  {
    id: '7',
    name: 'Olive Oil',
    quantity: 15,
    unit: 'liters',
    category: 'Oils',
    threshold: 20,
    cost: 8.50,
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000),
    criticalLevel: 10
  },
  {
    id: '8',
    name: 'Bell Peppers',
    quantity: 2,
    unit: 'kg',
    category: 'Vegetables',
    threshold: 5,
    cost: 6.00,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    criticalLevel: 1
  },
  {
    id: '9',
    name: 'Flour',
    quantity: 25,
    unit: 'kg',
    category: 'Bakery',
    threshold: 30,
    cost: 2.20,
    lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000),
    criticalLevel: 15
  },
  {
    id: '10',
    name: 'Onions',
    quantity: 18,
    unit: 'kg',
    category: 'Vegetables',
    threshold: 25,
    cost: 2.80,
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
    criticalLevel: 12
  },
  {
    id: '11',
    name: 'Rice',
    quantity: 40,
    unit: 'kg',
    category: 'Grains',
    threshold: 50,
    cost: 3.50,
    lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000),
    criticalLevel: 25
  },
  {
    id: '12',
    name: 'Parmesan',
    quantity: 1.2,
    unit: 'kg',
    category: 'Dairy',
    threshold: 3,
    cost: 25.00,
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    criticalLevel: 1
  }
];

const mockAnalytics = {
  totalSales: 15420.50,
  totalOrders: 342,
  totalWaste: 285.75,
  avgOrderValue: 45.12,
  salesTrend: [
    { date: '2024-01-01', amount: 1200 },
    // ...other trends...
  ],
  wasteTrend: [
    { date: '2024-01-01', amount: 45 },
    // ...other trends...
  ],
  topWastedItems: [
    { item: 'Tomatoes', quantity: 15, cost: 63.75 },
    // ...other items...
  ],
  popularItems: [
    { item: 'Margherita Pizza', orders: 85 },
    // ...other items...
  ]
};

export function AppProvider({ children }) {
  const [orders, setOrders] = useState(mockOrders);
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [reservations, setReservations] = useState(mockReservations);
  const [wasteLogs, setWasteLogs] = useState(mockWasteLogs);
  const [inventory, setInventory] = useState(mockInventory);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [cart, setCart] = useState([]);

  // Dynamic calculations for real-time analytics
  const calculateLiveWasteAnalytics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Calculate waste by time periods
    const todayWaste = wasteLogs.filter(log => new Date(log.date) >= today);
    const weekWaste = wasteLogs.filter(log => new Date(log.date) >= last7Days);
    const monthWaste = wasteLogs.filter(log => new Date(log.date) >= last30Days);

    // Calculate top wasted items with more detailed analysis
    const wasteByItem = {};
    monthWaste.forEach(log => {
      if (!wasteByItem[log.itemName]) {
        wasteByItem[log.itemName] = {
          item: log.itemName,
          quantity: 0,
          cost: 0,
          occurrences: 0,
          category: log.category,
          avgQuantityPerWaste: 0,
          lastWasteDate: new Date(log.date),
          reasons: {}
        };
      }
      wasteByItem[log.itemName].quantity += log.quantity;
      wasteByItem[log.itemName].cost += log.cost;
      wasteByItem[log.itemName].occurrences += 1;
      
      // Track waste reasons
      if (!wasteByItem[log.itemName].reasons[log.reason]) {
        wasteByItem[log.itemName].reasons[log.reason] = 0;
      }
      wasteByItem[log.itemName].reasons[log.reason] += 1;

      // Update last waste date if more recent
      if (new Date(log.date) > wasteByItem[log.itemName].lastWasteDate) {
        wasteByItem[log.itemName].lastWasteDate = new Date(log.date);
      }
    });

    // Calculate averages and sort by cost impact
    const topWastedItems = Object.values(wasteByItem)
      .map(item => ({
        ...item,
        avgQuantityPerWaste: item.quantity / item.occurrences,
        costImpactScore: item.cost + (item.occurrences * 2), // Factor in frequency
        primaryReason: Object.keys(item.reasons).reduce((a, b) => 
          item.reasons[a] > item.reasons[b] ? a : b
        )
      }))
      .sort((a, b) => b.costImpactScore - a.costImpactScore)
      .slice(0, 8);

    return {
      todayWaste: todayWaste.reduce((sum, log) => sum + log.cost, 0),
      weekWaste: weekWaste.reduce((sum, log) => sum + log.cost, 0),
      monthWaste: monthWaste.reduce((sum, log) => sum + log.cost, 0),
      topWastedItems,
      todayWasteCount: todayWaste.length,
      wasteFrequency: weekWaste.length / 7, // daily average
      mostWastedCategory: Object.values(wasteByItem)
        .reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.cost;
          return acc;
        }, {})
    };
  };

  const calculateLiveStockAnalytics = () => {
    const now = Date.now();
    
    // Categorize inventory by stock levels
    const stockAnalysis = inventory.map(item => {
      const stockPercentage = (item.quantity / item.threshold) * 100;
      const timeSinceUpdate = Math.floor((now - new Date(item.lastUpdated).getTime()) / (1000 * 60 * 60)); // hours
      
      let priority = 'normal';
      let urgency = 1;
      
      if (item.quantity <= item.criticalLevel) {
        priority = 'critical';
        urgency = 5;
      } else if (item.quantity <= item.threshold * 0.5) {
        priority = 'high';
        urgency = 4;
      } else if (item.quantity <= item.threshold) {
        priority = 'medium';
        urgency = 3;
      } else if (item.quantity <= item.threshold * 1.2) {
        priority = 'low';
        urgency = 2;
      }

      return {
        ...item,
        stockPercentage,
        priority,
        urgency,
        timeSinceUpdate,
        estimatedDaysLeft: item.quantity > 0 ? Math.floor(item.quantity / 2) : 0, // Assuming 2 units consumed per day
        totalValue: item.quantity * item.cost,
        shouldReorder: item.quantity <= item.threshold
      };
    });

    // Sort by urgency and then by cost impact
    const lowStockItems = stockAnalysis
      .filter(item => item.shouldReorder)
      .sort((a, b) => {
        if (a.urgency !== b.urgency) return b.urgency - a.urgency;
        return b.totalValue - a.totalValue;
      });

    const criticalItems = stockAnalysis.filter(item => item.priority === 'critical');
    const totalInventoryValue = stockAnalysis.reduce((sum, item) => sum + item.totalValue, 0);
    
    return {
      lowStockItems,
      criticalItems,
      totalInventoryValue,
      stockAlerts: {
        critical: criticalItems.length,
        high: stockAnalysis.filter(item => item.priority === 'high').length,
        medium: stockAnalysis.filter(item => item.priority === 'medium').length,
        total: lowStockItems.length
      },
      averageStockLevel: stockAnalysis.reduce((sum, item) => sum + item.stockPercentage, 0) / stockAnalysis.length
    };
  };

  // Live analytics that update based on current data
  const getLiveAnalytics = () => {
    const wasteAnalytics = calculateLiveWasteAnalytics();
    const stockAnalytics = calculateLiveStockAnalytics();
    
    return {
      ...analytics,
      live: {
        waste: wasteAnalytics,
        stock: stockAnalytics,
        lastUpdated: new Date()
      }
    };
  };

  const addToCart = (menuItemId) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === menuItemId);
      if (existing) {
        return prev.map(item =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItemId, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = (order) => {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const addReservation = (reservation) => {
    const newReservation = {
      ...reservation,
      id: Date.now().toString()
    };
    setReservations(prev => [newReservation, ...prev]);
  };

  const logWaste = (waste) => {
    const newWaste = {
      ...waste,
      id: Date.now().toString(),
      date: new Date()
    };
    setWasteLogs(prev => [newWaste, ...prev]);
  };

  const updateInventory = (itemId, quantity) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity, lastUpdated: new Date() }
          : item
      )
    );
  };

  const addMenuItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString()
    };
    setMenuItems(prev => [newItem, ...prev]);
  };

  const updateMenuItem = (itemId, updates) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const deleteMenuItem = (itemId) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <AppContext.Provider value={{
      orders,
      menuItems,
      reservations,
      wasteLogs,
      inventory,
      analytics,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      addReservation,
      logWaste,
      updateInventory,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      getLiveAnalytics,
      calculateLiveWasteAnalytics,
      calculateLiveStockAnalytics
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
