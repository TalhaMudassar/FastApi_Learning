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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              📂 Category Management
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Organize and manage catalog product taxonomy
            </p>
          </div>
          <Link
            href="/user/category/create"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-rose-100 self-start sm:self-auto"
          >
            ➕ Add Category
          </Link>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-3xl mb-2">🏷️</p>
            <p className="text-base font-semibold text-gray-800">No categories found</p>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Create categories so items can be filtered across your catalog.
            </p>
            <Link
              href="/user/category/create"
              className="inline-block px-5 py-2.5 bg-rose-600 text-white text-xs font-semibold rounded-xl"
            >
              Add First Category
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-20">ID</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-mono text-gray-400">#{cat.id}</td>
                    <td className="p-4 font-semibold text-gray-900 text-sm">{cat.name}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                      >
                        {deletingId === cat.id ? 'Deleting...' : '🗑️ Delete'}
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