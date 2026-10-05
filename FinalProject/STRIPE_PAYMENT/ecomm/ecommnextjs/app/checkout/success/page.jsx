"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/axios";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id");
  const paymentIntentId = searchParams.get("payment_intent");
  const paymentIntentClientSecret = searchParams.get(
    "payment_intent_client_secret"
  );
  const redirectStatus = searchParams.get("redirect_status");

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timer = null;

    const checkStatus = async () => {
      const secret = paymentIntentClientSecret || paymentIntentId;
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      try {
        let data = null;

        // 1. If we have client_secret or payment_intent, call public-status first (immune to session cookie expiration)
        if (secret) {
          try {
            const resp = await fetch(
              `${baseUrl}/api/payments/${orderId}/public-status?client_secret=${encodeURIComponent(
                secret
              )}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
            if (resp.ok) {
              data = await resp.json();
            }
          } catch (_) {
            // fallback
          }
        }

        // 2. Fallback to authenticated endpoint if public fetch didn't return
        if (!data) {
          try {
            const res = await api.get(`/api/payments/${orderId}/status`, {
              params: secret ? { client_secret: secret } : {},
            });
            data = res.data;
          } catch (_) {
            // fallback
          }
        }

        if (!isMounted) return;

        if (data) {
          setPaymentStatus(data);
          if (
            data.is_paid ||
            data.status === "success" ||
            data.gateway_status === "succeeded"
          ) {
            setLoading(false);
            return;
          }
        }

        if (pollCount < 4) {
          timer = setTimeout(() => {
            if (isMounted) setPollCount((prev) => prev + 1);
          }, 1500);
        } else {
          setLoading(false);
        }
      } catch (_) {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, pollCount, paymentIntentClientSecret, paymentIntentId]);

  if (!orderId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 text-slate-100">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">No Order Specified</h1>
        <p className="text-slate-400 mb-6 text-xs font-mono">
          We could not find order information for this session.
        </p>
        <Link
          href="/user/order"
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20"
        >
          View Order History
        </Link>
      </div>
    );
  }

  const isSuccess =
    paymentStatus?.is_paid ||
    paymentStatus?.status === "success" ||
    redirectStatus === "succeeded";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-slate-100">
      <div className="bg-[#181c28] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white font-mono">
              Verifying Payment with Stripe...
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
              Synchronizing cryptographic proof with Stripe webhook servers.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-6">
            {/* Animated Success Badge */}
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold uppercase tracking-wider rounded-full mb-3 font-mono">
                Transaction Settled
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Payment Authorized!
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                Thank you for choosing Aura Studio. Your hardware reservation is locked and fulfillment is preparing for courier dispatch.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#11141d] border border-white/10 rounded-2xl p-5 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="font-mono text-slate-400 uppercase tracking-wider text-[11px]">Order Reference</span>
                <span className="font-bold text-white font-mono text-sm">#{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-slate-400 uppercase tracking-wider text-[11px]">Amount Captured</span>
                <span className="font-bold text-cyan-400 font-mono text-sm">
                  {paymentStatus?.amount
                    ? `Rs. ${Number(paymentStatus.amount).toLocaleString()} PKR`
                    : "Settled"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-slate-400 uppercase tracking-wider text-[11px]">Payment Gateway</span>
                <span className="font-semibold text-slate-200 uppercase tracking-wider font-mono text-[11px]">
                  {paymentStatus?.payment_gateway || "Stripe 3D-Secure"}
                </span>
              </div>
              {(paymentStatus?.pg_order_id || paymentIntentId) && (
                <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                  <span className="font-mono text-slate-400 uppercase tracking-wider text-[11px]">Stripe Transaction ID</span>
                  <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">
                    {paymentStatus?.pg_order_id || paymentIntentId}
                  </span>
                </div>
              )}
            </div>

            {/* Next Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/user/order"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Track Fulfillment
              </Link>
              <Link
                href="/product"
                className="w-full sm:w-auto px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10 font-semibold text-xs rounded-xl transition"
              >
                Explore More Studio Gear
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Payment Verification Pending
              </h1>
              <p className="text-slate-400 text-xs mt-2 font-mono">
                Your payment session was submitted. If your payment was authorized, your order will update automatically once the Stripe webhook confirms.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/user/order"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Check Order Status
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
