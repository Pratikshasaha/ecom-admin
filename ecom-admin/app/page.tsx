'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);

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

      // Refresh users list
      const usersResponse = await fetch('https://ecom-rest-topaz.vercel.app/users');
      const usersData = await usersResponse.json();

      if (usersResponse.ok) {
        const usersList = Array.isArray(usersData) ? usersData : usersData.users || usersData.data || [];
        setAllUsers(usersList);
        setUsersError('');
      }

      // Reset form and close modal
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('https://ecom-rest-topaz.vercel.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid credentials');
        return;
      }

      // Extract user from nested response
      const userData = data.user || data;
      setUser(userData);

      // Fetch user details using the id from login response
      if (userData.id) {
        try {
          const profileResponse = await fetch(`https://ecom-rest-topaz.vercel.app/users/${userData.id}`);
          const profileData = await profileResponse.json();

          if (profileResponse.ok) {
            setProfile(profileData);
          }
        } catch (profileErr) {
          console.error('Failed to fetch profile:', profileErr);
        }
      }

      // Fetch all users if superadmin
      if (userData.role === 'superadmin' || userData.role === 'admin') {
        setUsersLoading(true);
        try {
          const usersResponse = await fetch('https://ecom-rest-topaz.vercel.app/users');
          const usersData = await usersResponse.json();

          if (usersResponse.ok) {
            const usersList = Array.isArray(usersData) ? usersData : usersData.users || usersData.data || [];
            setAllUsers(usersList);
            setUsersError('');
          } else {
            setUsersError(usersData.message || 'Failed to fetch users');
          }
        } catch (usersErr) {
          const errorMsg = usersErr instanceof Error ? usersErr.message : 'Failed to fetch users';
          setUsersError(errorMsg);
          console.error('Failed to fetch users:', usersErr);
        } finally {
          setUsersLoading(false);
        }
      }

      setSuccess(true);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (success && user) {
    return (
      <div className="min-h-screen bg-white text-black">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-300 relative">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
              {/* Breadcrumb */}
              <nav className="text-xs text-slate-300">
                <span>Home</span>
                <span className="mx-2">/</span>
                <span className="text-white">Dashboard</span>
              </nav>
            </div>

            {/* Navigation Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 text-slate-300 hover:text-white"
              >
                <span className="text-sm">☰</span>
              </button>

              <nav className="hidden md:flex items-center space-x-1">
                <a href="/" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
                  📊 Dashboard
                </a>
                <a href="/products" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
                  🛍️ Products
                </a>
                <a href="#users" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
                  👥 Users
                </a>
                <a href="#settings" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
                  ⚙️ Settings
                </a>
              </nav>

              <button
                onClick={() => {
                  setSuccess(false);
                  setUser(null);
                  setProfile(null);
                  setAllUsers([]);
                  setUsersError('');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-slate-700 rounded-md shadow-lg border border-slate-600 md:hidden">
                <nav className="py-2">
                  <a href="/" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                    📊 Dashboard
                  </a>
                  <a href="/products" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                    🛍️ Products
                  </a>
                  <a href="#users" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                    👥 Users
                  </a>
                  <a href="#settings" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                    ⚙️ Settings
                  </a>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Welcome Section */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-black mb-1">
              Welcome, <span className="text-slate-600">{user.name}</span>
            </h2>
            <p className="text-slate-500 text-sm">Profile information</p>
          </div>

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* User Card */}
            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">👤</span>
                <h3 className="text-sm font-semibold text-black">Profile</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-700"><span className="font-medium">Name:</span> {user.name}</p>
                <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
                <p className="text-gray-700"><span className="font-medium">ID:</span> {user.id}</p>
              </div>
            </div>

            {/* Business Card */}
            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">🏢</span>
                <h3 className="text-sm font-semibold text-black">Business</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-700"><span className="font-medium">Vendor:</span> {user.vendorName || 'N/A'}</p>
                <p className="text-gray-700"><span className="font-medium">Location:</span> {user.location || 'N/A'}</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">📱</span>
                <h3 className="text-sm font-semibold text-black">Contact</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-700"><span className="font-medium">Mobile:</span> {user.mobile || 'N/A'}</p>
                <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
              </div>
            </div>
          </div>

          {/* All Users Table - Only for Superadmin/Admin */}
          {(user.role === 'superadmin' || user.role === 'admin') && (
            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-sm mr-2">👥</span>
                  <h3 className="text-sm font-semibold text-black">
                    All Users {allUsers.length > 0 && `(${allUsers.length})`}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-medium transition"
                >
                  + Add User
                </button>
              </div>

              {/* Loading State */}
              {usersLoading && (
                <div className="text-center py-6">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400"></div>
                  </div>
                  <p className="text-slate-500 mt-2 text-sm">Loading users...</p>
                </div>
              )}

              {/* Error State */}
              {usersError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <p className="text-red-700 text-sm"><strong>Error:</strong> {usersError}</p>
                </div>
              )}

              {/* Empty State */}
              {!usersLoading && allUsers.length === 0 && !usersError && (
                <div className="text-center py-6">
                  <p className="text-slate-500 text-sm">No users found</p>
                </div>
              )}

              {/* Users Table */}
              {!usersLoading && allUsers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 border-b border-gray-300">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-gray-700">ID</th>
                        <th className="px-3 py-2 font-semibold text-gray-700">Name</th>
                        <th className="px-3 py-2 font-semibold text-gray-700">Email</th>
                        <th className="px-3 py-2 font-semibold text-gray-700">Vendor</th>
                        <th className="px-3 py-2 font-semibold text-gray-700">Location</th>
                        <th className="px-3 py-2 font-semibold text-gray-700">Mobile</th>
                        <th className="px-3 py-2 font-semibold text-gray-700">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allUsers.map((u, index) => (
                        <tr key={u.id || index} className="hover:bg-gray-50 transition">
                          <td className="px-3 py-2 text-gray-700">{u.id}</td>
                          <td className="px-3 py-2 text-gray-900 font-medium">{u.name}</td>
                          <td className="px-3 py-2 text-gray-700">{u.email}</td>
                          <td className="px-3 py-2 text-gray-700">{u.vendorName || '-'}</td>
                          <td className="px-3 py-2 text-gray-700">{u.location || '-'}</td>
                          <td className="px-3 py-2 text-gray-700">{u.mobile || '-'}</td>
                          <td className="px-3 py-2">
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
          )}
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Add New User</h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label htmlFor="new-name" className="block text-sm font-medium text-black mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="new-name"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="new-email" className="block text-sm font-medium text-black mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="new-email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-black mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: password123 (can be changed)</p>
                </div>

                <div>
                  <label htmlFor="new-vendor" className="block text-sm font-medium text-black mb-1">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    id="new-vendor"
                    value={newUserForm.vendorName}
                    onChange={(e) => setNewUserForm({...newUserForm, vendorName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="new-location" className="block text-sm font-medium text-black mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="new-location"
                    value={newUserForm.location}
                    onChange={(e) => setNewUserForm({...newUserForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="new-mobile" className="block text-sm font-medium text-black mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    id="new-mobile"
                    value={newUserForm.mobile}
                    onChange={(e) => setNewUserForm({...newUserForm, mobile: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="new-role" className="block text-sm font-medium text-black mb-1">
                    Role *
                  </label>
                  <select
                    id="new-role"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded font-medium text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingUser}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded font-medium text-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="bg-white p-6 rounded max-w-sm w-full">
        <h1 className="text-xl font-bold mb-4 text-center text-black">Admin Login</h1>

        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
