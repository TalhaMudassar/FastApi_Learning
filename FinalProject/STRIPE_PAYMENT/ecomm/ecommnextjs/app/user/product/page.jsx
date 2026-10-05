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
    if (!window.confirm('Are you sure you want to delete this product?')) {
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
      <div className="max-w-6xl mx-auto space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span>Product Inventory</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage store products, stock levels, and PKR pricing
            </p>
          </div>
          <Link
            href="/user/product/create"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </Link>
        </div>

        {/* Product Items */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 font-mono">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 mx-auto mb-3">
              <LaptopIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-900">No products found</p>
            <p className="text-xs text-gray-500 mt-1 mb-5">Start by creating your first product listing.</p>
            <Link
              href="/user/product/create"
              className="inline-block px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs"
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
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-gray-300 transition flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
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
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <LaptopIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900 text-sm truncate">
                        {product.title}
                      </h2>
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
                        #{product.id}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-gray-700">
                      <span className="text-gray-900 font-bold font-mono">
                        Rs. {Number(product.price).toLocaleString()} PKR
                      </span>
                      <span className="text-gray-300">•</span>
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
                          <span className="text-gray-300">•</span>
                          <div className="flex flex-wrap gap-1">
                            {product.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-[10px]"
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
                      className="flex-1 sm:flex-initial text-center px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 transition"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 disabled:opacity-50 transition cursor-pointer"
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
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition shadow-xs cursor-pointer"
            >
              ← Previous
            </button>
            <span className="font-medium text-gray-500 font-mono">
              Page <strong className="text-gray-900">{page}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition shadow-xs cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminOnly>
  );
}