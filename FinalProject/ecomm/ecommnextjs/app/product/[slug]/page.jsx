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
  const imageUrl = product.image_url
    ? `${baseUrl}/${product.image_url.replace(/\\/g, '/')}`
    : 'https://placehold.co/600x400?text=No+Image';

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 my-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Product Image */}
        <div className="w-full h-80 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-2xl font-bold text-rose-600 mb-3">₹{product.price}</p>
          <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
          
          <p className="text-sm font-medium text-gray-500 mb-4">
            Status: {isOutOfStock ? (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            ) : (
              <span className="text-emerald-600 font-semibold">In stock ({product.stock_quantity})</span>
            )}
          </p>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className="w-full md:w-auto px-8 py-3 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isOutOfStock ? 'Sold Out' : addingToCart ? 'Adding...' : 'Add to Cart 🛒'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;