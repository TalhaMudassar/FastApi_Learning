'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';

const statusColors = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refunded: 'bg-purple-50 text-purple-700 border-purple-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
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
        <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500">Loading payment ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span>Payment Receipts</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Stripe transaction records, timestamps, and refund confirmations</p>
        </div>
        <button
          onClick={fetchPayments}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer transition"
        >
          Refresh Ledger
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">No payment transactions found</h2>
          <p className="text-xs text-gray-500 mb-6">
            When you complete an order checkout, your Stripe payment receipts will appear here.
          </p>
          <Link
            href="/product"
            className="inline-block px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition shadow-xs"
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
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:border-gray-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900 font-mono">
                        PAYMENT #{payment.id}
                      </h2>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        Linked to Order #{payment.order_id}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                        statusColors[statusKey] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {payment.status || (payment.is_paid ? 'Success' : 'Pending')}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-200 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Captured Amount:</span>
                      <span className="font-bold text-gray-900 font-mono text-sm">Rs. {Number(payment.amount).toLocaleString()} PKR</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Payment Gateway:</span>
                      <span className="font-semibold text-gray-800 uppercase tracking-wider font-mono text-[11px]">
                        {gatewayName}
                      </span>
                    </div>

                    {(payment.pg_order_id || payment.transaction_id || payment.pg_payment_id) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Stripe Reference:</span>
                        <span className="font-mono text-gray-600 text-[11px] truncate max-w-[180px]">
                          {payment.pg_order_id || payment.transaction_id || payment.pg_payment_id}
                        </span>
                      </div>
                    )}

                    {payment.created_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Timestamp:</span>
                        <span className="font-mono text-[11px] text-gray-500">{new Date(payment.created_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-500">Settlement Verification:</span>
                  <span
                    className={`font-semibold text-xs flex items-center gap-1.5 ${
                      payment.is_paid ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${payment.is_paid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {payment.is_paid ? 'Verified & Settled' : 'Unsettled / Pending'}
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