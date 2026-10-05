"use client";
import { useAuth } from "@/context/AuthContext";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const hasMounted = useHasMounted();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && hasMounted) {
      if (!user) {
        router.replace("/login");
      } else if (adminOnly && !user.is_admin) {
        router.replace("/unauthorized");
      } else {
        setIsAuthorized(true); // Only set to true if all checks pass
      }
    }
  }, [user, loading, hasMounted, adminOnly, router]);

  // Show loading state until checks are complete
  if (!hasMounted || loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 mt-2">Checking authorization...</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;