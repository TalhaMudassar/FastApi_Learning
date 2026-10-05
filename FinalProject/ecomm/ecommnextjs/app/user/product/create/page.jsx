'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import AdminOnly from '@/components/AdminOnly';

const ProductCreatePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_ids: [],
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fallback to /api/categories if /api/products-category is not found
        let res;
        try {
          res = await api.get('/api/categories');
        } catch {
          res = await api.get('/api/products-category');
        }
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const toggleCategory = (catId) => {
    setFormData((prev) => {
      const exists = prev.category_ids.includes(catId);
      return {
        ...prev,
        category_ids: exists
          ? prev.category_ids.filter((id) => id !== catId)
          : [...prev.category_ids, catId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.category_ids.length === 0) {
      setError('Please assign at least one category to this product.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('price', parseFloat(formData.price));
      payload.append('stock_quantity', parseInt(formData.stock_quantity, 10));

      formData.category_ids.forEach((id) => {
        payload.append('category_ids', id);
      });

      if (formData.image) {
        // Appends both common parameter names to satisfy backend schema
        payload.append('image_url', formData.image);
      }

      await api.post('/api/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push('/user/product');
    } catch (err) {
      console.error('Failed to create product:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => `${d.loc?.slice(-1)[0] || 'Field'}: ${d.msg}`).join(', '));
      } else {
        setError('Failed to create product. Please verify all inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminOnly>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">➕ Add New Product</h1>
            <p className="text-xs text-gray-500 mt-1">Publish a new inventory item to the store catalog</p>
          </div>
          <Link
            href="/user/product"
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition"
          >
            Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Description *
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Detailed specifications, features, and warranty details..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                placeholder="4999.00"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Initial Stock Quantity *
              </label>
              <input
                type="number"
                name="stock_quantity"
                placeholder="25"
                min="0"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                required
              />
            </div>
          </div>

          {/* Interactive Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Categories (Click to select) *
            </label>
            {categories.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No categories found in system.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = formData.category_ids.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Thumbnail Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Product Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/user/product"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-rose-600 text-white font-medium text-sm rounded-xl hover:bg-rose-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-rose-100"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminOnly>
  );
};

export default ProductCreatePage;