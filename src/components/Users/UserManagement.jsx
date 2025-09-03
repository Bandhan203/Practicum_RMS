import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Users, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Shield,
  ChefHat,
  UserCheck,
  Crown,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Ban,
  CheckCircle,
  Star,
  Award,
  MapPin,
  Activity,
  Eye,
  X,
  Save,
  AlertTriangle,
  Download,
  UserPlus,
  Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function UserManagement() {
  const { 
    appUsers, 
    addUser, 
    updateUser, 
    deleteUser, 
    updateUserStatus,
    updateUserPoints,
    orders
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // table or cards

  const roles = ['all', 'admin', 'chef', 'waiter'];
  const statuses = ['all', 'active', 'suspended', 'banned'];

  // Filter users
  const filteredUsers = useMemo(() => {
    return appUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [appUsers, searchTerm, selectedRole, selectedStatus]);

  // Calculate user statistics
  const userStats = useMemo(() => {
    const totalUsers = appUsers.length;
    const activeUsers = appUsers.filter(u => u.status === 'active').length;
    const staff = appUsers.filter(u => ['admin', 'chef', 'waiter'].includes(u.role)).length;
    const newThisMonth = appUsers.filter(u => {
      const joinDate = new Date(u.joinedDate);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return joinDate >= thisMonth;
    }).length;

    return { totalUsers, activeUsers, staff, newThisMonth };
  }, [appUsers]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'chef': return <ChefHat className="w-4 h-4 text-orange-500" />;
      case 'waiter': return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'customer': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'banned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLoyaltyColor = (tier) => {
    switch (tier) {
      case 'Platinum': return 'text-gray-800 bg-gray-100';
      case 'Gold': return 'text-yellow-800 bg-yellow-100';
      case 'Silver': return 'text-gray-600 bg-gray-50';
      case 'Bronze': return 'text-orange-800 bg-orange-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleAddUser = (formData) => {
    addUser(formData);
    setShowAddForm(false);
  };

  const handleUpdateUser = (formData) => {
    if (!editingUser) return;
    updateUser(editingUser.id, formData);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
      setShowUserDetails(null);
    }
  };

  const handleStatusChange = (userId, newStatus, reason = '') => {
    updateUserStatus(userId, newStatus, reason);
  };

  const handlePointsUpdate = (userId, pointsChange) => {
    updateUserPoints(userId, pointsChange);
  };

  const exportUsers = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      filters: { searchTerm, selectedRole, selectedStatus },
      users: filteredUsers,
      statistics: userStats
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `users-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const UserForm = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'waiter',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || '',
      notes: user?.notes || '',
      preferences: user?.preferences?.join(', ') || '',
      permissions: user?.permissions?.join(', ') || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const userData = {
        ...formData,
        preferences: formData.preferences ? formData.preferences.split(',').map(p => p.trim()) : [],
        permissions: formData.permissions ? formData.permissions.split(',').map(p => p.trim()) : []
      };
      onSubmit(userData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {user ? 'Edit User' : 'Add New User'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-1"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="customer">Customer</option>
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street address, City, State"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.permissions}
                  onChange={(e) => setFormData({...formData, permissions: e.target.value})}
                  placeholder="kitchen, menu, orders (comma separated)"
                  />
                </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about the user..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {user ? 'Update' : 'Add'} User
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const UserDetailsModal = ({ user, onClose }) => {
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [pointsChange, setPointsChange] = useState('');
    
    const userOrders = orders.filter(order => order.customerId === user.id);
    
    const handlePointsUpdate = () => {
      const points = parseInt(pointsChange);
      if (!isNaN(points) && points !== 0) {
        handlePointsUpdate(user.id, points);
        setShowPointsModal(false);
        setPointsChange('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-900">User Profile</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center text-2xl">
                  {getRoleIcon(user.role)}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{user.name}</h4>
                  <p className="text-gray-600 capitalize flex items-center">
                    {getRoleIcon(user.role)}
                    <span className="ml-2">{user.role}</span>
                  </p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    {user.loyaltyTier && (
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLoyaltyColor(user.loyaltyTier)}`}>
                        <Award className="w-3 h-3 mr-1" />
                        {user.loyaltyTier}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-3">Contact Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{user.address}</span>
                    </div>
                  )}
                  {user.emergencyContact && (
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-gray-900">Emergency: {user.emergencyContact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Activity */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-3">Activity</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{format(new Date(user.joinedDate), 'PPP')}</span>
                    </div>
                  </div>
                  {user.lastLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences & Notes */}
              {(user.preferences?.length > 0 || user.notes) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">Additional Information</h5>
                  {user.preferences?.length > 0 && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700">Preferences</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.preferences.map((pref, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {user.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-gray-900 mt-1">{user.notes}</p>
                    </div>
                  )}
                  {user.suspensionReason && (
                    <div>
                      <label className="block text-sm font-medium text-red-700">Suspension Reason</label>
                      <p className="text-red-900 mt-1">{user.suspensionReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Statistics Sidebar */}
            <div className="space-y-4">
              {user.permissions?.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h6 className="font-semibold text-green-900 mb-2">Permissions</h6>
                  <div className="space-y-1">
                    {user.permissions.map((permission, index) => (
                      <div key={index} className="text-sm text-green-800 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setEditingUser(user);
                onClose();
              }}
              className="bg-brand-dark text-white px-4 py-2 rounded-md hover:bg-brand-light focus:ring-2 focus:ring-brand-light flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </button>
            
            {user.status === 'active' ? (
              <button
                onClick={() => {
                  const reason = prompt('Reason for suspension:');
                  if (reason) {
                    handleStatusChange(user.id, 'suspended', reason);
                    onClose();
                  }
                }}
                className="bg-brand-light text-white px-4 py-2 rounded-md hover:bg-brand-dark focus:ring-2 focus:ring-brand-dark flex items-center"
              >
                <Ban className="w-4 h-4 mr-2" />
                Suspend User
              </button>
            ) : (
              <button
                onClick={() => {
                  handleStatusChange(user.id, 'active');
                  onClose();
                }}
                className="bg-brand-light text-white px-4 py-2 rounded-md hover:bg-brand-dark focus:ring-2 focus:ring-brand-dark flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate User
              </button>
            )}
            
            <button
              onClick={() => handleDeleteUser(user.id)}
              className="bg-brand-dark text-white px-4 py-2 rounded-md hover:bg-brand-light focus:ring-2 focus:ring-brand-light flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </button>
          </div>

          {/* Points Adjustment Modal */}
          {showPointsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h4 className="text-lg font-semibold mb-4">Adjust Loyalty Points</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points Change (+ to add, - to subtract)
                    </label>
                    <input
                      type="number"
                      value={pointsChange}
                      onChange={(e) => setPointsChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., +50 or -25"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handlePointsUpdate}
                      className="flex-1 bg-brand-dark text-white py-2 px-4 rounded-md hover:bg-brand-light"
                    >
                      Update Points
                    </button>
                    <button
                      onClick={() => {
                        setShowPointsModal(false);
                        setPointsChange('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Allow all users to access user management in simplified version
  // if (currentUser?.role !== 'admin') {
  //   return (
  //     <div className="p-6">
  //       <div className="text-center py-12">
  //         <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
  //         <p className="text-gray-500">You don&apos;t have permission to access user management.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and customer accounts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportUsers}
            className="bg-brand-light text-white px-4 py-2 rounded-md hover:bg-brand-dark focus:ring-2 focus:ring-brand-light flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-brand-dark text-white px-4 py-2 rounded-md hover:bg-brand-light focus:ring-2 focus:ring-brand-light flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{userStats.activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-purple-600">{userStats.customers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Staff</p>
              <p className="text-2xl font-bold text-red-600">{userStats.staff}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <UserPlus className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-orange-600">{userStats.newThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="w-4 h-4 mr-1" />
            {filteredUsers.length} of {appUsers.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mr-4">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="text-sm text-gray-900">{user.phone}</div>
                      )}
                      {user.address && (
                        <div className="text-xs text-gray-500 truncate max-w-32" title={user.address}>
                          {user.address}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        Joined {format(new Date(user.joinedDate), 'MMM dd, yyyy')}
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-gray-500">
                          Last login {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      Staff member
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowUserDetails(user)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first user.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Forms and Modals */}
      {showAddForm && (
        <UserForm
          onSubmit={handleAddUser}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      
      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
        />
      )}

      {showUserDetails && (
        <UserDetailsModal
          user={showUserDetails}
          onClose={() => setShowUserDetails(null)}
        />
      )}
    </div>
  );
}
