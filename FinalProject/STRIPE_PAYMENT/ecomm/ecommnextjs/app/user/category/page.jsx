'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';
import AdminOnly from '@/components/AdminOnly';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await api.get('/api/categories');
      } catch {
        res = await api.get('/api/products-category');
      }
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setDeletingId(id);
    try {
      try {
        await api.delete(`/api/categories/${id}`);
      } catch {
        await api.delete(`/api/products-category/${id}`);
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err.response?.data?.detail || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AdminOnly>
      <div className="max-w-4xl mx-auto space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span>Categories</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Organize and maintain store product categories
            </p>
          </div>
          <Link
            href="/user/category/create"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Category</span>
          </Link>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-mono">
            {error}
          </div>
        )}

        {loading ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-gray-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900">No categories found</p>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Create categories so items can be easily filtered across the store.
            </p>
            <Link
              href="/user/category/create"
              className="inline-block px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs"
            >
              Add First Category
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 w-24">ID</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 font-mono text-gray-400">#{cat.id}</td>
                    <td className="p-4 font-semibold text-gray-900 text-sm">{cat.name}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 disabled:opacity-50 transition cursor-pointer"
                      >
                        {deletingId === cat.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminOnly>
  );
};

export default CategoryPage;