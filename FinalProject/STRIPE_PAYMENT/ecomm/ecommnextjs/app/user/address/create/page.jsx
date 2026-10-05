'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';

const CreateAddress = () => {
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pin_code: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/shippings/addresses', form);
      router.push('/user/address');
    } catch (err) {
      console.error('Failed to create address:', err);

      const detail = err.response?.data?.detail;

      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        const formattedErrors = detail
          .map((item) => `${item.loc?.slice(-1)[0] || 'field'}: ${item.msg}`)
          .join(' | ');
        setError(formattedErrors);
      } else {
        setError('Failed to save address. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-xl mx-auto bg-[#181c28] rounded-2xl border border-white/10 shadow-2xl text-slate-100">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.08]">
        <h2 className="text-lg font-bold text-white">Add Delivery Destination</h2>
        <Link
          href="/user/address"
          className="text-xs text-slate-400 hover:text-white font-mono underline transition"
        >
          ← Back
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-mono uppercase tracking-wider text-slate-300">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full bg-[#141824] border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-mono uppercase tracking-wider text-slate-300">Phone Number *</label>
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="+92 300 1234567"
            className="w-full bg-[#141824] border border-white/10 p-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-mono uppercase tracking-wider text-slate-300">Address Line 1 *</label>
          <input
            name="address_line1"
            value={form.address_line1}
            onChange={handleChange}
            placeholder="House / Street / Flat no."
            className="w-full bg-[#141824] border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-mono uppercase tracking-wider text-slate-300">Address Line 2 (Optional)</label>
          <input
            name="address_line2"
            value={form.address_line2}
            onChange={handleChange}
            placeholder="Landmark, Area, Suite"
            className="w-full bg-[#141824] border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-mono uppercase tracking-wider text-slate-300">City *</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Hasilpur / Lahore"
              className="w-full bg-[#141824] border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-mono uppercase tracking-wider text-slate-300">State / Province *</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Punjab"
              className="w-full bg-[#141824] border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-mono uppercase tracking-wider text-slate-300">Postal Code *</label>
            <input
              name="pin_code"
              value={form.pin_code}
              onChange={handleChange}
              placeholder="63636"
              className="w-full bg-[#141824] border border-white/10 p-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-mono uppercase tracking-wider text-slate-300">Country *</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Pakistan"
              className="w-full bg-[#141824] border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-xs transition bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          {loading ? 'Saving Address...' : 'Save Delivery Coordinates'}
        </button>
      </form>
    </div>
  );
};

export default CreateAddress;