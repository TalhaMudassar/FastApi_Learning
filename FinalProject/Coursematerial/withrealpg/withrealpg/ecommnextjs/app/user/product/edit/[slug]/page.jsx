'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/utils/axios'
import AdminOnly from '@/components/AdminOnly'

const ProductEditPage = () => {
  const router = useRouter()
  const params = useParams()
  const { slug } = params

  const [product, setProduct] = useState(null)
  const [productId, setProductId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock_quantity: '',
    categories: [],
    image: null
  })
  const [allCategories, setAllCategories] = useState([])

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${slug}`)
      const data = res.data
      setProduct(data)
      setProductId(data.id)
      setForm({
        title: data.title,
        description: data.description,
        price: data.price,
        stock_quantity: data.stock_quantity,
        categories: data.categories.map(c => c.id),
        image: null
      })
    } catch (err) {
      console.error('Failed to fetch product:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/products-category')
      setAllCategories(res.data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryToggle = (id) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!productId) return

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('stock_quantity', form.stock_quantity)
    form.categories.forEach(catId => formData.append('category_ids', catId))
    if (form.image) formData.append('image_url', form.image)

    try {
      await api.patch(`/api/products/${productId}`, formData)
      router.push('/user/product')
    } catch (err) {
      console.error('Failed to update product:', err)
      alert('Failed to update product')
    }
  }

  if (!product) return <p className="p-4 text-center">Loading product...</p>

  return (
    <AdminOnly>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">✏️ Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border p-2 rounded resize-none"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block mb-1 font-medium">Price *</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block mb-1 font-medium">Stock Quantity *</label>
            <input
              name="stock_quantity"
              type="number"
              value={form.stock_quantity}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Categories */}
          <div>
            <p className="font-medium mb-2">Categories:</p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(cat => (
                <label key={cat.id} className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block mb-1 font-medium">Replace Image (optional)</label>
            <input
              type="file"
              onChange={e => setForm(prev => ({ ...prev, image: e.target.files[0] }))}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Product
          </button>
        </form>
      </div>
    </AdminOnly>
  )
}

export default ProductEditPage
