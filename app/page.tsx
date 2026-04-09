'use client';

import { useState } from 'react';

interface UserType {
  id: string | number;
  name: string;
  email: string;
  vendorName?: string;
  location?: string;
  mobile?: string;
  role: string;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      const userData = data.user || data;
      setUser(userData);

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
              <nav className="text-xs text-slate-300">
                <span>Home</span>
                <span className="mx-2">/</span>
                <span className="text-white">Dashboard</span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 text-slate-300 hover:text-white"
              >
                <span className="text-sm">☰</span>
              </button>

              <nav className="hidden md:flex items-center space-x-1">
                <a href="/" className="px-3 py-1 text-xs text-white bg-slate-700 rounded transition">
                  📊 Dashboard
                </a>
                <a href="/products" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
                  🛍️ Products
                </a>
                <a href="/users" className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
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
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition"
              >
                Sign Out
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-slate-700 rounded-md shadow-lg border border-slate-600 md:hidden">
                <nav className="py-2">
                  <a href="/" className="block px-4 py-2 text-sm text-white bg-slate-600 transition">
                    📊 Dashboard
                  </a>
                  <a href="/products" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                    🛍️ Products
                  </a>
                  <a href="/users" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
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

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-black mb-1">
              Welcome, <span className="text-slate-600">{user?.name ?? 'User'}</span>
            </h2>
            <p className="text-slate-500 text-sm">Profile information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">👤</span>
                <h3 className="text-sm font-semibold text-black">Profile</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-700"><span className="font-medium">Name:</span> {user?.name ?? 'N/A'}</p>
                <p className="text-gray-700"><span className="font-medium">Email:</span> {user?.email ?? 'N/A'}</p>
                <p className="text-gray-700"><span className="font-medium">ID:</span> {user?.id ?? 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">🏢</span>
                <h3 className="text-sm font-semibold text-black">Business</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-700"><span className="font-medium">Vendor:</span> {user?.vendorName ?? 'N/A'}</p>
                <p className="text-gray-700"><span className="font-medium">Location:</span> {user?.location ?? 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">📱</span>
                <h3 className="text-sm font-semibold text-black">Contact</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-700"><span className="font-medium">Mobile:</span> {user?.mobile ?? 'N/A'}</p>
                <p className="text-gray-700"><span className="font-medium">Email:</span> {user?.email ?? 'N/A'}</p>
              </div>
            </div>
          </div>

          {(user?.role === 'superadmin' || user?.role === 'admin') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
              <h3 className="text-sm font-semibold text-black mb-2 flex items-center">
                <span className="mr-2">👥</span>
                Users Management
              </h3>
              <p className="text-xs text-slate-600 mb-3">Manage users via dedicated page</p>
              <a
                href="/users"
                className="inline-flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded transition"
              >
                👥 View All Users
              </a>
            </div>
          )}
        </div>
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

