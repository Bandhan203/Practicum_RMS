import React, { useState } from 'react';
import './index.css';

// Sample data for the restaurant
const initialMenuItems = [
  { id: 1, name: 'Burger', price: 12.99, category: 'Main Course', available: true },
  { id: 2, name: 'Pizza', price: 15.99, category: 'Main Course', available: true },
  { id: 3, name: 'Salad', price: 8.99, category: 'Appetizer', available: true },
  { id: 4, name: 'Pasta', price: 13.99, category: 'Main Course', available: true },
  { id: 5, name: 'Ice Cream', price: 5.99, category: 'Dessert', available: true },
];

const initialOrders = [
  { id: 1, table: 5, items: ['Burger', 'Pizza'], total: 28.98, status: 'preparing', time: '12:30 PM' },
  { id: 2, table: 3, items: ['Salad', 'Pasta'], total: 22.98, status: 'ready', time: '12:45 PM' },
  { id: 3, table: 7, items: ['Pizza', 'Ice Cream'], total: 21.98, status: 'served', time: '1:00 PM' },
];

// Navigation Component
function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', name: '📊 Dashboard', icon: '🏠' },
    { id: 'menu', name: '🍽️ Menu Management', icon: '📋' },
    { id: 'orders', name: '📦 Orders', icon: '📋' },
    { id: 'analytics', name: '📈 Analytics', icon: '📊' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">🍽️ Smart Dine RMS</h1>
          </div>
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Dashboard Component
function Dashboard({ menuItems, orders }) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter(order => order.status !== 'served').length;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Menu Items</h3>
          <p className="text-3xl font-bold text-blue-600">{menuItems.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Active Orders</h3>
          <p className="text-3xl font-bold text-orange-600">{activeOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
          <p className="text-3xl font-bold text-green-600">{orders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Revenue Today</h3>
          <p className="text-3xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">Table {order.table}</span>
                <span className="text-gray-600 ml-2">• {order.items.join(', ')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold">${order.total}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'ready' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Menu Management Component
function MenuManagement({ menuItems, setMenuItems }) {
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Main Course' });

  const addMenuItem = () => {
    if (newItem.name && newItem.price) {
      const item = {
        id: Date.now(),
        name: newItem.name,
        price: parseFloat(newItem.price),
        category: newItem.category,
        available: true
      };
      setMenuItems([...menuItems, item]);
      setNewItem({ name: '', price: '', category: 'Main Course' });
    }
  };

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const deleteItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Menu Management</h2>
      
      {/* Add New Item Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New Menu Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <input
            type="number"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="Appetizer">Appetizer</option>
            <option value="Main Course">Main Course</option>
            <option value="Dessert">Dessert</option>
            <option value="Beverage">Beverage</option>
          </select>
          <button
            onClick={addMenuItem}
            className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Current Menu Items</h3>
        <div className="space-y-3">
          {menuItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-lg">{item.name}</h4>
                <p className="text-gray-600">{item.category} • ${item.price}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Toggle
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Orders Component
function Orders({ orders, setOrders }) {
  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Order Management</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Active Orders</h3>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">Order #{order.id} - Table {order.table}</h4>
                  <p className="text-gray-600">Time: {order.time}</p>
                  <p className="text-gray-700">Items: {order.items.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${order.total}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Preparing
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Ready
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'served')}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Served
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Analytics Component
function Analytics({ menuItems, orders }) {
  const categoryStats = menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const orderStatusStats = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Menu Categories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Menu Categories</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="font-medium">{category}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{count} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(orderStatusStats).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="font-medium capitalize">{status}</span>
                <span className={`px-3 py-1 rounded-full ${
                  status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'ready' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [orders, setOrders] = useState(initialOrders);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard menuItems={menuItems} orders={orders} />;
      case 'menu':
        return <MenuManagement menuItems={menuItems} setMenuItems={setMenuItems} />;
      case 'orders':
        return <Orders orders={orders} setOrders={setOrders} />;
      case 'analytics':
        return <Analytics menuItems={menuItems} orders={orders} />;
      default:
        return <Dashboard menuItems={menuItems} orders={orders} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="min-h-[calc(100vh-80px)]">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
