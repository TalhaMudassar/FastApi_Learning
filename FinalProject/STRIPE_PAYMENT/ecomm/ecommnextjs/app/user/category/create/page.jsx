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
      <div className="max-w-md mx-auto bg-[#181c28] p-8 rounded-2xl shadow-2xl border border-white/10 mt-6 text-slate-100">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-lg font-bold text-white">Create Category</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Provision hardware catalog taxonomy</p>
          </div>
          <Link
            href="/user/category"
            className="text-xs font-mono text-slate-400 hover:text-white transition underline"
          >
            ← Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Category Title *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Laptops, Workstations, Drones, CCTV Optics"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-[#141824] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition placeholder-slate-600"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Link
              href="/user/category"
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-cyan-500/20 cursor-pointer"
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