"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// Content component handling password reset form and token verification
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Submit new password with reset token to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/verify-password-reset-token`,
        {
          token,
          new_password: newPassword,
        }
      );
      setSuccess(
        res.data?.detail || res.data?.msg || "Password reset successful! Redirecting to login..."
      );
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        // FastAPI validation errors
        setError(detail.map((d) => d.msg).join(", "));
      } else {
        // Other error messages
        setError(typeof detail === "string" ? detail : "Password reset failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // If token is missing in URL query params
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="p-8 bg-white rounded-2xl shadow-md text-center max-w-md mx-auto border border-gray-100">
          <h2 className="text-xl font-semibold text-rose-600 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 text-sm mb-4">Please request a new password reset email.</p>
          <Link
            href="/reset-password-email"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            Request Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Reset Password</h2>

        {error && (
          <p className="mb-4 text-sm text-rose-600 text-center font-medium">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-sm text-emerald-600 text-center font-medium">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main page wrapper with suspense boundary for search params
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500 text-sm">Loading reset form...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
