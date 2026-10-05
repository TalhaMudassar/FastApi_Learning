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
      <div className="max-w-3xl mx-auto bg-[#181c28] p-8 rounded-2xl shadow-2xl border border-white/10 text-slate-100">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-lg font-bold text-white">Add Hardware Product</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Publish a new computing or optics item to the catalog</p>
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
              placeholder="e.g. Dell XPS 16 OLED Workstation"
              value={formData.title}
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
              placeholder="Detailed silicon specifications, sensor parameters, optics, and warranty terms..."
              value={formData.description}
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
                name="price"
                placeholder="245000"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#141824] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition placeholder-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                Initial Stock Units *
              </label>
              <input
                type="number"
                name="stock_quantity"
                placeholder="25"
                min="0"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#141824] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Interactive Category Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Assigned Categories (Click to toggle)
            </label>
            {categories.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono">No categories found in system.</p>
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
            )}
          </div>

          {/* Product Thumbnail Upload */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Hardware Photography
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
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
              {loading ? 'Creating...' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminOnly>
  );
};

export default ProductCreatePage;