'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import AdminOnly from '@/components/AdminOnly';

const ProductCreatePage = () => {
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
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let res;
        try {
          res = await api.get('/api/categories');
        } catch {
          res = await api.get('/api/products-category');
        }
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (error) setError(null);
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
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('price', parseFloat(formData.price));
      data.append('stock_quantity', parseInt(formData.stock_quantity, 10));

      formData.category_ids.forEach((id) => {
        data.append('category_ids', id);
      });

      if (formData.image) {
        data.append('image', formData.image);
      }

      await api.post('/api/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push('/user/product');
    } catch (err) {
      console.error('Failed to create product:', err);
      const detail = err.response?.data?.detail;

      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        const formattedErrors = detail
          .map((item) => `${item.loc?.slice(-1)[0] || 'field'}: ${item.msg}`)
          .join(' | ');
        setError(formattedErrors);
      } else {
        setError('Failed to create product. Please verify all inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminOnly>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xs border border-gray-200 text-gray-900">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add Product</h1>
            <p className="text-xs text-gray-500 mt-0.5">Publish a new item to the store catalog</p>
          </div>
          <Link
            href="/user/product"
            className="text-xs font-medium text-gray-500 hover:text-gray-900 transition"
          >
            ← Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Dell XPS 16 OLED Laptop"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white transition placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Detailed specifications, features, warranty terms..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white transition placeholder-gray-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Unit Price (PKR / Rs.) *
              </label>
              <input
                type="number"
                name="price"
                placeholder="245000"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-gray-900 focus:bg-white transition placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock_quantity"
                placeholder="25"
                min="0"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-gray-900 focus:bg-white transition placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Interactive Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Categories (Click to select)
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-900'
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 file:cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/user/product"
              className="px-5 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              {loading ? 'Creating...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminOnly>
  );
};

export default ProductCreatePage;