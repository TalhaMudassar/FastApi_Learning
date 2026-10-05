'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import AdminOnly from '@/components/AdminOnly';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
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
      // Optimistically update the local shipping status badge
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              🚚 Orders & Shipping Fulfillment
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Filter customer purchases and update dispatch/delivery milestones
            </p>
          </div>
          <button
            onClick={() => fetchOrders(filterStatus, searchUserId)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline self-start sm:self-auto"
          >
            Refresh List
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-gray-700">Shipping Milestone:</label>
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
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
            <label className="font-bold text-gray-700">Filter Customer:</label>
            <input
              type="number"
              placeholder="User ID (e.g. 5)"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 w-36 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 rounded-lg font-semibold transition"
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
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Querying orders database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-base font-semibold text-gray-800">No orders match criteria</p>
            <p className="text-xs text-gray-500 mt-1">Adjust your filters or query parameters.</p>
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
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-gray-900">Order #{order.id}</h2>
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          User #{order.user_id}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 capitalize">
                          Status: {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Placed on: {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Milestone State Mutator */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          statusColors[currentStatus] || 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {currentStatus}
                      </span>

                      <select
                        disabled={isUpdating}
                        value={currentStatus}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
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
                  <div className="my-4 p-3.5 bg-gray-50 rounded-xl text-xs text-gray-600">
                    <p className="font-bold text-gray-800 mb-1">📍 Delivery Address:</p>
                    {order.shipping_address ? (
                      <p className="leading-relaxed">
                        <span className="font-semibold text-gray-900">
                          {order.shipping_address.name}
                        </span>{' '}
                        {order.shipping_address.phone_number && (
                          <span>(📞 {order.shipping_address.phone_number})</span>
                        )}
                        <br />
                        {order.shipping_address.address_line1}
                        {order.shipping_address.address_line2
                          ? `, ${order.shipping_address.address_line2}`
                          : ''}
                        , {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                        <span className="font-semibold">{order.shipping_address.pin_code}</span>,{' '}
                        {order.shipping_address.country}
                      </p>
                    ) : (
                      <p className="italic text-gray-400">No delivery address metadata attached.</p>
                    )}
                  </div>

                  {/* Order Line Items Table */}
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Qty</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-medium text-gray-900">
                              {item.product?.title || 'Unknown Product'}
                            </td>
                            <td className="p-3">₹{item.price}</td>
                            <td className="p-3">{item.quantity}</td>
                            <td className="p-3 text-right font-bold text-gray-900">
                              ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Card Total */}
                  <div className="pt-3 mt-3 flex justify-between items-center text-xs">
                    <span className="text-gray-400">
                      Last Updated:{' '}
                      {order.shipping_status?.updated_at
                        ? new Date(order.shipping_status.updated_at).toLocaleString()
                        : 'N/A'}
                    </span>
                    <p className="text-base font-black text-gray-900">
                      Total: ₹{order.total_price}
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