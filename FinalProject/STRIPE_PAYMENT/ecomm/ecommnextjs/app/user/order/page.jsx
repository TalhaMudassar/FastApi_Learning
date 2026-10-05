"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import { LaptopIcon, ShoppingBagIcon } from '@/components/ui/TechIcons';

const statusColors = {
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  delivered: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);
  const [activeClientSecret, setActiveClientSecret] = useState(null);
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

  const cancelOrder = async (order) => {
    const isPaid = order.payment?.is_paid;
    const confirmMsg = isPaid
      ? `Are you sure you want to cancel Order #${order.id}?\n\nA full refund will be processed back to your payment method via Stripe.`
      : `Are you sure you want to cancel Order #${order.id}?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setCancellingId(order.id);
    try {
      await api.patch(`/api/orders/cancel/${order.id}`);
      await fetchOrders();
      if (isPaid) {
        alert(`Order #${order.id} has been cancelled and refunded successfully!`);
      }
    } catch (err) {
      console.error('Order cancellation failed:', err);
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : 'Only orders with pending shipping status can be cancelled.';
      alert(message);
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayNow = async (order) => {
    try {
      setPaymentLoadingId(order.id);
      const res = await api.post(`/api/payments/create-intent/${order.id}`);
      setActiveClientSecret(res.data.client_secret);
      setActivePaymentOrder(order);
    } catch (err) {
      console.error('Failed to initialize payment:', err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : 'Failed to initiate payment session.');
      await fetchOrders();
    } finally {
      setPaymentLoadingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-400">Loading order log...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-[#181c28] border border-white/10 rounded-2xl p-12 text-center shadow-2xl max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400 mx-auto mb-3">
          <ShoppingBagIcon className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">No Orders Placed Yet</h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          When you purchase hardware, fulfillment, courier tracking, and Stripe receipts will appear here.
        </p>
        <Link
          href="/product"
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Order History & Invoices</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">Review hardware transactions, tracking, and Stripe receipts</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition"
        >
          Sync Data
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
              className="bg-[#181c28] border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-white/20 transition"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-white font-mono">ORDER #{order.id}</h2>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                        statusColors[order.status] || 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.payment && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                          order.payment.status === 'refunded'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : order.payment.is_paid
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {order.payment.payment_gateway?.toUpperCase()}:{' '}
                        {order.payment.status === 'refunded'
                          ? 'Refunded'
                          : order.payment.is_paid
                          ? 'Paid'
                          : 'Payment Pending'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Placed on: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-mono">Order Total</p>
                  <p className="text-base font-bold text-cyan-400 font-mono">
                    Rs. {Number(order.total_price).toLocaleString()} PKR
                  </p>
                </div>
              </div>

              {/* Delivery Details & Shipping Status Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 bg-[#141824] border border-white/10 rounded-xl text-xs text-slate-300">
                {order.shipping_address ? (
                  <div>
                    <p className="font-bold text-slate-200 mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Destination
                    </p>
                    <p className="font-semibold text-white">{order.shipping_address.name}</p>
                    {order.shipping_address.phone_number && (
                      <p className="text-slate-400 font-mono text-[11px]">{order.shipping_address.phone_number}</p>
                    )}
                    <p className="mt-0.5 text-slate-300">
                      {order.shipping_address.address_line1}
                      {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ''}
                    </p>
                    <p className="text-slate-400 font-mono">
                      {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                      <span className="font-semibold text-slate-200">{order.shipping_address.pin_code}</span>
                    </p>
                    <p className="text-slate-400">{order.shipping_address.country}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No delivery address metadata attached.</p>
                )}

                <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/[0.08] pt-3 md:pt-0 md:pl-4">
                  <div>
                    <p className="font-bold text-slate-200 mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      Shipping Milestone
                    </p>
                    <p className="font-bold text-cyan-400 uppercase tracking-wide font-mono">
                      {shippingStatus}
                    </p>
                    {order.shipping_status?.updated_at && (
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        Updated: {new Date(order.shipping_status.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {order.payment && !order.payment.is_paid && order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handlePayNow(order)}
                        disabled={paymentLoadingId === order.id}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {paymentLoadingId === order.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Complete Payment</span>
                          </>
                        )}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => cancelOrder(order)}
                        disabled={cancellingId === order.id}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-semibold rounded-lg text-xs transition disabled:opacity-50 cursor-pointer"
                      >
                        {cancellingId === order.id
                          ? 'Processing Refund...'
                          : order.payment?.is_paid
                          ? 'Cancel & Refund'
                          : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Purchased Hardware Units ({items.length})
                </p>

                {items.map((item) => {
                  const itemImg = item.product?.image_url
                    ? `${baseUrl}/${item.product.image_url.replace(/\\/g, '/')}`
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#141824]"
                    >
                      <div className="flex items-center gap-3">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.product?.title || 'Product'}
                            className="w-12 h-12 rounded-lg object-cover bg-white/[0.03] border border-white/[0.06]"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400">
                            <LaptopIcon className="w-5 h-5" />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-white text-xs">
                            {item.product?.title || 'Studio Hardware'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Qty: <span className="font-bold text-slate-200">{item.quantity}</span> × Rs. {Number(item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-xs text-white font-mono">
                        Rs. {Number(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Payment Modal for Pending Orders */}
      {activePaymentOrder && activeClientSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11141d]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#181c28] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white">
                  Complete Order Payment
                </h3>
                <p className="text-xs text-cyan-400 font-mono">
                  Order #{activePaymentOrder.id} • Rs. {Number(activePaymentOrder.total_price).toLocaleString()} PKR
                </p>
              </div>
              <button
                onClick={() => {
                  setActivePaymentOrder(null);
                  setActiveClientSecret(null);
                }}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <StripePaymentForm
              clientSecret={activeClientSecret}
              orderId={activePaymentOrder.id}
              amount={activePaymentOrder.total_price}
              onCancel={() => {
                setActivePaymentOrder(null);
                setActiveClientSecret(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}