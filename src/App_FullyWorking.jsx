import React, { useState } from 'react';

// Simple Restaurant Management System - No Authentication Required

// Sample Data
const sampleMenuItems = [
  { id: 1, name: 'Burger Deluxe', price: 12.99, category: 'Main Course', available: true },
  { id: 2, name: 'Pizza Margherita', price: 15.99, category: 'Main Course', available: true },
  { id: 3, name: 'Caesar Salad', price: 8.99, category: 'Appetizer', available: true },
  { id: 4, name: 'Pasta Carbonara', price: 13.99, category: 'Main Course', available: true },
  { id: 5, name: 'Chocolate Ice Cream', price: 5.99, category: 'Dessert', available: true },
];

const sampleOrders = [
  { id: 1, table: 5, items: ['Burger Deluxe', 'Pizza Margherita'], total: 28.98, status: 'preparing', time: '2:30 PM' },
  { id: 2, table: 3, items: ['Caesar Salad', 'Pasta Carbonara'], total: 22.98, status: 'ready', time: '2:45 PM' },
  { id: 3, table: 7, items: ['Pizza Margherita', 'Chocolate Ice Cream'], total: 21.98, status: 'served', time: '3:00 PM' },
];

// Simple Header Component
function SimpleHeader({ currentPage, setCurrentPage }) {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-red-600">🍽️ Smart Dine RMS</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            {['dashboard', 'menu', 'orders', 'analytics'].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

// Dashboard Component
function Dashboard({ menuItems, orders }) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter(order => order.status !== 'served').length;
  const availableItems = menuItems.filter(item => item.available).length;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900">{availableItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 mr-4">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">{activeOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h3>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Order #{order.id} - Table {order.table}</p>
                <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                <p className="text-sm text-gray-500">{order.time}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
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
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Main Course'
  });

  const addItem = () => {
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
      <h2 className="text-3xl font-bold text-gray-900 mb-6">🍽️ Menu Management</h2>

      {/* Add New Item */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Menu Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Appetizer">Appetizer</option>
            <option value="Main Course">Main Course</option>
            <option value="Dessert">Dessert</option>
            <option value="Beverage">Beverage</option>
          </select>
          <button
            onClick={addItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Menu ({menuItems.length} items)</h3>
        <div className="space-y-3">
          {menuItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-gray-600">{item.category} • ${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Toggle
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">📦 Order Management</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Orders ({orders.length})</h3>
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
                  <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
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
                  onClick={() => updateStatus(order.id, 'preparing')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Preparing
                </button>
                <button
                  onClick={() => updateStatus(order.id, 'ready')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Ready
                </button>
                <button
                  onClick={() => updateStatus(order.id, 'served')}
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

  const statusStats = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">📈 Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Menu Categories</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{category}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {count} items
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="font-medium text-gray-700 capitalize">{status}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'ready' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {count} orders
                </span>
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
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [menuItems, setMenuItems] = useState(sampleMenuItems);
  const [orders, setOrders] = useState(sampleOrders);

  const renderPage = () => {
    switch (currentPage) {
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
      <SimpleHeader currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="pt-16">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
