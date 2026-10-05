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
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-400">Loading delivery addresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-mono">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Delivery Destinations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">Manage verified courier dispatch coordinates</p>
        </div>
        <Link
          href="/user/address/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Address</span>
        </Link>
      </div>

      {/* Address Content */}
      {addresses.length === 0 ? (
        <div className="bg-[#181c28] border border-white/10 rounded-2xl p-12 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white">No saved destinations</p>
          <p className="text-xs text-slate-400 mt-1 mb-5 font-mono">Add a delivery destination to speed up hardware checkout.</p>
          <Link
            href="/user/address/create"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20"
          >
            Create First Address
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-[#181c28] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between hover:border-white/20 transition"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h2 className="text-sm font-bold text-white">{addr.name}</h2>
                  <span className="text-[10px] bg-white/[0.06] text-slate-300 border border-white/10 px-2 py-0.5 rounded font-mono">
                    ID #{addr.id}
                  </span>
                </div>

                {addr.phone_number && (
                  <p className="text-xs text-cyan-400 font-mono mb-2">
                    {addr.phone_number}
                  </p>
                )}

                <div className="text-xs text-slate-300 leading-relaxed space-y-0.5">
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p className="text-slate-400">{addr.address_line2}</p>}
                  <p className="font-mono text-slate-400">
                    {addr.city}, {addr.state} - <span className="font-semibold text-white">{addr.pin_code}</span>
                  </p>
                  <p className="font-medium text-slate-200 mt-1">{addr.country}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/user/address/edit/${addr.id}`)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10 transition cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 disabled:opacity-50 transition cursor-pointer"
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