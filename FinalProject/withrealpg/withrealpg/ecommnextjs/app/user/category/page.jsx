'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import AdminOnly from '@/components/AdminOnly'
import { useRouter } from 'next/navigation'

const CategoryPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/products-category')
      setCategories(res.data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      alert('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/api/products-category/${id}`)
      setCategories(categories.filter(cat => cat.id !== id))
    } catch (err) {
      console.error('Failed to delete category:', err)
      alert('Failed to delete category')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  if (loading) return <p className="p-4 text-center">Loading categories...</p>

  return (
    <AdminOnly>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📂 Categories</h1>
          <button
            onClick={() => router.push('/user/category/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td className="border border-gray-300 px-4 py-2">{cat.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminOnly>
  )
}

export default CategoryPage
