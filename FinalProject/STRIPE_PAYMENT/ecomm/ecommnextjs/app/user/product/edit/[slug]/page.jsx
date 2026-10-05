'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/axios';
import AdminOnly from '@/components/AdminOnly';

const ProductEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [productId, setProductId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock_quantity: '',
    categories: [],
    image: null,
  });

  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${slug}`);
      const data = res.data;
      setProduct(data);
      setProductId(data.id);
      setForm({
        title: data.title || '',
        description: data.description || '',
        price: data.price ?? '',
        stock_quantity: data.stock_quantity ?? '',
        categories: data.categories ? data.categories.map((c) => c.id) : [],
        image: null,
      });
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Failed to load product details.');
    } finally {
      setPageLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      let res;
      try {
        res = await api.get('/api/categories');
      } catch {
        res = await api.get('/api/products-category');
      }
      setAllCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProduct();
      fetchCategories();
    }
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleCategoryToggle = (id) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('price', parseFloat(form.price));
    formData.append('stock_quantity', parseInt(form.stock_quantity, 10));

    form.categories.forEach((catId) => {
      formData.append('category_ids', catId);
    });

    if (form.image) {
      formData.append('image_url', form.image);
    }

    try {
      await api.patch(`/api/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/user/product');
    } catch (err) {
      console.error('Failed to update product:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => `${d.loc?.slice(-1)[0] || 'Field'}: ${d.msg}`).join(', '));
      } else {
        setError('Failed to update product. Please check input values.');
      }
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const currentImageUrl = product?.image_url
    ? `${baseUrl}/${product.image_url.replace(/\\/g, '/')}`
    : null;

  if (pageLoading) {
    return (
      <AdminOnly>
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-mono">Loading product details...</p>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xs border border-gray-200 text-gray-900">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Update pricing, inventory levels, categories, or image
            </p>
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
              value={form.title}
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
              value={form.description}
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
                step="0.01"
                min="0"
                name="price"
                value={form.price}
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
                min="0"
                name="stock_quantity"
                value={form.stock_quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-gray-900 focus:bg-white transition placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Categories Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Categories (Click to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => {
                const isSelected = form.categories.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
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
          </div>

          {/* Current & New Image Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Product Image
            </label>
            {currentImageUrl && (
              <div className="flex items-center gap-4 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <img
                  src={currentImageUrl}
                  alt={product?.title || 'Product'}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white"
                />
                <div className="text-xs text-gray-600">
                  <p className="font-semibold text-gray-900">Current Image</p>
                  <p className="text-[11px] text-gray-500">Upload below only if you want to replace it</p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files[0] }))}
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
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminOnly>
  );
};

export default ProductEditPage;