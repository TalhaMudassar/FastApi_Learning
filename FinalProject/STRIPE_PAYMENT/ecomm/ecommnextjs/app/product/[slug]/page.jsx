'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/axios';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const res = await axios.get(`${baseUrl}/api/products/${slug}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      // Preserve the product return path so login routes them back here
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }

    setAddingToCart(true);
    try {
      await api.post('/api/carts/add', {
        product_id: product.id,
        quantity: 1,
      });
      router.push('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.detail || 'Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <p className="text-gray-500 text-lg">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <p className="text-rose-600 font-semibold text-lg">Product not found.</p>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const isTech = product.title?.toLowerCase().includes("laptop") || 
                 product.title?.toLowerCase().includes("asus") || 
                 product.title?.toLowerCase().includes("dell");
  const luxuryFallback = isTech
    ? "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
    : "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80";

  const rawImageUrl = product.image_url
    ? `${baseUrl}/${product.image_url.replace(/\\/g, '/')}`
    : luxuryFallback;

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Editorial Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-400 mb-6 font-mono">
        <button onClick={() => router.push('/')} className="hover:text-cyan-400 cursor-pointer">
          Studio Home
        </button>
        <span>/</span>
        <button onClick={() => router.push('/product')} className="hover:text-cyan-400 cursor-pointer">
          Hardware Systems
        </button>
        <span>/</span>
        <span className="text-white font-semibold">{product.title}</span>
      </div>

      <div className="bg-[#181c28] rounded-3xl border border-white/10 p-6 md:p-10 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Product Image Frame */}
          <div className="w-full aspect-4/3 md:aspect-square rounded-2xl overflow-hidden bg-[#11141d] flex items-center justify-center border border-white/10 relative group">
            <img
              src={rawImageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95 group-hover:opacity-100"
              onError={(e) => {
                e.currentTarget.src = luxuryFallback;
              }}
            />
            {/* Status Pill */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm border ${
                isOutOfStock 
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/30' 
                  : 'bg-[#11141d]/90 text-cyan-300 border-cyan-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-cyan-400 animate-pulse'}`} />
                <span>{isOutOfStock ? 'Sold Out' : `In Stock (${product.stock_quantity})`}</span>
              </span>
            </div>
          </div>

          {/* Product Dossier & Purchase Action */}
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              {/* Category Badges */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#11141d] text-cyan-300 border border-cyan-500/30 tracking-wide uppercase font-mono"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {product.title}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-cyan-400 tracking-tight font-mono">
                  Rs. {Number(product.price).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  PKR · Free Insured TCS Courier Dispatch
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                  Hardware Specification & Architecture
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {product.description || 'Precision-engineered hardware with high-grade thermal dissipation and factory burn-in validation. Backed by Aura Studio official warranty.'}
                </p>
              </div>

              {/* Hardware Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6 p-4 rounded-xl bg-[#11141d] border border-white/10 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-mono">Build Grade</span>
                  <span className="font-semibold text-slate-200">Precision Chassis</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider font-mono">Warranty</span>
                  <span className="font-semibold text-slate-200">1-Year Official Warranty</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-mono">Diagnostics</span>
                  <span className="font-semibold text-slate-200">Burn-in Tested</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-mono">Dispatch</span>
                  <span className="font-semibold text-slate-200">Insured TCS / Courier</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="w-full py-4 px-8 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white active:scale-[0.99]"
              >
                {addingToCart ? (
                  <span>Securing Hardware...</span>
                ) : isOutOfStock ? (
                  <span>Sold Out</span>
                ) : (
                  <>
                    <span>Add to Bag</span>
                    <span className="opacity-60">·</span>
                    <span className="font-mono">Rs. {Number(product.price).toLocaleString()}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-3 font-medium">
                Verified 256-bit Stripe encryption · Automated card refund on order cancellation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;