"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState("mock");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

      // Auto-select primary address if available
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

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert("Please select or add a shipping address.");
      return;
    }
    if (!selectedGateway) {
      alert("Please select a payment gateway.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await api.post("/api/orders/checkout", {
        amount: cart.total_price,
        shipping_address_id: selectedAddressId,
        gateway: selectedGateway,
        simulate_success: true,
      });

      // Navigate to order history upon successful order placement
      router.push("/user/order");
    } catch (err) {
      console.error("Checkout failed:", err);
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setErrorMsg(detail);
      } else if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d) => d.msg).join(", "));
      } else {
        setErrorMsg("Checkout failed. Please check your order details and try again.");
      }
    } finally {
      setSubmitting(false);
    }
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
        <div className="w-9 h-9 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Preparing checkout...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items before proceeding to checkout.</p>
        <Link
          href="/product"
          className="px-6 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          🧾 Checkout & Payment
        </h1>
        <Link href="/cart" className="text-sm font-medium text-rose-600 hover:underline">
          ← Edit Cart
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                📦 1. Delivery Address
              </h2>
              <Link
                href="/user/address/create"
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                + Add Address
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">
                  No saved delivery addresses found.
                </p>
                <Link
                  href="/user/address/create"
                  className="inline-block px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition"
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
                          ? "border-rose-600 bg-rose-50/40 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={addr.id}
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="hidden"
                      />
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900 text-sm">{addr.name}</p>
                          {isSelected && (
                            <span className="text-rose-600 font-bold">✓</span>
                          )}
                        </div>
                        {addr.phone_number && (
                          <p className="text-gray-500 font-medium">{addr.phone_number}</p>
                        )}
                        <p className="text-gray-600 leading-snug">{addr.address_line1}</p>
                        {addr.address_line2 && (
                          <p className="text-gray-500">{addr.address_line2}</p>
                        )}
                        <p className="text-gray-700 font-medium">
                          {addr.city}, {addr.state} - {addr.pin_code}
                        </p>
                        <p className="text-gray-500">{addr.country}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              💳 2. Payment Gateway
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  selectedGateway === "mock"
                    ? "border-rose-600 bg-rose-50/40 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="gateway"
                  value="mock"
                  checked={selectedGateway === "mock"}
                  onChange={() => setSelectedGateway("mock")}
                  className="hidden"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">🧪 Mock Sandbox</p>
                  <p className="text-xs text-gray-500">Instant test fulfillment</p>
                </div>
                {selectedGateway === "mock" && (
                  <span className="text-rose-600 font-bold">✓</span>
                )}
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  selectedGateway === "razorpay"
                    ? "border-rose-600 bg-rose-50/40 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="gateway"
                  value="razorpay"
                  checked={selectedGateway === "razorpay"}
                  onChange={() => setSelectedGateway("razorpay")}
                  className="hidden"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">⚡ Razorpay</p>
                  <p className="text-xs text-gray-500">Cards, UPI, Netbanking</p>
                </div>
                {selectedGateway === "razorpay" && (
                  <span className="text-rose-600 font-bold">✓</span>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Button */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Order Summary
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="pr-3">
                    <p className="font-semibold text-gray-800 line-clamp-1">
                      {item.product_title}
                    </p>
                    <p className="text-gray-400">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">₹{item.total}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span>{cart.total_quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Delivery</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                <span>Grand Total</span>
                <span className="text-rose-600">₹{cart.total_price}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={submitting || addresses.length === 0}
              className="w-full mt-6 py-3.5 bg-rose-600 text-white font-semibold text-sm rounded-xl hover:bg-rose-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-rose-100"
            >
              {submitting ? "Placing Order..." : `Pay ₹${cart.total_price} & Place Order`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;