"use client";

import { useAuth } from "@/context/AuthContext";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const hasMounted = useHasMounted();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && hasMounted) {
      if (!user) {
        // Retain intended destination so login can redirect back
        const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
        router.replace(redirectUrl);
      } else if (adminOnly && !user.is_admin) {
        router.replace("/unauthorized");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, hasMounted, adminOnly, router, pathname]);

  // Prevent flash of protected UI while verification runs
  if (!hasMounted || loading || !isAuthorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Checking authorization...</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;