'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import Link from 'next/link';
import AdminOnly from '@/components/AdminOnly';
import { LaptopIcon } from '@/components/ui/TechIcons';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/products?limit=${limit}&page=${page}`);
      setProducts(res.data.items || []);
      setTotalPages(Math.ceil((res.data.total || 0) / (res.data.limit || limit)));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/api/products/${id}`);
      if (page === 1) {
        fetchProducts();
      } else {
        setPage(1);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert(err.response?.data?.detail || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const formatImage = (url) => (url ? `${baseUrl}/${url.replace(/\\/g, '/')}` : null);

  return (
    <AdminOnly>
      <div className="max-w-6xl mx-auto space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Product Inventory Catalog</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Manage store hardware catalog, stock levels, and PKR pricing
            </p>
          </div>
          <Link
            href="/user/product/create"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Hardware Item</span>
          </Link>
        </div>

        {/* Product Items */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-slate-400">Loading catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-[#181c28] border border-white/10 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400 mx-auto mb-3">
              <LaptopIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No products found</p>
            <p className="text-xs text-slate-400 mt-1 mb-5 font-mono">Start by provisioning your first hardware listing.</p>
            <Link
              href="/user/product/create"
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20"
            >
              Create Product
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const imageUrl = formatImage(product.image_url);

              return (
                <div
                  key={product.id}
                  className="bg-[#181c28] border border-white/10 rounded-2xl p-5 shadow-2xl hover:border-white/20 transition flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#11141d] flex-shrink-0 border border-white/[0.08]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <LaptopIcon className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-white text-sm truncate">
                        {product.title}
                      </h2>
                      <span className="text-[10px] font-mono bg-white/[0.06] text-slate-300 border border-white/10 px-2 py-0.5 rounded">
                        #{product.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-slate-300">
                      <span className="text-cyan-400 font-bold font-mono">
                        Rs. {Number(product.price).toLocaleString()} PKR
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>
                        Stock:{' '}
                        <strong
                          className={
                            product.stock_quantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }
                        >
                          {product.stock_quantity}
                        </strong>
                      </span>

                      {product.categories && product.categories.length > 0 && (
                        <>
                          <span className="text-slate-600">•</span>
                          <div className="flex flex-wrap gap-1">
                            {product.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="bg-white/[0.05] text-slate-300 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                    <Link
                      href={`/user/product/edit/${product.slug}`}
                      className="flex-1 sm:flex-initial text-center px-4 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10 transition"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 disabled:opacity-50 transition cursor-pointer"
                    >
                      {deletingId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {products.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 transition shadow-sm cursor-pointer"
            >
              ← Previous
            </button>
            <span className="font-medium text-slate-400 font-mono">
              Page <strong className="text-white">{page}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 transition shadow-sm cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminOnly>
  );
}