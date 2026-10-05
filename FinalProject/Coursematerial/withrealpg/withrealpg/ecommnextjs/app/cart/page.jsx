'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext' 

const CartPage = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/carts')
      setCart(res.data)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else {
        fetchCart()
      }
    }
  }, [authLoading, user])

  const updateCart = async (method, url) => {
    setUpdatingItemId(url) // temporary id marker
    try {
      // if (method === 'patch') await api.patch(url)
      await api[method](url)
      fetchCart()
    } catch (err) {
      console.error('Cart update failed:', err)
    } finally {
      setUpdatingItemId(null)
    }
  }

  if (loading || authLoading) {
    return <div className="text-center py-8 text-gray-600">Loading...</div>
  }

  if (!cart || cart.items.length === 0) {
    return <div className="text-center py-8 text-gray-600">🛒 Your cart is empty</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🛒 Your Cart</h1>

      <div className="space-y-4">
        {cart.items.map(item => (
          <div key={item.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{item.product_title}</h2>
                <p className="text-sm text-gray-600">
                  ₹{item.price} x {item.quantity} = ₹{item.total}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateCart('patch', `/api/carts/decrease/${item.product_id}`)}
                  className="px-3 py-1 bg-gray-200 text-lg rounded hover:bg-gray-300"
                  disabled={updatingItemId}
                >
                  −
                </button>

                <span className="font-semibold">{item.quantity}</span>

                <button
                  onClick={() => updateCart('patch', `/api/carts/increase/${item.product_id}`)}
                  className="px-3 py-1 bg-gray-200 text-lg rounded hover:bg-gray-300"
                  disabled={updatingItemId}
                >
                  +
                </button>

                <button
                  onClick={() => updateCart('delete', `/api/carts/delete/${item.id}`)}
                  className="text-red-500 hover:underline ml-4"
                  disabled={updatingItemId}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-4 text-right">
        <p className="text-lg font-semibold">
          Total ({cart.total_quantity} items): ₹{cart.total_price}
        </p>
        <button
          onClick={() => router.push('/checkout')}
          className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  )
}

export default CartPage
