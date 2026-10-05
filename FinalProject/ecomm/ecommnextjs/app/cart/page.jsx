'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthContext';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAction, setUpdatingAction] = useState(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/carts');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/cart');
      } else {
        fetchCart();
      }
    }
  }, [authLoading, user, router]);

  const updateCart = async (method, url) => {
    setUpdatingAction(url);
    try {
      await api[method](url);
      await fetchCart();
    } catch (err) {
      console.error('Cart update failed:', err);
      alert(err.response?.data?.detail || 'Failed to update cart item.');
    } finally {
      setUpdatingAction(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Loading your cart...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added any items to your cart yet.</p>
        <Link
          href="/product"
          className="px-6 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const grandTotal = cart.total_price ?? 0;
  const totalCount = cart.total_quantity ?? cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        🛒 Shopping Cart
      </h1>

      {/* Cart Items List */}
      <div className="space-y-4">
        {cart.items.map((item) => {
          const decreaseUrl = `/api/carts/decrease/${item.product_id}`;
          const increaseUrl = `/api/carts/increase/${item.product_id}`;
          // NOTE: Backend route is DELETE /api/carts/{item_id}, NOT /api/carts/delete/{item_id}
          const deleteUrl = `/api/carts/${item.id}`;
          const isItemBusy = updatingAction !== null;

          return (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-md"
            >
              <div>
                <h2 className="font-semibold text-gray-900 text-base">{item.product_title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  ₹{item.price} × {item.quantity} ={' '}
                  <span className="font-semibold text-rose-600">
                    ₹{item.total}
                  </span>
                </p>
              </div>

              {/* Quantity Controls & Removal */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button
                    type="button"
                    onClick={() => updateCart('patch', decreaseUrl)}
                    disabled={isItemBusy || item.quantity <= 1}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold"
                  >
                    −
                  </button>

                  <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-white">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateCart('patch', increaseUrl)}
                    disabled={isItemBusy}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => updateCart('delete', deleteUrl)}
                  disabled={isItemBusy}
                  className="text-sm font-medium text-red-600 hover:text-red-700 ml-3 disabled:opacity-40 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary & Checkout Action */}
      <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Subtotal ({totalCount} items)</p>
          <p className="text-2xl font-black text-gray-900">₹{grandTotal}</p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/checkout')}
          className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 active:scale-95 transition shadow-lg shadow-rose-100"
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
};

export default CartPage;