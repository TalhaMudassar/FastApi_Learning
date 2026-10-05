'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import Link from 'next/link';
import AdminOnly from '@/components/AdminOnly';

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
      // Refresh list directly
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              📦 Product Inventory
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage store catalog, stock quantities, and product pricing
            </p>
          </div>
          <Link
            href="/user/product/create"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-rose-100 self-start sm:self-auto"
          >
            ➕ Add Product
          </Link>
        </div>

        {/* Product Items */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Loading catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-3xl mb-2">🏷️</p>
            <p className="text-base font-semibold text-gray-800">No products found</p>
            <p className="text-xs text-gray-500 mt-1 mb-5">Start by adding your first product listing.</p>
            <Link
              href="/user/product/create"
              className="inline-block px-5 py-2.5 bg-rose-600 text-white text-xs font-semibold rounded-xl"
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
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
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
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl font-bold">
                        🛍️
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900 text-base truncate">
                        {product.title}
                      </h2>
                      <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        #{product.id}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-gray-600">
                      <span className="text-rose-600 font-bold text-sm">₹{product.price}</span>
                      <span>•</span>
                      <span>
                        Stock:{' '}
                        <strong
                          className={
                            product.stock_quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }
                        >
                          {product.stock_quantity}
                        </strong>
                      </span>

                      {product.categories && product.categories.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex flex-wrap gap-1">
                            {product.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]"
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
                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <Link
                      href={`/user/product/edit/${product.slug}`}
                      className="flex-1 sm:flex-initial text-center px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                    >
                      {deletingId === product.id ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {products.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
            >
              ← Previous
            </button>
            <span className="font-medium text-gray-500">
              Page <strong className="text-gray-900">{page}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminOnly>
  );
}