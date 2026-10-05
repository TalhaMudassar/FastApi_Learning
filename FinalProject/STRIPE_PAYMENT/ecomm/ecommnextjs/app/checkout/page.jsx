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
        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
          <ShoppingBagIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 text-sm">Add items to your cart before proceeding to checkout.</p>
        <Link
          href="/product"
          className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition shadow-xs"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Secure 256-bit encrypted Stripe checkout
          </p>
        </div>
        <Link
          href="/cart"
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          ← Return to Cart
        </Link>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="text-rose-500 hover:text-rose-800 font-bold ml-4 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Payment Element */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-gray-900">
                  Shipping Address
                </h2>
              </div>
              <Link
                href="/user/address/create"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add Address
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">
                  No saved delivery addresses found.
                </p>
                <Link
                  href="/user/address/create"
                  className="inline-block px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs"
                >
                  Create Shipping Address
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
                          ? "border-blue-600 bg-blue-50/50 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-gray-50"
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
                          <p className="font-bold text-gray-900 text-sm">
                            {addr.name}
                          </p>
                          {isSelected && (
                            <span className="text-blue-600 font-bold text-[11px] uppercase tracking-wider">Selected</span>
                          )}
                        </div>
                        {addr.phone_number && (
                          <p className="text-blue-600 font-mono text-[11px]">
                            {addr.phone_number}
                          </p>
                        )}
                        <p className="text-gray-700 leading-snug">
                          {addr.address_line1}
                        </p>
                        {addr.address_line2 && (
                          <p className="text-gray-500">{addr.address_line2}</p>
                        )}
                        <p className="text-gray-700">
                          {addr.city}, {addr.state} - <span className="font-semibold text-gray-900">{addr.pin_code}</span>
                        </p>
                        <p className="text-gray-500">{addr.country}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method or Stripe Card Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>
              {stripeClientSecret && (
                <button
                  type="button"
                  onClick={handleCancelStripe}
                  className="text-xs text-gray-500 hover:text-gray-900 font-medium underline transition cursor-pointer"
                >
                  Change Method
                </button>
              )}
            </div>

            {stripeClientSecret ? (
              // Active Stripe Elements Form
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-blue-900 font-medium">
                    Order Reference: <strong className="font-bold text-gray-900">#{createdOrderId}</strong>
                  </span>
                  <span className="text-blue-700 font-mono font-bold">
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
                      ? "border-blue-600 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
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
                          className="text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-sm font-bold text-gray-900">
                          Credit / Debit Card
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-5">
                        Stripe 3D-Secure, Cards, Apple Pay, Google Pay
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Stripe
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500 pl-5">
                    <span>256-bit Encrypted</span>
                    <div className="flex gap-1 font-bold text-gray-600 text-[9px]">
                      <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">VISA</span>
                      <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">MC</span>
                      <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">AMEX</span>
                    </div>
                  </div>
                </label>

                {/* Mock Sandbox Gateway */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    selectedGateway === "mock"
                      ? "border-blue-600 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
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
                          className="text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-sm font-bold text-gray-900">
                          Mock Sandbox Gateway
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-5">
                        Simulated test authorization (no card required)
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                      Testing
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] text-gray-500 pl-5">
                    Instant sandbox authorization
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Order Summary
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="pr-3">
                    <p className="font-semibold text-gray-900 line-clamp-1">
                      {item.product_title}
                    </p>
                    <p className="text-gray-500">
                      Rs. {Number(item.price).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 font-mono">
                    Rs. {Number(item.total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-200 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="text-gray-900 font-medium">{cart.total_quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Nationwide Delivery</span>
                <span className="text-emerald-600 font-bold font-mono">FREE (TCS)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-gray-900 font-mono font-bold">
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
                className="w-full mt-6 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-xl transition shadow-xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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
            <div className="mt-5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 flex items-center gap-2.5">
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