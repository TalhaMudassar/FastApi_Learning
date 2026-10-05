'use client';

import { useState } from 'react';
import api from '@/utils/axios';

// Component to handle authenticated user password changes
export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Submit old and new password to change password endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/api/account/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMessage(res.data?.msg || res.data?.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      let detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to change password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-sm rounded-2xl border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-900">Change Password</h2>

      {message && <p className="text-emerald-600 text-sm font-medium text-center mb-3">{message}</p>}
      {error && <p className="text-rose-600 text-sm font-medium text-center mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase">
            Old Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase">
            New Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase">
            Confirm New Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
