'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/shippings/addresses');
      setAddresses(res.data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setError(err.response?.data?.detail || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/shippings/addresses/${id}`);
      // Optimistic update: filter out deleted address immediately from UI
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert(err.response?.data?.detail || 'Failed to delete address.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Loading addresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">🏠 Delivery Addresses</h1>
          <p className="text-xs text-gray-500 mt-1">Manage delivery destinations for order checkouts</p>
        </div>
        <Link
          href="/user/address/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
        >
          ➕ Add New Address
        </Link>
      </div>

      {/* Address Content */}
      {addresses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-3xl mb-3">📍</p>
          <p className="text-base font-semibold text-gray-800">No saved addresses found</p>
          <p className="text-xs text-gray-500 mt-1 mb-5">Add a delivery address to complete orders quickly.</p>
          <Link
            href="/user/address/create"
            className="inline-block px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition"
          >
            Create Address
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h2 className="text-base font-bold text-gray-900">{addr.name}</h2>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                    ID #{addr.id}
                  </span>
                </div>

                {addr.phone_number && (
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    📞 {addr.phone_number}
                  </p>
                )}

                <div className="text-xs text-gray-600 leading-relaxed space-y-0.5">
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p>{addr.address_line2}</p>}
                  <p>
                    {addr.city}, {addr.state} - <span className="font-semibold">{addr.pin_code}</span>
                  </p>
                  <p className="font-medium text-gray-700">{addr.country}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/user/address/edit/${addr.id}`)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                >
                  {deletingId === addr.id ? 'Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}