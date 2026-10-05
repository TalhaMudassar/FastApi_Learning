'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import AdminOnly from '@/components/AdminOnly';

const statusColors = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  processing: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  shipped: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const shippingOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminShippingUpdateStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = async (statusFilter = '', userId = '') => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders/admin/all', {
        params: {
          shipping_status: statusFilter || undefined,
          user_id: userId || undefined,
        },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFilterChange = (e) => {
    const selected = e.target.value;
    setFilterStatus(selected);
    fetchOrders(selected, searchUserId);
  };

  const handleUserSearch = (e) => {
    e.preventDefault();
    fetchOrders(filterStatus, searchUserId);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.patch(`/api/shippings/status/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                shipping_status: {
                  ...order.shipping_status,
                  status: newStatus,
                  updated_at: new Date().toISOString(),
                },
              }
            : order
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.detail || 'Failed to update shipping status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <AdminOnly>
      <div className="max-w-6xl mx-auto space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Orders & Shipping Fulfillment</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Monitor customer purchases and manage TCS courier fulfillment milestones
            </p>
          </div>
          <button
            onClick={() => fetchOrders(filterStatus, searchUserId)}
            className="text-xs font-semibold font-mono text-cyan-400 hover:text-cyan-300 underline self-start sm:self-auto cursor-pointer transition"
          >
            Sync Orders
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#181c28] border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-300 font-mono text-[11px] uppercase tracking-wider">Milestone:</label>
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 bg-[#141824] text-slate-200"
            >
              <option value="">All Milestones</option>
              {shippingOptions.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleUserSearch} className="flex items-center gap-2">
            <label className="font-bold text-slate-300 font-mono text-[11px] uppercase tracking-wider">User ID:</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="border border-white/10 rounded-lg px-3 py-1.5 w-32 focus:outline-none focus:border-cyan-500 bg-[#141824] text-slate-200 font-mono"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer shadow-sm shadow-cyan-500/20"
            >
              Filter
            </button>
            {searchUserId && (
              <button
                type="button"
                onClick={() => {
                  setSearchUserId('');
                  fetchOrders(filterStatus, '');
                }}
                className="text-slate-400 hover:text-white underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-slate-400">Querying orders database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#181c28] border border-white/10 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400 mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m4 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">No orders match criteria</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">Adjust your filters or query parameters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStatus = order.shipping_status?.status?.toLowerCase() || 'pending';
              const items = order.orderitems || order.order_items || [];
              const isUpdating = updatingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-[#181c28] border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-white/20 transition"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-bold text-white font-mono">ORDER #{order.id}</h2>
                        <span className="text-[10px] font-mono bg-white/[0.06] text-slate-300 border border-white/10 px-2 py-0.5 rounded">
                          User #{order.user_id}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">
                          Status: {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        Placed on: {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Milestone State Mutator */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border font-mono ${
                          statusColors[currentStatus] || 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        {currentStatus}
                      </span>

                      <select
                        disabled={isUpdating}
                        value={currentStatus}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="text-xs border border-white/10 rounded-lg px-2.5 py-1.5 bg-[#141824] text-slate-200 font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                      >
                        {shippingOptions.map((st) => (
                          <option key={st} value={st}>
                            Mark as {st.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Shipping Address Summary */}
                  <div className="my-4 p-3.5 bg-[#141824] border border-white/10 rounded-xl text-xs text-slate-300">
                    <p className="font-bold text-slate-200 mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Address:
                    </p>
                    {order.shipping_address ? (
                      <p className="leading-relaxed">
                        <span className="font-semibold text-white">
                          {order.shipping_address.name}
                        </span>{' '}
                        {order.shipping_address.phone_number && (
                          <span className="text-cyan-400 font-mono">({order.shipping_address.phone_number})</span>
                        )}
                        <br />
                        <span className="text-slate-300">
                          {order.shipping_address.address_line1}
                          {order.shipping_address.address_line2
                            ? `, ${order.shipping_address.address_line2}`
                            : ''}
                          , {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                          <span className="font-semibold text-white">{order.shipping_address.pin_code}</span>,{' '}
                          {order.shipping_address.country}
                        </span>
                      </p>
                    ) : (
                      <p className="italic text-slate-500">No delivery address metadata attached.</p>
                    )}
                  </div>

                  {/* Order Line Items Table */}
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141824] border-b border-white/[0.08] text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Qty</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] text-slate-300">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-medium text-white">
                              {item.product?.title || 'Unknown Hardware'}
                            </td>
                            <td className="p-3 font-mono text-slate-400">Rs. {Number(item.price).toLocaleString()}</td>
                            <td className="p-3 font-mono text-slate-300">{item.quantity}</td>
                            <td className="p-3 text-right font-bold text-white font-mono">
                              Rs. {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Card Total */}
                  <div className="pt-3 mt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      Last Milestone:{' '}
                      {order.shipping_status?.updated_at
                        ? new Date(order.shipping_status.updated_at).toLocaleString()
                        : 'N/A'}
                    </span>
                    <p className="text-sm font-bold text-cyan-400 font-mono">
                      Total: Rs. {Number(order.total_price).toLocaleString()} PKR
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminOnly>
  );
};

export default AdminShippingUpdateStatusPage;