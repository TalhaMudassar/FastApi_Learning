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
    <div className="max-w-md mx-auto my-12 p-8 sm:p-10 bg-[#181c28] rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
      {/* Subtle Cyan Ambient Glow inside card */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8 flex flex-col items-center">
        <BrandLogo light={true} className="mb-4" />
        <h1 className="text-2xl font-black tracking-tight text-white">Sign In to Studio</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Access your hardware orders, tracking & cart
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
            className="w-full px-4 py-3 bg-[#141824] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500 transition font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
            className="w-full px-4 py-3 bg-[#141824] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          {submitting ? 'Authenticating...' : 'Sign In to Terminal'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/[0.06] text-center text-xs text-stone-400">
        New to Aura Studio?{' '}
        <Link href="/register" className="font-bold text-cyan-400 hover:text-cyan-300 underline font-mono">
          Create an account
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-stone-500 font-mono">
        <ShieldStripeIcon className="w-3.5 h-3.5 text-emerald-400" />
        <span>256-Bit SSL Encrypted Session</span>
      </div>
    </div>
  );
};

export default LoginPage;