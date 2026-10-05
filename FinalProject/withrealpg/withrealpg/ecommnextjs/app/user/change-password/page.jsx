'use client'

import { useState } from 'react'
import api from '@/utils/axios'

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/api/account/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      setMessage(res.data.msg || 'Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      let detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '))
      } else if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Failed to change password.')
      }
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4 text-center">Change Password</h2>
 
      {message && <p className="text-green-600 text-center mb-3">{message}</p>}
      {error && <p className="text-red-600 text-center mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Old Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Confirm New Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
