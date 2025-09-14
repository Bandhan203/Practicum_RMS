import React, { useState, useEffect } from 'react';

export function BillingSystem() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [bills, setBills] = useState([]);

  // Mock orders data - in real app this would come from API/Redux store
  useEffect(() => {
    const mockOrders = [
      {
        id: 1,
        tableNumber: 'Table 5',
        items: [
          { name: 'Pizza Margherita', price: 12.99, quantity: 2 },
          { name: 'Caesar Salad', price: 8.99, quantity: 1 },
          { name: 'Coca Cola', price: 2.99, quantity: 3 }
        ],
        status: 'completed',
        waiter: 'John Doe',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        tableNumber: 'Table 3',
        items: [
          { name: 'Burger Deluxe', price: 15.99, quantity: 1 },
          { name: 'French Fries', price: 4.99, quantity: 2 },
          { name: 'Orange Juice', price: 3.99, quantity: 2 }
        ],
        status: 'completed',
        waiter: 'Jane Smith',
        timestamp: new Date().toISOString()
      }
    ];
    setOrders(mockOrders);
  }, []);

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const generateBill = () => {
    if (!selectedOrder) return;

    const subtotal = parseFloat(calculateTotal(selectedOrder.items));
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    const bill = {
      id: Date.now(),
      orderId: selectedOrder.id,
      tableNumber: selectedOrder.tableNumber,
      items: selectedOrder.items,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      paymentMethod,
      timestamp: new Date().toISOString(),
      waiter: selectedOrder.waiter
    };

    setBills([...bills, bill]);
    setSelectedOrder(null);
    
    // Remove order from pending orders
    setOrders(orders.filter(order => order.id !== selectedOrder.id));
    
    alert('Bill generated successfully!');
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing System</h1>
        <p className="text-gray-600">Generate bills and process payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Completed Orders</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No completed orders</div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedOrder?.id === order.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{order.tableNumber}</h3>
                      <p className="text-sm text-gray-500">Waiter: {order.waiter}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} items - ${calculateTotal(order.items)}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bill Generation */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Generate Bill</h2>
          </div>
          {selectedOrder ? (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedOrder.tableNumber}
                </h3>
                
                {/* Order Items */}
                <div className="space-y-2 mb-6">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Bill Calculation */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateTotal(selectedOrder.items)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>${(parseFloat(calculateTotal(selectedOrder.items)) * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${(parseFloat(calculateTotal(selectedOrder.items)) * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      Cash
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      Card
                    </label>
                  </div>
                </div>

                <button
                  onClick={generateBill}
                  className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Generate Bill & Process Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Select an order to generate bill
            </div>
          )}
        </div>
      </div>

      {/* Recent Bills */}
      {bills.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bills</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{bill.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.tableNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${bill.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bill.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}