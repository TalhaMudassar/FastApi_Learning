'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBagIcon } from '@/components/ui/TechIcons';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAction, setUpdatingAction] = useState(null); // Tracks item being updated to disable controls
  const { user } = useAuth();
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/carts');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }
    fetchCart();
  }, [user]);

  const updateCart = async (method, url) => {
    setUpdatingAction(url);
    try {
      if (method === 'patch') {
        await api.patch(url);
      } else if (method === 'delete') {
        await api.delete(url);
      }
      await fetchCart();
    } catch (err) {
      console.error(`Failed executing ${method.toUpperCase()} on ${url}:`, err);
      alert(err.response?.data?.detail || 'Failed to update item quantity.');
    } finally {
      setUpdatingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading your cart...</p>
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
        <p className="text-gray-500 mb-6 text-sm">Explore our collection of laptops, 4K CCTV systems, and drones.</p>
        <Link
          href="/product"
          className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition shadow-xs"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  const grandTotal = cart.total_price ?? 0;
  const totalCount = cart.total_quantity ?? cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900">
      <div className="flex items-center gap-3 mb-8">
        <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
          <ShoppingBagIcon className="w-6 h-6" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-gray-500">
            {totalCount} Items Selected · Ready for Secure Stripe Checkout
          </p>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="space-y-4">
        {cart.items.map((item) => {
          const decreaseUrl = `/api/carts/decrease/${item.product_id}`;
          const increaseUrl = `/api/carts/increase/${item.product_id}`;
          const deleteUrl = `/api/carts/${item.id}`;
          const isItemBusy = updatingAction !== null;

          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-gray-300"
            >
              <div>
                <h2 className="font-bold text-gray-900 text-base">{item.product_title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Rs. {Number(item.price).toLocaleString()} × {item.quantity} ={' '}
                  <span className="font-bold text-gray-900 font-mono">
                    Rs. {Number(item.total).toLocaleString()}
                  </span>
                </p>
              </div>

              {/* Quantity Controls & Removal */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    type="button"
                    onClick={() => updateCart('patch', decreaseUrl)}
                    disabled={isItemBusy || item.quantity <= 1}
                    className="px-3.5 py-1.5 text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold cursor-pointer"
                  >
                    −
                  </button>

                  <span className="px-3.5 py-1.5 text-sm font-bold text-gray-900 bg-white font-mono border-x border-gray-200">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateCart('patch', increaseUrl)}
                    disabled={isItemBusy}
                    className="px-3.5 py-1.5 text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => updateCart('delete', deleteUrl)}
                  disabled={isItemBusy}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 ml-3 disabled:opacity-40 transition cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary & Checkout Action */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Subtotal ({totalCount} items)</p>
          <p className="text-2xl font-black text-gray-900 font-mono">Rs. {Number(grandTotal).toLocaleString()} PKR</p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/checkout')}
          className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl active:scale-95 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default CartPage;