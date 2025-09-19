import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Revenue Trend Chart
export const RevenueTrendChart = ({ data, groupBy = 'day' }) => {
  const formatTooltipLabel = (label) => {
    if (groupBy === 'week') {
      return `Week ${label}`;
    } else if (groupBy === 'month') {
      return label;
    }
    return label;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="period" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis />
        <Tooltip
          labelFormatter={formatTooltipLabel}
          formatter={(value, name) => [
            name === 'revenue' ? `$${parseFloat(value).toFixed(2)}` : value,
            name === 'revenue' ? 'Revenue' : 
            name === 'orders' ? 'Orders' : 'Avg Order Value'
          ]}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3B82F6"
          fillOpacity={1}
          fill="url(#revenueGradient)"
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#10B981"
          strokeWidth={2}
          name="Orders"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Revenue by Category Chart
export const RevenueByCategoryChart = ({ data }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="revenue"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Revenue']} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Top Items Chart
export const TopItemsChart = ({ data }) => {
  const formattedData = data.slice(0, 10).map(item => ({
    ...item,
    name: item.item_name.length > 20 ? item.item_name.substring(0, 20) + '...' : item.item_name
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formattedData} layout="horizontal" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={100}
          fontSize={12}
        />
        <Tooltip
          formatter={(value, name) => [
            name === 'quantity_sold' ? `${value} units` : `$${parseFloat(value).toFixed(2)}`,
            name === 'quantity_sold' ? 'Quantity Sold' : 'Revenue'
          ]}
        />
        <Legend />
        <Bar dataKey="quantity_sold" fill="#3B82F6" name="Quantity Sold" />
        <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Payment Mix Chart
export const PaymentMixChart = ({ data }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  const formattedData = data.map(item => ({
    name: item.payment_method.replace('_', ' ').toUpperCase(),
    value: parseFloat(item.total_amount),
    count: item.transaction_count
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => [
            `$${parseFloat(value).toFixed(2)}`,
            `Revenue (${props.payload.count} transactions)`
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Waiter Performance Chart
export const WaiterPerformanceChart = ({ data }) => {
  const formattedData = data.slice(0, 8).map(waiter => ({
    ...waiter,
    name: waiter.waiter_name.length > 15 ? waiter.waiter_name.substring(0, 15) + '...' : waiter.waiter_name
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis yAxisId="revenue" orientation="left" />
        <YAxis yAxisId="orders" orientation="right" />
        <Tooltip
          formatter={(value, name) => [
            name.includes('revenue') ? `$${parseFloat(value).toFixed(2)}` : 
            name.includes('rating') ? `${parseFloat(value).toFixed(1)} stars` : value,
            name.includes('revenue') ? 'Revenue' :
            name.includes('orders') ? 'Orders' :
            name.includes('rating') ? 'Avg Rating' : name
          ]}
        />
        <Legend />
        <Bar yAxisId="revenue" dataKey="total_revenue" fill="#3B82F6" name="Revenue" />
        <Bar yAxisId="orders" dataKey="total_orders" fill="#10B981" name="Orders" />
        <Line yAxisId="rating" dataKey="avg_rating" stroke="#F59E0B" strokeWidth={3} name="Avg Rating" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Top Customers Chart
export const TopCustomersChart = ({ data }) => {
  const formattedData = data.slice(0, 10).map(customer => ({
    ...customer,
    name: customer.customer_name.length > 20 ? customer.customer_name.substring(0, 20) + '...' : customer.customer_name
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formattedData} layout="horizontal" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={120}
          fontSize={12}
        />
        <Tooltip
          formatter={(value, name) => [
            name === 'total_spent' ? `$${parseFloat(value).toFixed(2)}` : 
            name === 'avg_order_value' ? `$${parseFloat(value).toFixed(2)}` : value,
            name === 'total_spent' ? 'Total Spent' :
            name === 'order_count' ? 'Orders' : 'Avg Order Value'
          ]}
        />
        <Legend />
        <Bar dataKey="total_spent" fill="#3B82F6" name="Total Spent" />
        <Bar dataKey="order_count" fill="#10B981" name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
};