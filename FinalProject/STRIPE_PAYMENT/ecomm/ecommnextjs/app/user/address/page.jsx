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
        <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500">Loading addresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span>Saved Addresses</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your delivery and shipping addresses</p>
        </div>
        <Link
          href="/user/address/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Address</span>
        </Link>
      </div>

      {/* Address Content */}
      {addresses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900">No saved addresses</p>
          <p className="text-xs text-gray-500 mt-1 mb-5">Add a delivery address for quicker checkout.</p>
          <Link
            href="/user/address/create"
            className="inline-block px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            Create Address
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-gray-300 transition"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h2 className="text-sm font-bold text-gray-900">{addr.name}</h2>
                  <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded font-mono">
                    ID #{addr.id}
                  </span>
                </div>

                {addr.phone_number && (
                  <p className="text-xs text-blue-600 font-mono mb-2">
                    {addr.phone_number}
                  </p>
                )}

                <div className="text-xs text-gray-600 leading-relaxed space-y-0.5">
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p className="text-gray-500">{addr.address_line2}</p>}
                  <p className="text-gray-600">
                    {addr.city}, {addr.state} - <span className="font-semibold text-gray-900">{addr.pin_code}</span>
                  </p>
                  <p className="font-medium text-gray-800 mt-1">{addr.country}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/user/address/edit/${addr.id}`)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 transition cursor-pointer shadow-2xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 disabled:opacity-50 transition cursor-pointer shadow-2xs"
                >
                  {deletingId === addr.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}