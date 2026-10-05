'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Render registration form and handle account creation
const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Update form state on user input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(''); // Clear error on typing
  };

  // Submit registration data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await register(form);
    } catch (err) {
      // Extract detailed validation message from FastAPI error response
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMsg(detail);
      } else if (Array.isArray(detail)) {
        // FastAPI Pydantic validation errors array
        setErrorMsg(detail.map((d) => d.msg).join(', '));
      } else {
        setErrorMsg('Registration failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create an Account</h1>
        <p className="text-sm text-gray-500 mt-1">Join MyShop to track orders and save your details</p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-3 bg-rose-600 text-white font-medium text-sm rounded-xl hover:bg-rose-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-rose-100"
        >
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-rose-600 hover:text-rose-700 underline">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;