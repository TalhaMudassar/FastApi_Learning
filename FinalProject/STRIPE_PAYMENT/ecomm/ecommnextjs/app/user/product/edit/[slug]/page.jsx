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
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-slate-400">Loading hardware details...</p>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="max-w-3xl mx-auto bg-[#181c28] p-8 rounded-2xl shadow-2xl border border-white/10 text-slate-100">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-lg font-bold text-white">Edit Hardware Product</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Update pricing, inventory levels, categories, or media
            </p>
          </div>
          <Link
            href="/user/product"
            className="text-xs font-mono text-slate-400 hover:text-white underline transition"
          >
            ← Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-300 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-[#141824] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition placeholder-slate-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Engineering Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-[#141824] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition placeholder-slate-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                Unit Price (PKR / Rs.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#141824] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition placeholder-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                name="stock_quantity"
                value={form.stock_quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#141824] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Categories Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Assigned Categories
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
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                        : 'bg-[#141824] text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
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
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Hardware Photography
            </label>
            {currentImageUrl && (
              <div className="flex items-center gap-4 mb-3 p-3 bg-[#141824] rounded-xl border border-white/10">
                <img
                  src={currentImageUrl}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-lg border border-white/10 bg-[#11141d]"
                />
                <div className="text-xs text-slate-400">
                  <p className="font-semibold text-white">Current Hardware Image</p>
                  <p className="text-[11px] font-mono text-slate-500">Upload below only if you want to replace it</p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files[0] }))}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/[0.06] file:text-slate-200 hover:file:bg-white/[0.1] file:cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Link
              href="/user/product"
              className="px-5 py-2.5 text-xs font-mono text-slate-400 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminOnly>
  );
};

export default ProductEditPage;