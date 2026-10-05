'use client'
import { useState } from 'react'
import axios from 'axios'

export default function ResetPasswordEmailPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/send-password-reset-email`, { email })
      setMessage(res.data.detail || 'Password reset link sent! Check your email.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-2xl mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
      
      {message && <p className="mb-4 text-green-600 text-sm">{message}</p>}
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="email" 
          name="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          required 
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  )
}
