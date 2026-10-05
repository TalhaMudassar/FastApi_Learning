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
      // Handles both /api/categories and /api/products-category router prefixes
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
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">➕ Create Category</h1>
            <p className="text-xs text-gray-500 mt-1">Add a new taxonomy for catalog items</p>
          </div>
          <Link
            href="/user/category"
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition"
          >
            Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Footwear, Electronics, Books"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Link
              href="/user/category"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 bg-rose-600 text-white font-medium text-sm rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-rose-100"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </AdminOnly>
  );
};

export default CreateCategoryPage;