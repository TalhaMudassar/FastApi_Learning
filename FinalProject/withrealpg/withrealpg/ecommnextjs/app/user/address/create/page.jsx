'use client'
import { useState } from 'react'
import api from '@/utils/axios'
import { useRouter } from 'next/navigation'

const CreateAddress = () => {
  const [form, setForm] = useState({
    name:'',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pin_code: '',
    country: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const router = useRouter()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post('/api/shippings/addresses', form)
      router.push('/user/address')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">➕ Add Address</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Address Line 1 *</label>
          <input
            name="address_line1"
            value={form.address_line1}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Address Line 2</label>
          <input
            name="address_line2"
            value={form.address_line2}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">City *</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">State *</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Pin Code *</label>
          <input
            name="pin_code"
            value={form.pin_code}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Country *</label>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white cursor-pointer ${
            loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  )
}

export default CreateAddress
