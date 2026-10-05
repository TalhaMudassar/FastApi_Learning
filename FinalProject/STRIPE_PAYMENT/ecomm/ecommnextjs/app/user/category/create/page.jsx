'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import AdminOnly from '@/components/AdminOnly';

const CreateCategoryPage = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      try {
        await api.post('/api/categories', { name: name.trim() });
      } catch (err) {
        if (err.response?.status === 404) {
          await api.post('/api/products-category', { name: name.trim() });
        } else {
          throw err;
        }
      }
      router.push('/user/category');
    } catch (err) {
      console.error('Failed to create category:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else {
        setError('Failed to create category. It may already exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminOnly>
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xs border border-gray-200 mt-6 text-gray-900">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Category</h1>
            <p className="text-xs text-gray-500 mt-0.5">Add a new product category</p>
          </div>
          <Link
            href="/user/category"
            className="text-xs font-medium text-gray-500 hover:text-gray-900 transition"
          >
            ← Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Laptops, Desktops, Phones, Accessories"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white transition placeholder-gray-400"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <Link
              href="/user/category"
              className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              {loading ? 'Creating...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </AdminOnly>
  );
};

export default CreateCategoryPage;