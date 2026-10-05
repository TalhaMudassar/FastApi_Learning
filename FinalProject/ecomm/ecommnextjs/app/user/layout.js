"use client";

import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmailVerificationSend from "@/components/user/EmailVerificationSend";
import Sidebar from "@/components/user/SideBar";

// Layout for user pages with sidebar and route protection
export default function UserLayout({ children }) {
  const pathname = usePathname();
  const isVerifyEmail = pathname?.includes("/user/verify-email");

  // Bypass route guard so users clicking verification links can verify without prior login
  if (isVerifyEmail) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <ProtectedRoute>
      <EmailVerificationSend />
      <div className="min-h-screen flex">
        <Sidebar />
        <main role="main" className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}