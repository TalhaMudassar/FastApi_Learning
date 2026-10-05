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
    <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">➕ Add Address</h2>
        <Link
          href="/user/address"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Back
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number *</label>
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="+92 300 1234567"
            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Address Line 1 *</label>
          <input
            name="address_line1"
            value={form.address_line1}
            onChange={handleChange}
            placeholder="House / Street / Flat no."
            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
          <input
            name="address_line2"
            value={form.address_line2}
            onChange={handleChange}
            placeholder="Landmark, Area, etc."
            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">City *</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Hasilpur"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">State *</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Punjab"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Pin / Postal Code *</label>
            <input
              name="pin_code"
              value={form.pin_code}
              onChange={handleChange}
              placeholder="63636"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Country *</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Pakistan"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
};

export default CreateAddress;