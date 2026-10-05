'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';

const EditAddress = ({ params }) => {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

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

  const router = useRouter();

  useEffect(() => {
    const fetchAddressDetails = async () => {
      try {
        setPageLoading(true);
        const res = await api.get('/api/shippings/addresses');
        const found = res.data?.find((a) => String(a.id) === String(id));

        if (found) {
          setForm({
            name: found.name || '',
            phone_number: found.phone_number || '',
            address_line1: found.address_line1 || '',
            address_line2: found.address_line2 || '',
            city: found.city || '',
            state: found.state || '',
            pin_code: found.pin_code || '',
            country: found.country || '',
          });
        } else {
          setError('Address could not be located.');
        }
      } catch (err) {
        console.error('Failed to load address for edit:', err);
        setError('Error fetching existing address details.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchAddressDetails();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put(`/api/shippings/addresses/${id}`, form);
      router.push('/user/address');
    } catch (err) {
      console.error('Failed to update address:', err);
      const detail = err.response?.data?.detail;

      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        const formattedErrors = detail
          .map((item) => `${item.loc?.slice(-1)[0] || 'field'}: ${item.msg}`)
          .join(' | ');
        setError(formattedErrors);
      } else {
        setError('Failed to update address. Please verify your data.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500">Loading address details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xs border border-gray-200 text-gray-900">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Edit Address</h1>
          <p className="text-xs text-gray-500 mt-0.5">Update registered shipping details</p>
        </div>
        <Link
          href="/user/address"
          className="text-xs text-gray-500 hover:text-gray-900 underline transition"
        >
          ← Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:bg-white focus:outline-none focus:border-gray-900 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            name="address_line1"
            value={form.address_line1}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            name="address_line2"
            value={form.address_line2}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              State / Province *
            </label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 transition"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              name="pin_code"
              value={form.pin_code}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:bg-white focus:outline-none focus:border-gray-900 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Country *
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-gray-900 transition"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            href="/user/address"
            className="px-5 py-2.5 text-xs text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
          >
            {submitting ? 'Updating...' : 'Update Address'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAddress;