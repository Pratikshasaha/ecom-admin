'use client';

import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      // Clear session/cookies
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('authToken');
      localStorage.removeItem('loggedInUser');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userRole');
      
      // Redirect to home/login
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-slate-800 border-b border-slate-300 relative">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-white">Precia E-Commerce Dashboard</h1>
          <nav className="text-xs text-slate-300 hidden md:block">
            <a href="/" className={`hover:text-white ${currentPage === 'dashboard' ? 'text-white font-medium' : ''}`} title="Dashboard/Profile">📊 Dashboard</a>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">{currentPage}</span>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-slate-300 hover:text-white"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>


            <nav className="hidden md:flex items-center space-x-1">
            <a href="/products" className={`px-3 py-1 text-xs ${currentPage === 'products' ? 'text-white bg-slate-700 font-medium' : 'text-slate-300 hover:text-white hover:bg-slate-700'} rounded transition`}>
              🛍️ Products
            </a>
            {typeof window !== 'undefined' ? localStorage.getItem('userRole') === 'superadmin' ? (
              <a href="/users" className={`px-3 py-1 text-xs ${currentPage === 'users' ? 'text-white bg-slate-700 font-medium' : 'text-slate-300 hover:text-white hover:bg-slate-700'} rounded transition`}>
                👥 Users
              </a>
            ) : null : null}
            <a href="/orders" className={`px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition`}>
              📋 Orders
            </a>
            <a href="/settings" className={`px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition`}>
              ⚙️ Settings
            </a>
          </nav>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md"
            aria-label="Sign out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full right-0 mt-1 w-56 bg-slate-700 rounded-lg shadow-xl border border-slate-600 z-50">
            <nav className="py-2">
              <a href="/" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                📊 Dashboard
              </a>
              <a href="/products" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                🛍️ Products
              </a>
              <a href="/users" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                👥 Users
              </a>
              <a href="/orders" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                📋 Orders
              </a>
              <a href="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition">
                ⚙️ Settings
              </a>
            </nav>
            <div className="border-t border-slate-600 p-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 text-left p-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 rounded transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

