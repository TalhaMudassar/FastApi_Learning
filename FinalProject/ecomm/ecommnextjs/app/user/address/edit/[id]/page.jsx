'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/axios';

const EditAddress = () => {
  const router = useRouter();
  const params = useParams();

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

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setPageLoading(true);
        const res = await api.get(`/api/shippings/addresses/${params.id}`);
        // Strip out read-only fields like id and user_id
        setForm({
          name: res.data.name || '',
          phone_number: res.data.phone_number || '',
          address_line1: res.data.address_line1 || '',
          address_line2: res.data.address_line2 || '',
          city: res.data.city || '',
          state: res.data.state || '',
          pin_code: res.data.pin_code || '',
          country: res.data.country || '',
        });
      } catch (err) {
        console.error('Failed to load address:', err);
        setError(err.response?.data?.detail || 'Failed to load address details.');
      } finally {
        setPageLoading(false);
      }
    };

    if (params.id) {
      fetchAddress();
    }
  }, [params.id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.patch(`/api/shippings/addresses/${params.id}`, form);
      router.push('/user/address');
    } catch (err) {
      console.error('Failed to update address:', err);
      const detail = err.response?.data?.detail;

      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        const formatted = detail
          .map((item) => `${item.loc?.slice(-1)[0] || 'Field'}: ${item.msg}`)
          .join(' | ');
        setError(formatted);
      } else {
        setError('Failed to update address. Please check your inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Loading address details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">✏️ Edit Address</h1>
          <p className="text-xs text-gray-500 mt-1">Update your existing shipping and delivery details</p>
        </div>
        <Link
          href="/user/address"
          className="text-sm font-medium text-gray-500 hover:text-gray-800 transition"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            name="address_line1"
            value={form.address_line1}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            name="address_line2"
            value={form.address_line2}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              State *
            </label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              PIN / Postal Code *
            </label>
            <input
              type="text"
              name="pin_code"
              value={form.pin_code}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Country *
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/user/address"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-rose-600 text-white font-medium text-sm rounded-xl hover:bg-rose-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-rose-100"
          >
            {submitting ? 'Updating...' : 'Update Address'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAddress;