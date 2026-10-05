'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';

const statusColors = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  refunded: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  failed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  cancelled: 'bg-white/10 text-slate-300 border-white/15',
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
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-400">Querying transaction ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-mono">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Payment Ledger & Receipts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">Stripe tokenized transaction confirmations and refund audits</p>
        </div>
        <button
          onClick={fetchPayments}
          className="text-xs font-semibold font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition"
        >
          Sync Ledger
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="bg-[#181c28] border border-white/10 rounded-2xl p-12 text-center shadow-2xl max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-white mb-1">No payment transactions found</h2>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            When you complete an order checkout, your Stripe payment receipts will appear here.
          </p>
          <Link
            href="/product"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20"
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
                className="bg-[#181c28] border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-white/20 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-white font-mono">
                        PAYMENT #{payment.id}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Linked to Order #{payment.order_id}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                        statusColors[statusKey] || 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {payment.status || (payment.is_paid ? 'Success' : 'Pending')}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 bg-[#141824] p-3.5 rounded-xl border border-white/10 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Captured Amount:</span>
                      <span className="font-bold text-cyan-400 font-mono text-sm">Rs. {Number(payment.amount).toLocaleString()} PKR</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Processing Gateway:</span>
                      <span className="font-semibold text-cyan-300 uppercase tracking-wider font-mono text-[11px]">
                        {gatewayName}
                      </span>
                    </div>

                    {(payment.pg_order_id || payment.transaction_id || payment.pg_payment_id) && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Stripe Reference:</span>
                        <span className="font-mono text-slate-300 text-[11px] truncate max-w-[180px]">
                          {payment.pg_order_id || payment.transaction_id || payment.pg_payment_id}
                        </span>
                      </div>
                    )}

                    {payment.created_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Timestamp:</span>
                        <span className="font-mono text-[11px] text-slate-400">{new Date(payment.created_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
                  <span className="text-slate-400">Settlement Verification:</span>
                  <span
                    className={`font-semibold font-mono text-xs flex items-center gap-1.5 ${
                      payment.is_paid ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${payment.is_paid ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-rose-400'}`} />
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