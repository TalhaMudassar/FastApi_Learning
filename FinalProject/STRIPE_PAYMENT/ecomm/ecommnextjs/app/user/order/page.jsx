"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import { LaptopIcon, ShoppingBagIcon } from '@/components/ui/TechIcons';

const statusColors = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-teal-50 text-teal-700 border-teal-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
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
        <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto mb-3">
          <ShoppingBagIcon className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">No Orders Placed Yet</h2>
        <p className="text-xs text-gray-500 mb-6">
          When you place an order, delivery tracking and Stripe receipts will appear here.
        </p>
        <Link
          href="/product"
          className="inline-block px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition shadow-xs"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span>Orders & Receipts</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Review your order history, delivery milestones, and payment receipts</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer transition"
        >
          Refresh Orders
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
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:border-gray-300 transition"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-gray-900 font-mono">ORDER #{order.id}</h2>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.payment && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                          order.payment.status === 'refunded'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : order.payment.is_paid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
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
                  <p className="text-[11px] text-gray-500 mt-1">
                    Placed on: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-gray-500">Order Total</p>
                  <p className="text-base font-bold text-gray-900 font-mono">
                    Rs. {Number(order.total_price).toLocaleString()} PKR
                  </p>
                </div>
              </div>

              {/* Delivery Details & Shipping Status Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
                {order.shipping_address ? (
                  <div>
                    <p className="font-bold text-gray-900 mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Shipping Address
                    </p>
                    <p className="font-semibold text-gray-900">{order.shipping_address.name}</p>
                    {order.shipping_address.phone_number && (
                      <p className="text-blue-600 font-mono text-[11px]">{order.shipping_address.phone_number}</p>
                    )}
                    <p className="mt-0.5 text-gray-600">
                      {order.shipping_address.address_line1}
                      {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ''}
                    </p>
                    <p className="text-gray-600">
                      {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                      <span className="font-semibold text-gray-900">{order.shipping_address.pin_code}</span>
                    </p>
                    <p className="text-gray-500">{order.shipping_address.country}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No delivery address attached.</p>
                )}

                <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-4">
                  <div>
                    <p className="font-bold text-gray-900 mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      Shipping Status
                    </p>
                    <p className="font-bold text-blue-700 uppercase tracking-wide">
                      {shippingStatus}
                    </p>
                    {order.shipping_status?.updated_at && (
                      <p className="text-[10px] text-gray-500 mt-1">
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
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                        className="px-4 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-semibold rounded-lg text-xs transition disabled:opacity-50 cursor-pointer shadow-2xs"
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
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Ordered Items ({items.length})
                </p>

                {items.map((item) => {
                  const itemImg = item.product?.image_url
                    ? `${baseUrl}/${item.product.image_url.replace(/\\/g, '/')}`
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.product?.title || 'Product'}
                            className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-blue-600">
                            <LaptopIcon className="w-5 h-5" />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-900 text-xs">
                            {item.product?.title || 'Product Item'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Qty: <span className="font-bold text-gray-800">{item.quantity}</span> × Rs. {Number(item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-xs text-gray-900 font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Complete Payment
                </h3>
                <p className="text-xs text-blue-600 font-mono">
                  Order #{activePaymentOrder.id} • Rs. {Number(activePaymentOrder.total_price).toLocaleString()} PKR
                </p>
              </div>
              <button
                onClick={() => {
                  setActivePaymentOrder(null);
                  setActiveClientSecret(null);
                }}
                className="text-gray-400 hover:text-gray-900 text-lg font-bold p-1 cursor-pointer"
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