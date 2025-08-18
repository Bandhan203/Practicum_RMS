import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Calendar, Plus, Clock, Users, Check, X, Edit2, Trash2, Search } from 'lucide-react';
import { format, startOfToday } from 'date-fns';

export function ReservationManagement() {
  const { reservations, addReservation, updateReservation, deleteReservation } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '19:00',
    guests: 2,
    specialRequests: '',
    table: ''
  });

  const reservationStatuses = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'];
  const tables = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'VIP1', 'VIP2', 'P1', 'P2'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReservation = {
      id: editingReservation?.id || Date.now().toString(),
      ...formData,
      status: editingReservation?.status || 'pending',
      createdAt: editingReservation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingReservation) {
      updateReservation(newReservation);
      setEditingReservation(null);
    } else {
      addReservation(newReservation);
    }

    setFormData({
      customerName: '',
      email: '',
      phone: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '19:00',
      guests: 2,
      specialRequests: '',
      table: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setFormData({
      customerName: reservation.customerName,
      email: reservation.email,
      phone: reservation.phone,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      specialRequests: reservation.specialRequests || '',
      table: reservation.table || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      deleteReservation(id);
    }
  };

  const handleStatusChange = (reservationId, newStatus) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      updateReservation({ ...reservation, status: newStatus, updatedAt: new Date().toISOString() });
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    const today = startOfToday();
    const reservationDate = new Date(reservation.date);
    let matchesDate = true;
    
    if (dateFilter === 'today') {
      matchesDate = format(reservationDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    } else if (dateFilter === 'upcoming') {
      matchesDate = reservationDate >= today;
    } else if (dateFilter === 'past') {
      matchesDate = reservationDate < today;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'seated': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTodayStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayReservations = reservations.filter(r => r.date === today);
    
    return {
      total: todayReservations.length,
      confirmed: todayReservations.filter(r => r.status === 'confirmed').length,
      pending: todayReservations.filter(r => r.status === 'pending').length,
      seated: todayReservations.filter(r => r.status === 'seated').length
    };
  };

  const stats = getTodayStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservation Management</h1>
          <p className="text-gray-600">Manage restaurant reservations and table bookings</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingReservation(null);
            setFormData({
              customerName: '',
              email: '',
              phone: '',
              date: format(new Date(), 'yyyy-MM-dd'),
              time: '19:00',
              guests: 2,
              specialRequests: '',
              table: ''
            });
          }}
          className="bg-[#6B0000] text-white px-4 py-2 rounded-lg hover:bg-[#5A0000] flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-[#6B0000]" />
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Check className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Seated</p>
              <p className="text-2xl font-bold text-green-600">{stats.seated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
          >
            <option value="all">All Status</option>
            {reservationStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingReservation ? 'Edit Reservation' : 'New Reservation'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests *
              </label>
              <input
                type="number"
                required
                min="1"
                max="20"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Table
              </label>
              <select
                value={formData.table}
                onChange={(e) => setFormData({ ...formData, table: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
              >
                <option value="">Select Table</option>
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0000] focus:border-transparent"
                placeholder="Any special requests or dietary requirements..."
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-[#6B0000] text-white px-6 py-2 rounded-lg hover:bg-[#5A0000] flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>{editingReservation ? 'Update' : 'Create'} Reservation</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingReservation(null);
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Reservations ({filteredReservations.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No reservations found
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{reservation.customerName}</div>
                        <div className="text-sm text-gray-500">{reservation.email}</div>
                        <div className="text-sm text-gray-500">{reservation.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{format(new Date(reservation.date), 'MMM dd, yyyy')}</div>
                      <div className="text-sm text-gray-500">{reservation.time}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reservation.guests}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reservation.table || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[#6B0000] ${getStatusColor(reservation.status)}`}
                      >
                        {reservationStatuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(reservation)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
