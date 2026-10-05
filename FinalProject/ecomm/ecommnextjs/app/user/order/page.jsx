'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';

const statusColors = {
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  shipped: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-teal-100 text-teal-800 border-teal-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${id}?`)) {
      return;
    }

    setCancellingId(id);
    try {
      await api.patch(`/api/orders/cancel/${id}`);
      await fetchOrders();
    } catch (err) {
      console.error('Order cancellation failed:', err);
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : '❌ Only orders with pending shipping status can be cancelled.';
      alert(message);
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto my-8">
        <p className="text-4xl mb-3">🛒</p>
        <h2 className="text-xl font-bold text-gray-800 mb-1">No orders placed yet</h2>
        <p className="text-xs text-gray-500 mb-6">
          When you purchase items, their fulfillment and tracking status will appear here.
        </p>
        <Link
          href="/product"
          className="inline-block px-6 py-2.5 bg-rose-600 text-white font-medium text-xs rounded-xl hover:bg-rose-700 transition shadow-md shadow-rose-100"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">📦 Order History</h1>
          <p className="text-xs text-gray-500 mt-1">Review past transactions and shipping milestones</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const items = order.orderitems || order.order_items || [];
          const shippingStatus = order.shipping_status?.status?.toLowerCase() || 'pending';
          const canCancel = shippingStatus === 'pending' && order.status !== 'cancelled';

          return (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">Order #{order.id}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed on: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Order Amount</p>
                  <p className="text-lg font-black text-gray-900">₹{order.total_price}</p>
                </div>
              </div>

              {/* Delivery Details & Shipping Status Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
                {order.shipping_address ? (
                  <div>
                    <p className="font-bold text-gray-800 mb-1 flex items-center gap-1">
                      <span>📍</span> Delivery Destination
                    </p>
                    <p className="font-semibold text-gray-900">{order.shipping_address.name}</p>
                    {order.shipping_address.phone_number && (
                      <p className="text-gray-500">📞 {order.shipping_address.phone_number}</p>
                    )}
                    <p className="mt-0.5">
                      {order.shipping_address.address_line1}
                      {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ''}
                    </p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                      <span className="font-semibold">{order.shipping_address.pin_code}</span>
                    </p>
                    <p className="text-gray-500">{order.shipping_address.country}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No delivery address metadata attached.</p>
                )}

                <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-4">
                  <div>
                    <p className="font-bold text-gray-800 mb-1 flex items-center gap-1">
                      <span>🚚</span> Shipping Status
                    </p>
                    <p className="font-bold text-blue-600 uppercase tracking-wide">
                      {shippingStatus}
                    </p>
                    {order.shipping_status?.updated_at && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        Last milestone:{' '}
                        {new Date(order.shipping_status.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {canCancel && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-lg text-xs transition disabled:opacity-50"
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Purchased Items ({items.length})
                </p>

                {items.map((item) => {
                  const itemImg = item.product?.image_url
                    ? `${baseUrl}/${item.product.image_url.replace(/\\/g, '/')}`
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.product?.title || 'Product'}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                            🛍️
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {item.product?.title || 'Unknown Product'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: <span className="font-medium text-gray-800">{item.quantity}</span> × ₹
                            {item.price}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-sm text-gray-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}