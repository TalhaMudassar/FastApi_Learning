'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';

const statusColors = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed: 'bg-rose-100 text-rose-800 border-rose-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/payments');
      setPayments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError(err.response?.data?.detail || 'Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Loading payment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">💳 Payment History</h1>
          <p className="text-xs text-gray-500 mt-1">Review past transactions, payment methods, and invoices</p>
        </div>
        <button
          onClick={fetchPayments}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
        >
          Refresh
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto my-8">
          <p className="text-4xl mb-3">🧾</p>
          <h2 className="text-xl font-bold text-gray-800 mb-1">No payment transactions found</h2>
          <p className="text-xs text-gray-500 mb-6">
            When you complete an order checkout, your payment receipts will appear here.
          </p>
          <Link
            href="/product"
            className="inline-block px-6 py-2.5 bg-rose-600 text-white font-medium text-xs rounded-xl hover:bg-rose-700 transition shadow-md shadow-rose-100"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payments.map((payment) => {
            const gatewayName = payment.payment_gateway || payment.gateway || 'Standard';
            const statusKey = payment.status?.toLowerCase() || (payment.is_paid ? 'success' : 'pending');

            return (
              <div
                key={payment.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Payment #{payment.id}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Linked to Order #{payment.order_id}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                        statusColors[statusKey] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {payment.status || (payment.is_paid ? 'Success' : 'Pending')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount Paid:</span>
                      <span className="font-bold text-gray-900 text-sm">₹{payment.amount}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Gateway:</span>
                      <span className="font-semibold text-gray-800 uppercase tracking-wider font-mono">
                        {gatewayName}
                      </span>
                    </div>

                    {payment.transaction_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="font-mono text-gray-700 truncate max-w-[160px]">
                          {payment.transaction_id}
                        </span>
                      </div>
                    )}

                    {payment.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{new Date(payment.created_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-500">Settlement Verification:</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      payment.is_paid ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {payment.is_paid ? '✓ Verified' : '✕ Unsettled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}