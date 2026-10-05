'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

// Page component to request password reset link via email
export default function ResetPasswordEmailPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Submit email address to receive password reset link
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/send-password-reset-email`,
        { email }
      );
      setMessage(res.data?.detail || res.data?.msg || 'Password reset link sent! Check your email.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-2xl mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Reset Password</h2>

      {message && <p className="mb-4 text-emerald-600 text-sm font-medium text-center">{message}</p>}
      {error && <p className="mb-4 text-rose-600 text-sm font-medium text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50 text-sm shadow-sm"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
