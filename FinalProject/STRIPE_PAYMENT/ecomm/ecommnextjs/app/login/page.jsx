'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from '@/components/ui/BrandLogo';
import { ShieldStripeIcon } from '@/components/ui/TechIcons';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        setErrorMsg('Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 sm:p-10 bg-white rounded-3xl shadow-sm border border-gray-200 relative overflow-hidden text-gray-900">
      <div className="text-center mb-8 flex flex-col items-center">
        <BrandLogo light={false} className="mb-4" />
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Sign In</h1>
        <p className="text-xs text-gray-500 mt-1">
          Access your orders, tracking & cart
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="client@aurastudio.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
        >
          {submitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        New to Aura Studio?{' '}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-800 underline">
          Create an account
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-mono">
        <ShieldStripeIcon className="w-3.5 h-3.5 text-emerald-600" />
        <span>256-Bit SSL Encrypted Session</span>
      </div>
    </div>
  );
};

export default LoginPage;