'use client';

import { useState, useEffect } from "react";
import Header from "../../components/Header";

interface Order {
  id: string | number;
  orderId?: string;
  userId?: string | number;
  email?: string;
  price: number;
  status: string;
  paymentStatus: string;
  items: Array<{
    productId: string | number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://ecom-rest-topaz.vercel.app/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      const ordersList = Array.isArray(data) ? data : data.orders || data.data || [];
      setOrders(ordersList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-2"></div>
          <p className="text-slate-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header currentPage="Orders" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black mb-1">Orders Management</h2>
          <p className="text-slate-500 text-sm">View all customer orders</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-700 text-sm"><strong>Error:</strong> {error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition"
            >
              Retry
            </button>
          </div>
        )}

        {orders.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500 text-lg mb-2">No orders found</p>
            <p className="text-slate-400 text-sm">Orders will appear here when customers place them.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-lg mr-3">📋</span>
                <h3 className="text-lg font-semibold text-black">
                  All Orders ({orders.length})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchOrders}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-1.5 rounded text-sm font-medium transition flex items-center"
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Order ID</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Customer</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Items</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Payment</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700 font-mono text-sm sticky left-0 bg-white z-10 border-r border-gray-200">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium max-w-xs truncate" title={order.email}>
                        {order.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg">₹{Number(order.price).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{order.items?.length || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
