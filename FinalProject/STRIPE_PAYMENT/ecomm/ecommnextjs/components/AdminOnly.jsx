"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/user/dashboard");
      } else if (!user.is_admin) {
        // Redirect standard buyers to their order page
        router.push("/user/order");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Checking admin permissions...</p>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  return <>{children}</>;
}