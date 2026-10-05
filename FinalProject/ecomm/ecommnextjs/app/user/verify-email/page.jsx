"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/utils/axios";

import { useAuth } from "@/context/AuthContext";

// Component to process verification token from URL and notify user
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchUser } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("Verifying your email...");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verify email token with backend on mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("Verification token not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/account/verify-email", {
          params: { token },
        });
        setStatus(response.data?.msg || "Email verified successfully!");
        setIsSuccess(true);
        if (fetchUser) fetchUser();

        // Redirect to login page after successful verification
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error) {
        setStatus(
          error.response?.data?.detail || "Invalid or expired verification token."
        );
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, router, fetchUser]);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-md rounded-xl text-center border border-gray-100">
      <h2
        className={`text-xl font-bold mb-4 ${
          loading
            ? "text-gray-700"
            : isSuccess
            ? "text-emerald-600"
            : "text-rose-600"
        }`}
      >
        {status}
      </h2>

      {isSuccess && (
        <p className="text-xs text-gray-500 mb-4">
          Redirecting to login page in a few seconds...
        </p>
      )}

      {!loading && (
        <button
          onClick={() => router.push("/login")}
          className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
        >
          Proceed to Login
        </button>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-20 p-8 text-center text-gray-500">
          Loading verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}