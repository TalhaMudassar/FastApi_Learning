"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/verify-password-reset-token`, {
        token,
        new_password: newPassword,
      })
      setSuccess(res.data.detail || "Password reset successful! Redirecting to login...")
      setTimeout(() => router.push("/login"), 2000)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        // FastAPI validation errors
        setError(detail.map(d => d.msg).join(', '))
      } else {
        // Other error messages
        setError(typeof detail === 'string' ? detail : 'Password reset failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  // If no token in URL
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 bg-white rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-500">Invalid Reset Link</h2>
          <p className="text-gray-600 mt-2">Please request a new password reset email.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        {error && (
          <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-sm text-green-600 text-center">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
