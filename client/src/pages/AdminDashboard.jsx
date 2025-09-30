import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  Search
} from 'lucide-react';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, selectedRole],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRole) params.append('role', selectedRole);
      params.append('limit', '20');
      
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-stats']);
    },
    onError: (error) => {
      alert(`Failed to update user: ${error.message}`);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-stats']);
      alert('User deleted successfully');
    },
    onError: (error) => {
      alert(`Failed to delete user: ${error.message}`);
    }
  });

  const handleStatusToggle = (userId, currentStatus) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      updateUserStatusMutation.mutate({
        userId,
        isActive: !currentStatus
      });
    }
  };

  const handleDeleteUser = (userId, userName) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-secondary">Manage users and monitor platform activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Users</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.stats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Products</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.stats?.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Orders</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.stats?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Sales</p>
                <p className="text-2xl font-bold text-text-primary">
                  ₹{stats?.stats?.totalSales?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats?.stats?.totalSellers || 0}
            </div>
            <div className="text-text-secondary">Sellers</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats?.stats?.totalRetailers || 0}
            </div>
            <div className="text-text-secondary">Retailers</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats?.stats?.activeProducts || 0}
            </div>
            <div className="text-text-secondary">Active Products</div>
          </div>
        </div>

        {/* Platform Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats?.stats?.totalSales > 0 ? '₹' + (stats.stats.totalSales / 100000).toFixed(1) + 'L' : '₹0'}
            </div>
            <div className="text-text-secondary">Platform Revenue</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats?.stats?.totalOrders > 0 ? Math.round(stats.stats.totalSales / stats.stats.totalOrders) : 0}
            </div>
            <div className="text-text-secondary">Avg Order Value</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {stats?.stats?.totalProducts > 0 ? Math.round((stats.stats.activeProducts / stats.stats.totalProducts) * 100) : 0}%
            </div>
            <div className="text-text-secondary">Product Activation Rate</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {stats?.stats?.totalUsers > 0 ? Math.round((stats.stats.totalSellers + stats.stats.totalRetailers) / stats.stats.totalUsers * 100) : 0}%
            </div>
            <div className="text-text-secondary">Active User Rate</div>
          </div>
        </div>

        {/* User Management */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">User Management</h3>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="seller">Sellers</option>
              <option value="retailer">Retailers</option>
              <option value="admin">Admins</option>
            </select>
            <div className="text-sm text-text-secondary flex items-center">
              Total: {users?.pagination?.totalUsers || 0} users
            </div>
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : !users?.users?.length ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-text-secondary">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">User</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Business</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-text-secondary">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{user.businessName}</p>
                          {user.businessType && (
                            <p className="text-sm text-text-secondary">{user.businessType}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {user.pincode}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                            className={`p-1 rounded ${
                              user.isActive 
                                ? 'text-red-500 hover:bg-red-50' 
                                : 'text-green-500 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id, user.businessName)}
                            className="p-1 rounded text-red-500 hover:bg-red-50"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
