"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";
import StripePaymentForm from "@/components/payment/StripePaymentForm";
import { ShoppingBagIcon } from "@/components/ui/TechIcons";

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState("stripe");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Stripe Payment State
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchCartAndAddresses = async () => {
    try {
      setLoading(true);
      const [cartRes, addrRes] = await Promise.all([
        api.get("/api/carts"),
        api.get("/api/shippings/addresses"),
      ]);

      setCart(cartRes.data);
      const addrList = addrRes.data || [];
      setAddresses(addrList);

      if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id);
      }
    } catch (err) {
      console.error("Error loading checkout data:", err);
      setErrorMsg("Failed to load checkout information.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateOrder = async () => {
    if (!selectedAddressId) {
      setErrorMsg("Please select or add a shipping address.");
      return;
    }
    if (!selectedGateway) {
      setErrorMsg("Please choose a payment method.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await api.post("/api/orders/checkout", {
        amount: cart.total_price,
        shipping_address_id: selectedAddressId,
        gateway: selectedGateway,
        simulate_success: true,
      });

      const orderData = res.data;

      // Gateway branch: Stripe vs Mock
      if (selectedGateway === "stripe") {
        const clientSecret = orderData.payment?.client_secret;
        if (!clientSecret) {
          throw new Error("Stripe payment session could not be initialized.");
        }
        setCreatedOrderId(orderData.id);
        setStripeClientSecret(clientSecret);
      } else {
        // Mock Gateway instant fulfillment
        router.push(`/checkout/success?order_id=${orderData.id}`);
      }
    } catch (err) {
      console.error("Checkout initiation failed:", err);
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setErrorMsg(detail);
      } else if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d) => d.msg).join(", "));
      } else {
        setErrorMsg(
          err.message || "Checkout failed. Please check your order details and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelStripe = () => {
    setStripeClientSecret(null);
    setCreatedOrderId(null);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/checkout");
      } else {
        fetchCartAndAddresses();
      }
    }
  }, [authLoading, user, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Preparing secure checkout...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4">
          <ShoppingBagIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Your hardware bag is empty</h2>
        <p className="text-stone-500 mb-6 text-sm">Add hardware units before proceeding to checkout.</p>
        <Link
          href="/product"
          className="px-6 py-2.5 bg-stone-950 text-white font-medium rounded-xl hover:bg-cyan-700 transition"
        >
          Browse Hardware
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Secure Checkout Terminal
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 font-mono">
            Stripe 256-bit encrypted transaction processing
          </p>
        </div>
        <Link
          href="/cart"
          className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 font-mono transition"
        >
          ← Edit Hardware Bag
        </Link>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-sm text-rose-300 flex items-center justify-between font-mono">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="text-rose-400 hover:text-white font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Payment Element */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Delivery Address */}
          <div className="bg-[#181c28] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center justify-center font-mono">
                  1
                </span>
                <h2 className="text-base font-bold text-white">
                  Dispatch & Delivery Destination
                </h2>
              </div>
              <Link
                href="/user/address/create"
                className="text-xs font-mono font-semibold text-cyan-400 hover:underline"
              >
                + Add Address
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-white/15 rounded-xl bg-[#141824]">
                <p className="text-sm text-slate-300 mb-3">
                  No saved delivery addresses found.
                </p>
                <Link
                  href="/user/address/create"
                  className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20"
                >
                  Create Delivery Address
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <label
                      key={addr.id}
                      className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-500/10"
                          : "border-white/10 hover:border-white/20 bg-[#141824]"
                      } ${stripeClientSecret ? "opacity-75 pointer-events-none" : ""}`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={addr.id}
                        checked={isSelected}
                        disabled={!!stripeClientSecret}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="hidden"
                      />
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-white text-sm">
                            {addr.name}
                          </p>
                          {isSelected && (
                            <span className="text-cyan-400 font-mono font-bold text-[11px] uppercase tracking-wider">Selected</span>
                          )}
                        </div>
                        {addr.phone_number && (
                          <p className="text-cyan-400 font-mono text-[11px]">
                            {addr.phone_number}
                          </p>
                        )}
                        <p className="text-slate-300 leading-snug">
                          {addr.address_line1}
                        </p>
                        {addr.address_line2 && (
                          <p className="text-slate-400">{addr.address_line2}</p>
                        )}
                        <p className="text-slate-300 font-mono">
                          {addr.city}, {addr.state} - <span className="font-semibold text-white">{addr.pin_code}</span>
                        </p>
                        <p className="text-slate-400">{addr.country}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method or Stripe Card Form */}
          <div className="bg-[#181c28] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-white">
                  Payment Method
                </h2>
              </div>
              {stripeClientSecret && (
                <button
                  type="button"
                  onClick={handleCancelStripe}
                  className="text-xs text-slate-400 hover:text-cyan-400 font-medium underline transition"
                >
                  Change Method
                </button>
              )}
            </div>

            {stripeClientSecret ? (
              // Active Stripe Elements Form
              <div className="space-y-4">
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-cyan-200 font-medium">
                    Order Reference: <strong className="font-bold text-white">#{createdOrderId}</strong>
                  </span>
                  <span className="text-cyan-400 font-mono font-bold">
                    Amount: Rs. {Number(cart.total_price).toLocaleString()} PKR
                  </span>
                </div>

                <StripePaymentForm
                  clientSecret={stripeClientSecret}
                  orderId={createdOrderId}
                  amount={cart.total_price}
                  customerEmail={user?.email}
                  onCancel={handleCancelStripe}
                />
              </div>
            ) : (
              // Gateway Selector
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stripe Card Method */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    selectedGateway === "stripe"
                      ? "border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-500/10"
                      : "border-white/10 hover:border-white/20 bg-[#141824]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gateway"
                          value="stripe"
                          checked={selectedGateway === "stripe"}
                          onChange={() => setSelectedGateway("stripe")}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-sm font-bold text-white">
                          Credit / Debit Card
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 pl-5">
                        Stripe 3D-Secure, Cards, Apple Pay, Google Pay
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Stripe
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 pl-5">
                    <span>256-bit Encrypted</span>
                    <div className="flex gap-1 font-bold text-slate-300 text-[9px]">
                      <span className="px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded">VISA</span>
                      <span className="px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded">MC</span>
                      <span className="px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded">AMEX</span>
                    </div>
                  </div>
                </label>

                {/* Mock Sandbox Gateway */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    selectedGateway === "mock"
                      ? "border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-500/10"
                      : "border-white/10 hover:border-white/20 bg-[#141824]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gateway"
                          value="mock"
                          checked={selectedGateway === "mock"}
                          onChange={() => setSelectedGateway("mock")}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-sm font-bold text-white">
                          Mock Sandbox Gateway
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 pl-5">
                        Simulated test authorization (no card required)
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                      Testing
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] text-slate-400 pl-5">
                    Instant sandbox authorization
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#181c28] border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-24">
            <h2 className="text-base font-bold text-white mb-4 pb-3 border-b border-white/10">
              Order Summary
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="pr-3">
                    <p className="font-semibold text-slate-200 line-clamp-1">
                      {item.product_title}
                    </p>
                    <p className="text-slate-400 font-mono">
                      Rs. {Number(item.price).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-white font-mono">
                    Rs. {Number(item.total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-white/[0.08] text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="text-white font-medium">{cart.total_quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Nationwide Delivery</span>
                <span className="text-emerald-400 font-bold font-mono">FREE (TCS)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-white/[0.08]">
                <span>Grand Total</span>
                <span className="text-cyan-400 font-mono font-bold">
                  Rs. {Number(cart.total_price).toLocaleString()} PKR
                </span>
              </div>
            </div>

            {/* Initiate Button (shown before Stripe Elements loads) */}
            {!stripeClientSecret && (
              <button
                type="button"
                onClick={handleInitiateOrder}
                disabled={submitting || addresses.length === 0}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Initializing Payment...</span>
                  </>
                ) : selectedGateway === "stripe" ? (
                  <>
                    <span>Proceed to Card Payment</span>
                    <span>→</span>
                  </>
                ) : (
                  `Pay Rs. ${Number(cart.total_price).toLocaleString()} with Mock Sandbox`
                )}
              </button>
            )}

            {/* Security Guarantee Box */}
            <div className="mt-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400 flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-emerald-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>100% Secure Payment Guarantee. Encrypted and processed directly by Stripe.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;