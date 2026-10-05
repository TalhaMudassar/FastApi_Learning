'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import api from "@/utils/axios";

const ProductDetailPage = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${slug}`)
        setProduct(res.data)
      } catch (err) {
        console.error('Failed to load product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchProduct()
  }, [slug])

  const handleAddToCart = async () =>{
    if (!user){
      router.push(`/login?redirect=/product/${product.slug}`);
      return
    }

     try {
      await api.post("/api/carts/add", {
        product_id: product.id,
        quantity: 1,
      });
      router.push("/cart");
      
    } catch (error) {
      console.error("Error adding to cart:", err);      
    }

  }

 
  if (loading) return <p className="text-center text-gray-600">Loading product...</p>
  if (!product) return <p className="text-center text-red-500">Product not found.</p>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Product Image */}
        <img
          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${product.image_url.replace(/\\/g, '/')}`}
          alt={product.title}
          className="w-full h-64 object-cover rounded"
        />

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-4">
            {product.description}
          </p>
          <p className="text-xl font-semibold mb-2">₹{product.price}</p>
          <p className="text-sm text-gray-500 mb-4">In stock: {product.stock_quantity}</p>

          {/* Categories */}
          <div className="flex gap-2 mb-4">
            {product.categories.map(cat => (
              <span
                key={cat.id}
                className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700"
              >
                {cat.name}
              </span>
            ))}
          </div>

          {/* Button */}
          <button onClick={handleAddToCart} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
