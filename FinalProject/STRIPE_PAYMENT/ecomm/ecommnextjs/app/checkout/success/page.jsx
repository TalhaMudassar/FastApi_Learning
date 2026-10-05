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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 text-gray-900">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">No Order Specified</h1>
        <p className="text-gray-500 mb-6 text-xs">
          We could not find order information for this session.
        </p>
        <Link
          href="/user/order"
          className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          View Orders
        </Link>
      </div>
    );
  }

  const isSuccess =
    paymentStatus?.is_paid ||
    paymentStatus?.status === "success" ||
    redirectStatus === "succeeded";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-gray-900">
      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xs text-center">
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-gray-900">
              Verifying Payment with Stripe...
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Confirming transaction status with Stripe servers.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-6">
            {/* Animated Success Badge */}
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
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
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold uppercase tracking-wider rounded-full mb-3">
                Transaction Completed
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Payment Authorized!
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                Thank you for your order. Your items are reserved and preparing for insured courier dispatch.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 uppercase tracking-wider text-[11px]">Order Reference</span>
                <span className="font-bold text-gray-900 font-mono text-sm">#{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-wider text-[11px]">Amount Captured</span>
                <span className="font-bold text-gray-900 font-mono text-sm">
                  {paymentStatus?.amount
                    ? `Rs. ${Number(paymentStatus.amount).toLocaleString()} PKR`
                    : "Settled"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-wider text-[11px]">Payment Method</span>
                <span className="font-semibold text-gray-700 uppercase tracking-wider font-mono text-[11px]">
                  {paymentStatus?.payment_gateway || "Stripe Card"}
                </span>
              </div>
              {(paymentStatus?.pg_order_id || paymentIntentId) && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-500 uppercase tracking-wider text-[11px]">Transaction ID</span>
                  <span className="font-mono text-gray-600 text-[11px] truncate max-w-[200px]">
                    {paymentStatus?.pg_order_id || paymentIntentId}
                  </span>
                </div>
              )}
            </div>

            {/* Next Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/user/order"
                className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition shadow-xs"
              >
                Track Order
              </Link>
              <Link
                href="/product"
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-xs rounded-xl transition"
              >
                Explore More Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto">
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
              <h1 className="text-xl font-bold text-gray-900">
                Payment Verification Pending
              </h1>
              <p className="text-gray-500 text-xs mt-2">
                Your payment session was submitted. Your order will update automatically once the Stripe webhook confirms.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/user/order"
                className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition shadow-xs"
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
