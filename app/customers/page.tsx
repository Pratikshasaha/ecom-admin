"use client";

import { useState, useEffect } from 'react';
import Header from "../../components/Header";

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  return (
    <div className='min-h-screen bg-white text-black'>
      <Header currentPage='Customers' />
      <div className='max-w-6xl mx-auto px-4 py-6'>
        <div className='mb-6'>
          <h2 className='text-xl font-bold text-black mb-1'>Customer Portal</h2>
          <p className='text-slate-500 text-sm'>Welcome to your customer dashboard</p>
        </div>
        <div className='bg-slate-50 border border-slate-200 rounded-lg p-12 text-center shadow-sm'>
          <div className='w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center'>
            <svg className='w-12 h-12 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
            </svg>
          </div>
          <h3 className='text-2xl font-bold text-slate-900 mb-4'>Customer Dashboard</h3>
          <p className='text-lg text-slate-600 mb-8 max-w-md mx-auto leading-relaxed'>
            Your orders, profile and shopping history will appear here.
          </p>
          <p className='text-sm text-slate-500 mb-8'>
            Coming soon...
          </p>
          <div className='space-x-3'>
            <a href='/orders' className='inline-block px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors'>
              View Orders
            </a>
            <a href='/' className='inline-block px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors'>
              ← Back
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

