'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import { useRouter } from 'next/navigation'

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const router = useRouter()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/orders')
      setOrders(res.data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      alert('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (id) => {
    setCancellingId(id)
    try {
      await api.patch(`/api/orders/cancel/${id}`)
      fetchOrders()
    } catch (err) {
      alert('❌ Only shipping pending orders can be cancelled.')
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading your orders...
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="text-lg">🛒 You haven’t placed any orders yet.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition"
        >
          Start Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-lg shadow-sm p-5 mb-6 bg-white"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Order #{order.id}</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                statusColors[order.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {order.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Placed on: {new Date(order.created_at).toLocaleString()}
          </p>

          {/* Shipping Address */}
          <div className="mt-3 mb-3">
            <h3 className="font-medium">📍 Shipping Address</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {order.shipping_address.name}
              {order.shipping_address.address_line1}
              {order.shipping_address.address_line2
                ? `, ${order.shipping_address.address_line2}`
                : ''}
              ,<br />
              {order.shipping_address.city}, {order.shipping_address.state} -{' '}
              {order.shipping_address.pin_code},<br />
              {order.shipping_address.country}
            </p>
          </div>

          {/* Shipping Status */}
          <div className="mb-3">
            <h3 className="font-medium">🚚 Shipping Status</h3>
            <p className="text-sm text-blue-700">
              {order.shipping_status.status} (Updated:{' '}
              {new Date(order.shipping_status.updated_at).toLocaleString()})
            </p>
          </div>

          {/* Items */}
          <div className="mb-4">
            <h3 className="font-medium">🛍️ Items</h3>
            {order.orderitems.map((item) => (
              <div
                key={item.id}
                className="border p-3 rounded-md mb-2 bg-gray-50"
              >
                <p className="text-base font-semibold">
                  {item.product.title} ({item.quantity} × ₹{item.price})
                </p>
                <p className="text-sm text-gray-600">
                  {item.product.description}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center">
            <p className="font-semibold text-lg">
              Total: ₹{order.total_price}
            </p>
            {order.shipping_status.status === 'pending' && (
              <button
                onClick={() => cancelOrder(order.id)}
                disabled={cancellingId === order.id}
                className={`px-4 py-2 rounded text-white transition ${
                  cancellingId === order.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
