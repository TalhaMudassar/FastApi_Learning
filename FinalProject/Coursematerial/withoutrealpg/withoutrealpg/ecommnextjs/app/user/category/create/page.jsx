'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/axios'
import AdminOnly from '@/components/AdminOnly'

const CreateCategoryPage = () => {
  const [name, setName] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/products-category', { name })
      router.push('/user/category')
    } catch (err) {
      console.error('Failed to create category:', err)
      alert('Failed to create category')
    }
  }

  return (
    <AdminOnly>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">➕ Create Category</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Category Name *</label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </form>
      </div>
    </AdminOnly>
  )
}

export default CreateCategoryPage
