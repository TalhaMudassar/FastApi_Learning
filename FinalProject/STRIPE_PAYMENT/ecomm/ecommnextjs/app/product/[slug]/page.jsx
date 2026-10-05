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
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-900">
      {/* Editorial Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <button onClick={() => router.push('/')} className="hover:text-gray-900 cursor-pointer">
          Home
        </button>
        <span>/</span>
        <button onClick={() => router.push('/product')} className="hover:text-gray-900 cursor-pointer">
          Products
        </button>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{product.title}</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 shadow-xs">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Product Image Frame */}
          <div className="w-full aspect-4/3 md:aspect-square rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200 relative group">
            <img
              src={rawImageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = luxuryFallback;
              }}
            />
            {/* Status Pill */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-2xs border ${
                isOutOfStock 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : 'bg-white/95 text-emerald-700 border-emerald-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
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
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 tracking-wide uppercase"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
                  Rs. {Number(product.price).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  PKR · Free Insured TCS Courier Dispatch
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 font-mono">
                  Product Description &amp; Details
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {product.description || 'Precision-engineered hardware with high-grade thermal dissipation and factory burn-in validation. Backed by Aura Studio official warranty.'}
                </p>
              </div>

              {/* Hardware Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider font-mono">Build Grade</span>
                  <span className="font-semibold text-gray-800">Precision Chassis</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider font-mono">Warranty</span>
                  <span className="font-semibold text-gray-800">1-Year Official Warranty</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider font-mono">Diagnostics</span>
                  <span className="font-semibold text-gray-800">Burn-in Tested</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider font-mono">Dispatch</span>
                  <span className="font-semibold text-gray-800">Insured Courier Delivery</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="w-full py-4 px-8 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 hover:bg-black text-white active:scale-[0.99]"
              >
                {addingToCart ? (
                  <span>Adding to Cart...</span>
                ) : isOutOfStock ? (
                  <span>Sold Out</span>
                ) : (
                  <>
                    <span>Add to Cart</span>
                    <span className="opacity-60">·</span>
                    <span className="font-mono">Rs. {Number(product.price).toLocaleString()}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-gray-500 mt-3 font-medium">
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