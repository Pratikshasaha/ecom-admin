"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Header from "../../components/Header";
import EditOrderModal from "./EditOrderModal";

interface Order {
  id: string | number;
  productId: string | number;
  quantity: number;
  price: number;
  userName: string;
  mobile: string;
  address: string;
  email: string;
  date: string;
  vendorName: string;
  paymentType: string;
  status: string;
  productName?: string;
  notes?: string;
}

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    paymentType: "",
    notes: "",
  });
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Status changer
  const [tempStatuses, setTempStatuses] = useState<Record<string, string>>({});

  // Logged in user
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('loggedInUser') || '{}') : {};
    setLoggedInUser(user);
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders();
    }
  }, [loggedInUser]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const ordersRes = await fetch("https://ecom-rest-topaz.vercel.app/orders");
      const ordersData = await ordersRes.json();
      if (!ordersRes.ok) throw new Error(ordersData.message || "Failed to fetch orders");

      const rawOrders = Array.isArray(ordersData) ? ordersData : ordersData.orders || ordersData.data || [];

      // Enrich products
      const productsRes = await fetch("https://ecom-rest-topaz.vercel.app/products");
      const productsData = await productsRes.json();
      const productMap: Record<string, { name: string }> = {};
      (Array.isArray(productsData) ? productsData : productsData.products || productsData.data || []).forEach((p: any) => {
        productMap[p.id] = { name: p.name };
      });

      const enrichedOrders: Order[] = rawOrders.map((o: any) => ({
        ...o,
        productName: productMap[o.productId]?.name || `Product #${o.productId}`,
      }));

      // Role filter first
      let roleFiltered = enrichedOrders;
      if (loggedInUser?.role !== 'superadmin' && loggedInUser?.email) {
        roleFiltered = enrichedOrders.filter((order) => order.email === loggedInUser.email);
      }

      setAllOrders(roleFiltered);
      applyFilters(roleFiltered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (ordersList: Order[]) => {
    const filtered = ordersList.filter((order) => {
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;
      if (filterPayment !== 'all' && order.paymentType !== filterPayment) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!order.userName.toLowerCase().includes(searchLower) &&
            !order.productName?.toLowerCase().includes(searchLower) &&
            !order.vendorName.toLowerCase().includes(searchLower) &&
            !order.email.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });

    setOrders(filtered);

    const newTemp: Record<string, string> = {};
    filtered.forEach((order) => {
      newTemp[String(order.id)] = order.status;
    });
    setTempStatuses(newTemp);
  };

  const handleFilterStatus = (e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value);
  const handleFilterPayment = (e: ChangeEvent<HTMLSelectElement>) => setFilterPayment(e.target.value);
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterPayment('all');
    setSearchTerm('');
    applyFilters(allOrders);
  };

  const statusCounts = allOrders.reduce((counts, order) => {
    counts[order.status] = (counts[order.status] || 0) + 1;
    counts.all = allOrders.length;
    return counts;
  }, {} as Record<string, number>);

  const paymentCounts = allOrders.reduce((counts, order) => {
    counts[order.paymentType] = (counts[order.paymentType] || 0) + 1;
    counts.all = allOrders.length;
    return counts;
  }, {} as Record<string, number>);

  useEffect(() => {
    applyFilters(allOrders);
  }, [filterStatus, filterPayment, searchTerm]);

  const handleUpdateStatus = async (orderId: string | number, newStatus: string) => {
    try {
      const response = await fetch(`https://ecom-rest-topaz.vercel.app/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update status");
      }
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      status: order.status,
      paymentType: order.paymentType,
      notes: order.notes || "",
    });
    setUpdateError("");
    setShowEditModal(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setUpdatingOrder(true);
    setUpdateError("");
    try {
      const response = await fetch(`https://ecom-rest-topaz.vercel.app/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update order");
      }
      await fetchOrders();
      setShowEditModal(false);
      setEditingOrder(null);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleDeleteOrder = async (orderId: string | number) => {
    if (!confirm(`Delete order #${orderId}?`)) return;
    try {
      const response = await fetch(`https://ecom-rest-topaz.vercel.app/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete order");
      }
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classMap: Record<string, string> = {
      "order approved": "bg-green-100 text-green-800",
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-gray-100 text-gray-800",
      "order packaging in process": "bg-yellow-100 text-yellow-800",
      processing: "bg-yellow-100 text-yellow-800",
      "out of delivery": "bg-blue-100 text-blue-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-emerald-100 text-emerald-800",
    };
    return classMap[status] || "bg-gray-100 text-gray-800";
  };

  const statusOptions = [
    "pending",
    "order approved",
    "order packaging in process",
    "out of delivery",
    "delivered",
    "confirmed",
    "processing",
    "shipped",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-600 mx-auto mb-6"></div>
          <p className="text-xl text-slate-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header currentPage="Orders" />

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-100 rounded-xl">
                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Orders {loggedInUser?.role === 'superadmin' && '(Superadmin)'}
                </h1>
                <p className="text-sm text-slate-500">{orders.length} of {allOrders.length} shown</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-black font-medium rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={fetchOrders}
                className="px-5 py-2 text-sm bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters - Compact */}
        <div className="py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-none">
            <div>
              <label className="block text-xs font-semibold text-black mb-1.5 uppercase tracking-wide">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Customer/product/vendor..."
                className="w-full px-4 py-2.5 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={filterStatus}
                onChange={handleFilterStatus}
                className="w-full px-4 py-2.5 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">{statusCounts.all || 0} All</option>
                {Object.keys(statusCounts).filter(k => k !== 'all').map((stat) => (
                  <option key={stat} value={stat}>{statusCounts[stat]} {stat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1.5 uppercase tracking-wide">Payment</label>
              <select
                value={filterPayment}
                onChange={handleFilterPayment}
                className="w-full px-4 py-2.5 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">{paymentCounts.all || 0} All</option>
                {Object.keys(paymentCounts).filter(k => k !== 'all').map((pay) => (
                  <option key={pay} value={pay}>{paymentCounts[pay]} {pay}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table - Compact */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-black text-left w-16 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">ID</th>
                <th className="px-4 py-3 font-semibold text-black w-64 truncate">Customer</th>
                <th className="px-4 py-3 font-semibold text-black text-center w-20">Qty</th>
                <th className="px-4 py-3 font-semibold text-black text-right w-28">Unit Price</th>
                <th className="px-4 py-3 font-semibold text-black text-right w-28">Total</th>
                <th className="px-4 py-3 font-semibold text-black w-72 truncate">Item</th>
                <th className="px-4 py-3 font-semibold text-black w-24">Status</th>
                <th className="px-4 py-3 font-semibold text-black w-32 truncate">Payment</th>
                <th className="px-4 py-3 font-semibold text-black text-center w-28">Date</th>
                <th className="px-4 py-3 font-semibold text-black text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const orderIdStr = String(order.id);
                const currentTempStatus = tempStatuses[orderIdStr] || order.status;
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 font-mono font-semibold text-black sticky left-0 bg-white z-10 border-r border-slate-200">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-black truncate" title={`${order.email} | ${order.mobile}`}>
                      <span className="truncate">{order.userName}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-black">{order.quantity}</td>
                    <td className="px-4 py-3 text-right font-bold text-black">
                      ₹{Number(order.price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 px-3 py-1 rounded-full">
                      ₹{Number(order.price * order.quantity).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-black w-[200px] truncate max-w-[200px]" title={order.vendorName || order.productName || `Product #${order.productId}`}>
                      <span className="truncate block">{order.productName || `Product #${order.productId}`}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getStatusBadgeClass(currentTempStatus)}`}>
                        {currentTempStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 truncate max-w-[140px]">
                      <span className="font-semibold text-sm text-black truncate block">{order.paymentType}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-black">
                      {isNaN(Date.parse(order.date)) ? 'Invalid' : new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center space-x-2">
                        <select
                          value={currentTempStatus}
                          onChange={(e) => setTempStatuses({
                            ...tempStatuses,
                            [orderIdStr]: e.target.value
                          })}
                          className="text-black text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateStatus(order.id, currentTempStatus)}
                          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all"
                          title="Update Status"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-lg shadow transition-all"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg shadow transition-all"
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

        {showEditModal && editingOrder && (
          <EditOrderModal
            editingOrder={editingOrder}
            editForm={editForm}
            setEditForm={setEditForm}
            handleUpdateOrder={handleUpdateOrder}
            setShowEditModal={setShowEditModal}
            error={updateError}
          />
        )}
      </div>
    </div>
  );
}

