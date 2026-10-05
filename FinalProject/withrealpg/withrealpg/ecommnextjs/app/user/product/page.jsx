'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import Link from 'next/link'
import AdminOnly from '@/components/AdminOnly'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/products?limit=${limit}&page=${page}`)
      setProducts(res.data.items)
      setTotalPages(Math.ceil(res.data.total / res.data.limit))
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page])

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/api/products/${id}`)
      setPage(1)
    } catch (err) {
      console.error('Failed to delete product:', err)
    }
  }

  const formatImage = (url) => url?.replace(/\\/g, '/')

  return (
    <AdminOnly>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📦 My Products</h1>
          <Link
            href="/user/product/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            + Add Product
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600 text-center py-10">No products found.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 border rounded shadow flex gap-4 hover:shadow-lg transition-shadow"
              >
                <img
                  src={
                    product.image_url
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${formatImage(product.image_url)}`
                      : '/placeholder.png'
                  }
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{product.title}</h2>
                  <p className="text-sm text-gray-600 mb-1 line-clamp-3">{product.description}</p>
                  <p className="text-sm font-medium">
                    ₹{product.price} | Stock: {product.stock_quantity}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="text-xs bg-gray-200 px-2 py-0.5 rounded"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Link
                    href={`/user/product/edit/${product.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              ⬅ Prev
            </button>
            <p className="text-gray-700">
              Page {page} of {totalPages}
            </p>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next ➡
            </button>
          </div>
        )}
      </div>
    </AdminOnly>
  )
}
