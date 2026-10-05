'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Render login form and handle authentication
const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if redirected after registration to show verification email message
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setInfoMsg('Account registered successfully! A verification email has been sent to your inbox. Please verify your email.');
      }
    }
  }, []);

  // Submit credentials to log in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await login({ email, password });
    } catch (err) {
      console.error('Login failed:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMsg(detail);
      } else if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d) => d.msg).join(', '));
      } else {
        setErrorMsg('Invalid email or password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to access your orders and cart</p>
      </div>

      {infoMsg && (
        <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {infoMsg}
        </div>
      )}

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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
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
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-3 bg-rose-600 text-white font-medium text-sm rounded-xl hover:bg-rose-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-rose-100"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 flex flex-col sm:flex-row sm:justify-between items-center text-sm gap-2">
        <Link href="/reset-password-email" className="font-semibold text-rose-600 hover:text-rose-700 underline">
          Forgot Password?
        </Link>
        <div className="text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-rose-600 hover:text-rose-700 underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;