"use client";

import React, { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe, stripeElementsAppearance } from "@/utils/stripe";

/**
 * Inner Stripe Form Component that accesses the active Stripe & Elements context.
 */
function CheckoutForm({ orderId, amount, onCancel, customerEmail }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const returnUrl = `${window.location.origin}/checkout/success?order_id=${orderId}`;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          receipt_email: customerEmail || undefined,
        },
      });

      // This code will only be reached if an immediate error occurred during payment confirmation
      if (error) {
        if (error.message?.toLowerCase().includes("incomplete")) {
          setErrorMessage(
            "Please click on your saved card above to select it, or click the '···' menu next to your email to use another card."
          );
        } else if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message || "Your payment details could not be validated.");
        } else {
          setErrorMessage(
            error.message || "An unexpected error occurred while processing your payment."
          );
        }
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      setErrorMessage("Network error or connection interruption. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Trust Header */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="font-medium text-slate-700">
            256-bit Encrypted SSL Connection
          </span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-slate-500 tracking-tight">
          <span>powered by</span>
          <span className="text-indigo-600 font-bold uppercase tracking-wider text-[11px]">
            stripe
          </span>
        </div>
      </div>

      {/* Embedded Stripe PaymentElement */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <PaymentElement
          id="payment-element"
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
            wallets: {
              applePay: "auto",
              googlePay: "auto",
            },
          }}
          onChange={(event) => {
            setIsComplete(event.complete);
            if (event.complete) {
              setErrorMessage("");
            }
          }}
          onLoaderError={(err) => {
            const msg = err?.error?.message || err?.message || "Payment intent is no longer active.";
            setErrorMessage(msg);
          }}
        />
        <p className="text-[11px] text-slate-500 text-center mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1">
          <span>💡</span>
          <span>Click on your card above to confirm it, or click <strong>···</strong> to enter a different card.</span>
        </p>
      </div>

      {/* Inline Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-fadeIn">
          <svg
            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-red-800">Action Required</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition duration-150 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying & Processing Payment...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Pay ${Number(amount).toFixed(2)} USD</span>
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
          >
            ← Cancel and Change Payment Method
          </button>
        )}
      </div>

      {/* Accepted Payment Brand Badges */}
      <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-400">
        <span>Guaranteed Safe Checkout:</span>
        <div className="flex items-center gap-1.5 font-bold text-slate-600">
          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
            VISA
          </span>
          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
            MC
          </span>
          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
            AMEX
          </span>
          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
            DISC
          </span>
        </div>
      </div>
    </form>
  );
}

/**
 * Top-Level Exported Wrapper providing the Stripe `<Elements>` context.
 */
export default function StripePaymentForm({
  clientSecret,
  orderId,
  amount,
  onCancel,
  customerEmail,
}) {
  const stripePromise = getStripe();

  if (!clientSecret) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Initializing secure payment session...
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: stripeElementsAppearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        orderId={orderId}
        amount={amount}
        onCancel={onCancel}
        customerEmail={customerEmail}
      />
    </Elements>
  );
}
