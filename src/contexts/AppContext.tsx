import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, MenuItem, Reservation, WasteLog, InventoryItem, Analytics } from '../types';

interface AppContextType {
  orders: Order[];
  menuItems: MenuItem[];
  reservations: Reservation[];
  wasteLogs: WasteLog[];
  inventory: InventoryItem[];
  analytics: Analytics;
  cart: { menuItemId: string; quantity: number }[];
  
  // Actions
  addToCart: (menuItemId: string) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  logWaste: (waste: Omit<WasteLog, 'id' | 'date'>) => void;
  updateInventory: (itemId: string, quantity: number) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockMenuItems: MenuItem[] = [
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
  {
    id: '2',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon herb butter',
    price: 28.99,
    category: 'Seafood',
    image: 'https://images.pexels.com/photos/725992/pexels-photo-725992.jpeg?auto=compress&cs=tinysrgb&w=500',
    available: true,
    featured: false,
    ingredients: ['Salmon', 'Lemon', 'Herbs', 'Butter'],
    preparationTime: 20
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing and croutons',
    price: 14.99,
    category: 'Salads',
    image: 'https://images.pexels.com/photos/2116094/pexels-photo-2116094.jpeg?auto=compress&cs=tinysrgb&w=500',
    available: true,
    featured: false,
    ingredients: ['Romaine lettuce', 'Caesar dressing', 'Croutons', 'Parmesan'],
    preparationTime: 10
  },
  {
    id: '4',
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 16.99,
    category: 'Burgers',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=500',
    available: true,
    featured: true,
    ingredients: ['Beef patty', 'Lettuce', 'Tomato', 'Special sauce'],
    preparationTime: 12
  }
];

const mockOrders: Order[] = [
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
  {
    id: '2',
    customerId: '4',
    customerName: 'Customer Jane',
    items: [{ menuItemId: '2', menuItemName: 'Grilled Salmon', quantity: 1, price: 28.99 }],
    totalAmount: 28.99,
    status: 'ready',
    tableNumber: 3,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    estimatedTime: 20
  }
];

const mockReservations: Reservation[] = [
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

const mockWasteLogs: WasteLog[] = [
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
  {
    id: '2',
    itemName: 'Bread',
    quantity: 5,
    unit: 'loaves',
    reason: 'End of day disposal',
    cost: 15.00,
    loggedBy: 'Chef Mario',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    category: 'Bakery'
  }
];

const mockInventory: InventoryItem[] = [
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
  {
    id: '2',
    name: 'Mozzarella',
    quantity: 8,
    unit: 'kg',
    category: 'Dairy',
    threshold: 5,
    cost: 12.50,
    lastUpdated: new Date()
  },
  {
    id: '3',
    name: 'Salmon',
    quantity: 3,
    unit: 'kg',
    category: 'Seafood',
    threshold: 5,
    cost: 35.00,
    lastUpdated: new Date()
  }
];

const mockAnalytics: Analytics = {
  totalSales: 15420.50,
  totalOrders: 342,
  totalWaste: 285.75,
  avgOrderValue: 45.12,
  salesTrend: [
    { date: '2024-01-01', amount: 1200 },
    { date: '2024-01-02', amount: 1450 },
    { date: '2024-01-03', amount: 1850 },
    { date: '2024-01-04', amount: 2100 },
    { date: '2024-01-05', amount: 1950 },
    { date: '2024-01-06', amount: 2300 },
    { date: '2024-01-07', amount: 2150 }
  ],
  wasteTrend: [
    { date: '2024-01-01', amount: 45 },
    { date: '2024-01-02', amount: 32 },
    { date: '2024-01-03', amount: 28 },
    { date: '2024-01-04', amount: 55 },
    { date: '2024-01-05', amount: 41 },
    { date: '2024-01-06', amount: 38 },
    { date: '2024-01-07', amount: 47 }
  ],
  topWastedItems: [
    { item: 'Tomatoes', quantity: 15, cost: 63.75 },
    { item: 'Bread', quantity: 25, cost: 75.00 },
    { item: 'Lettuce', quantity: 8, cost: 24.00 }
  ],
  popularItems: [
    { item: 'Margherita Pizza', orders: 85 },
    { item: 'Beef Burger', orders: 72 },
    { item: 'Caesar Salad', orders: 58 }
  ]
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(mockWasteLogs);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [analytics, setAnalytics] = useState<Analytics>(mockAnalytics);
  const [cart, setCart] = useState<{ menuItemId: string; quantity: number }[]>([]);

  const addToCart = (menuItemId: string) => {
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

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const addReservation = (reservation: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now().toString()
    };
    setReservations(prev => [newReservation, ...prev]);
  };

  const logWaste = (waste: Omit<WasteLog, 'id' | 'date'>) => {
    const newWaste: WasteLog = {
      ...waste,
      id: Date.now().toString(),
      date: new Date()
    };
    setWasteLogs(prev => [newWaste, ...prev]);
  };

  const updateInventory = (itemId: string, quantity: number) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity, lastUpdated: new Date() }
          : item
      )
    );
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString()
    };
    setMenuItems(prev => [newItem, ...prev]);
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const deleteMenuItem = (itemId: string) => {
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