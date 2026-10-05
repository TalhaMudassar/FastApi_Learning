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
    <div className="p-6 sm:p-8 max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xs text-gray-900">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Add Delivery Address</h2>
        <Link
          href="/user/address"
          className="text-xs text-gray-500 hover:text-gray-900 underline transition"
        >
          ← Back
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">Phone Number *</label>
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="+92 300 1234567"
            className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl text-xs text-gray-900 font-mono focus:bg-white focus:outline-none focus:border-gray-900 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">Address Line 1 *</label>
          <input
            name="address_line1"
            value={form.address_line1}
            onChange={handleChange}
            placeholder="House / Street / Flat no."
            className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">Address Line 2 (Optional)</label>
          <input
            name="address_line2"
            value={form.address_line2}
            onChange={handleChange}
            placeholder="Landmark, Area, Suite"
            className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">City *</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Lahore / Islamabad"
              className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">State / Province *</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Punjab / Sindh"
              className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">Postal Code *</label>
            <input
              name="pin_code"
              value={form.pin_code}
              onChange={handleChange}
              placeholder="54000"
              className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl text-xs text-gray-900 font-mono focus:bg-white focus:outline-none focus:border-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wider text-gray-700">Country *</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Pakistan"
              className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 placeholder-gray-400"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-xs transition bg-gray-900 hover:bg-black disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {loading ? 'Saving Address...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
};

export default CreateAddress;