'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string | number;
  name: string;
  email: string;
  vendorName?: string;
  location?: string;
  mobile?: string;
  role: string;
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
    password: 'password123'
  });
  const [addingUser, setAddingUser] = useState(false);

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
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

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
        body: JSON.stringify(newUserForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setUsersError(data.message || 'Failed to add user');
        return;
      }

      // Refresh list
      await fetchUsers();

      // Reset form
      setNewUserForm({
        name: '',
        email: '',
        vendorName: '',
        location: '',
        mobile: '',
        role: 'user',
        password: 'password123'
      });
      setShowAddUserModal(false);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header - same as other pages */}
      <div className="bg-slate-800 border-b border-slate-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
            <nav className="text-xs text-slate-300">
              <a href="/" className="hover:text-white">Home</a>
              <span className="mx-2">/</span>
              <span className="text-white">Users</span>
            </nav>
          </div>
          <nav className="flex items-center space-x-1">
            <a href="/" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
              📊 Dashboard
            </a>
            <a href="/products" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
              🛍️ Products
            </a>
            <a href="/users" className="px-3 py-1 text-xs text-white bg-slate-700 rounded transition">
              👥 Users
            </a>
            <a href="#settings" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
              ⚙️ Settings
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black mb-1">Users Management</h2>
          <p className="text-slate-500 text-sm">Manage all users in the system</p>
        </div>

        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-lg mr-3">👥</span>
              <h3 className="text-lg font-semibold text-black">
                All Users {allUsers.length > 0 && `(${allUsers.length})`}
              </h3>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-1.5 rounded text-sm font-medium transition"
            >
              + Add User
            </button>
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
          {!usersLoading && allUsers.length === 0 && !usersError && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg mb-2">No users found</p>
              <p className="text-slate-400 text-sm">Add your first user to get started.</p>
            </div>
          )}

          {/* Table */}
          {!usersLoading && allUsers.length > 0 && (
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allUsers.map((u, index) => (
                    <tr key={u.id || index} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-gray-700">{u.id}</td>
                      <td className="px-3 py-3 text-gray-900 font-medium">{u.name}</td>
                      <td className="px-3 py-3 text-gray-700">{u.email}</td>
                      <td className="px-3 py-3 text-gray-700">{u.vendorName || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{u.location || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{u.mobile || '-'}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New User</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
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
              <div>
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
              <div className="flex space-x-3">
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
      )}
    </div>
  );
}

