"use client";

import { useState } from "react";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";

// Banner displayed to logged-in users whose emails are unverified
export default function EmailVerificationSend() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Hide banner if user is not loaded or already verified
  if (!user || user.is_verified) {
    return null;
  }

  const handleSendVerification = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/api/account/send-verification-email");
      setMessage(res.data.msg || "Verification email sent! Check your inbox.");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to send verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-r-md">
      <div>
        <p className="text-sm text-amber-800 font-medium">
          Your account email is not verified yet. Please verify to ensure full access.
        </p>
        {message && <p className="text-xs text-emerald-600 mt-1 font-semibold">{message}</p>}
        {error && <p className="text-xs text-rose-600 mt-1 font-semibold">{error}</p>}
      </div>
      <button
        onClick={handleSendVerification}
        disabled={loading}
        className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-sm disabled:opacity-50 transition-colors"
      >
        {loading ? "Sending..." : "Resend Email"}
      </button>
    </div>
  );
}