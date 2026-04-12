'use client';

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import Header from "../../components/Header";
import EditUserModal from './EditUserModal';

interface User {
  id: string | number;
  name: string;
  email: string;
  vendorName?: string;
  location?: string;
  mobile?: string;
  role: string;
  status?: string;
}

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    vendorName: '',
    location: '',
    mobile: '',
    role: 'user',
    password: 'password123',
    status: 'pending'
  });
  const [addingUser, setAddingUser] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    vendorName: '',
    location: '',
    mobile: '',
    role: 'user',
    status: 'pending'
  });
  const [tempStatuses, setTempStatuses] = useState<Record<string, string>>({});
  const [loggedInUser, setLoggedInUser] = useState<{ role?: string } | null>(null);

  // Filter states
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get logged in user role for superadmin check
  useEffect(() => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('loggedInUser') || '{}') : {};
    setLoggedInUser(user);
  }, []);

  const isSuperAdmin = loggedInUser?.role === 'superadmin';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const response = await fetch('https://ecom-rest-topaz.vercel.app/users');
      const usersData = await response.json();

      if (!response.ok) {
        throw new Error(usersData.message || 'Failed to fetch users');
      }

      const usersList = Array.isArray(usersData) ? usersData : usersData.users || usersData.data || [];
      setAllUsers(usersList);

      // Reset temp statuses
      const newTemp: Record<string, string> = {};
      usersList.forEach((u: User) => {
        newTemp[String(u.id)] = u.status || 'pending';
      });
      setTempStatuses(newTemp);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      // Role filter
      if (filterRole !== 'all' && user.role !== filterRole) return false;

      // Status filter
      if (filterStatus !== 'all' && user.status !== filterStatus) return false;

      // Search filter
      if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !user.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [allUsers, filterRole, filterStatus, searchTerm]);

  // Filter counts
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: filteredUsers.length };
    allUsers.forEach((user) => {
      counts[user.role] = (counts[user.role] || 0) + 1;
    });
    return counts;
  }, [allUsers]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: filteredUsers.length };
    allUsers.forEach((user) => {
      const status = user.status || 'pending';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [allUsers]);

  const handleUpdateStatus = async (userId: string | number, newStatus: string) => {
    if (!isSuperAdmin) return;
    
    try {
      const response = await fetch(`https://ecom-rest-topaz.vercel.app/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update status');
      }
      await fetchUsers();
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    if (!editingUser) return;
    e.preventDefault();
    const userId = editingUser.id;
    const response = await fetch(`https://ecom-rest-topaz.vercel.app/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editUserForm),
    });
    const data = await response.json();
    if (response.ok) {
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } else {
      setUsersError(data.message || 'Update failed');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const response = await fetch(`https://ecom-rest-topaz.vercel.app/users/${userId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      await fetchUsers();
    } else {
      const data = await response.json();
      setUsersError(data.message || 'Delete failed');
    }
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setEditUserForm({
      name: u.name,
      email: u.email,
      vendorName: u.vendorName || '',
      location: u.location || '',
      mobile: u.mobile || '',
      role: u.role,
      status: u.status || 'pending'
    });
    setShowEditModal(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['pending', 'approved'];

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setUsersError('');

    try {
      const response = await fetch('https://ecom-rest-topaz.vercel.app/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUserForm,
          status: 'pending'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUsersError(data.message || 'Failed to add user');
        return;
      }

      await fetchUsers();
      setNewUserForm({
        name: '',
        email: '',
        vendorName: '',
        location: '',
        mobile: '',
        role: 'user',
        password: 'password123',
        status: 'pending'
      });
      setShowAddUserModal(false);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  const clearFilters = () => {
    setFilterRole('all');
    setFilterStatus('all');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header currentPage="Users" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black mb-1">Users Management</h2>
          <p className="text-slate-500 text-sm">Manage all users in the system</p>
        </div>

        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center">
              <span className="text-lg mr-3">👥</span>
              <h3 className="text-lg font-semibold text-black">
                {filteredUsers.length} of {allUsers.length} Users
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded font-medium transition"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-1.5 rounded text-sm font-medium transition"
              >
                + Add User
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-lg border">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                placeholder="Name or email..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none"
              >
                <option value="all">{roleCounts.all} All</option>
                <option value="user">{roleCounts.user || 0} User</option>
                <option value="admin">{roleCounts.admin || 0} Admin</option>
                <option value="superadmin">{roleCounts.superadmin || 0} Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none"
              >
                <option value="all">{statusCounts.all} All</option>
                <option value="pending">{statusCounts.pending || 0} Pending</option>
                <option value="approved">{statusCounts.approved || 0} Approved</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {usersLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading users...</p>
            </div>
          )}

          {/* Error */}
          {usersError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-700 text-sm"><strong>Error:</strong> {usersError}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!usersLoading && filteredUsers.length === 0 && !usersError && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-500 text-lg mb-2">No users match your filters</p>
              <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Table */}
          {!usersLoading && filteredUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-3 py-3 font-semibold text-gray-700">ID</th>
                    <th className="px-3 py-3 font-semibold text-gray-700">Name</th>
                    <th className="px-3 py-3 font-semibold text-gray-700">Email</th>
                    <th className="px-3 py-3 font-semibold text-gray-700">Vendor</th>
                    <th className="px-3 py-3 font-semibold text-gray-700">Location</th>
                    <th className="px-3 py-3 font-semibold text-gray-700">Mobile</th>
                    <th className="px-3 py-3 font-semibold text-gray-700">Role</th>
                    <th className="px-3 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-3 py-3 font-semibold text-gray-700 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((u, index) => {
                    const userIdStr = String(u.id);
                    const currentTempStatus = tempStatuses[userIdStr] || (u.status || 'pending');
                    return (
                      <tr key={u.id || index} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-gray-700">{u.id}</td>
                        <td className="px-3 py-3 text-gray-900 font-medium">{u.name}</td>
                        <td className="px-3 py-3 text-gray-700">{u.email}</td>
                        <td className="px-3 py-3 text-gray-700">{u.vendorName || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{u.location || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{u.mobile || '-'}</td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(currentTempStatus)}`}>
                            {currentTempStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center space-x-1">
                            {isSuperAdmin && (
                              <>
                                <select
                                  value={currentTempStatus}
                                  onChange={(e) => setTempStatuses({
                                    ...tempStatuses,
                                    [userIdStr]: e.target.value
                                  })}
                                  className="text-xs px-1.5 py-0.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                                >
                                  {statusOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleUpdateStatus(u.id, currentTempStatus)}
                                  className="text-blue-600 hover:text-blue-800 text-xs p-0.5 hover:bg-blue-50 rounded transition"
                                  title="Update Status"
                                >
                                  ✓
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleEditUser(u)}
                              className="text-blue-600 hover:text-blue-800 text-xs p-1 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteUser(String(u.id))}
                              className="text-red-600 hover:text-red-800 text-xs p-1 hover:bg-red-50 rounded transition"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="bg-slate-800 text-white p-4 rounded-t-lg flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Add New User</h3>
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input
                        type="text"
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <input
                        type="email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Password *</label>
                      <input
                        type="password"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: password123</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Vendor Name</label>
                      <input
                        type="text"
                        value={newUserForm.vendorName}
                        onChange={(e) => setNewUserForm({ ...newUserForm, vendorName: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        type="text"
                        value={newUserForm.location}
                        onChange={(e) => setNewUserForm({ ...newUserForm, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mobile</label>
                      <input
                        type="tel"
                        value={newUserForm.mobile}
                        onChange={(e) => setNewUserForm({ ...newUserForm, mobile: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium mb-1">Role *</label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                    <div className="col-span-full flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded font-medium text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingUser}
                        className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded font-medium text-sm disabled:opacity-50"
                      >
                        {addingUser ? 'Adding...' : 'Add User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && editingUser && (
            <EditUserModal
              editingUser={editingUser}
              editUserForm={editUserForm}
              setEditUserForm={setEditUserForm}
              handleUpdateUser={handleUpdateUser}
              setShowEditModal={setShowEditModal}
              loggedInUserRole={loggedInUser?.role}
            />
          )}
        </div>
      </div>
    </div>
  );
}

