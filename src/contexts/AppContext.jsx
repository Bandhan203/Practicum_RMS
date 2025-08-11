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
    createdAt: new Date(),
    estimatedTime: 15
  },
  // ...other orders...
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
    date: new Date(),
    category: 'Vegetables'
  },
  // ...other logs...
];

const mockInventory = [
  {
    id: '1',
    name: 'Tomatoes',
    quantity: 25,
    unit: 'kg',
    category: 'Vegetables',
    threshold: 10,
    cost: 4.25,
    lastUpdated: new Date()
  },
  // ...other inventory...
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
      deleteMenuItem
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
