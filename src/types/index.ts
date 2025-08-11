export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'chef' | 'waiter' | 'customer';
  avatar?: string;
  points?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  featured: boolean;
  ingredients: string[];
  preparationTime: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  tableNumber?: number;
  createdAt: Date;
  estimatedTime?: number;
  specialInstructions?: string;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: Date;
  time: string;
  guests: number;
  tableNumber?: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  specialRequests?: string;
}

export interface WasteLog {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  reason: string;
  cost: number;
  loggedBy: string;
  date: Date;
  category: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  threshold: number;
  cost: number;
  lastUpdated: Date;
}

export interface Analytics {
  totalSales: number;
  totalOrders: number;
  totalWaste: number;
  avgOrderValue: number;
  salesTrend: { date: string; amount: number }[];
  wasteTrend: { date: string; amount: number }[];
  topWastedItems: { item: string; quantity: number; cost: number }[];
  popularItems: { item: string; orders: number }[];
}