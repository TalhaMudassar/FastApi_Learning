"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const hasMounted = useHasMounted();

  if (!hasMounted || loading) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-5 hidden md:block">
        <h2 className="text-lg font-bold text-gray-800 mb-6">User Panel</h2>
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-8 bg-gray-100 rounded-lg w-full"></div>
          <div className="h-8 bg-gray-100 rounded-lg w-3/4"></div>
          <div className="h-8 bg-gray-100 rounded-lg w-5/6"></div>
        </div>
      </aside>
    );
  }

  const navItems = [
    ...(user?.is_admin
      ? [
          { name: "Dashboard", href: "/user/dashboard" },
          { name: "Product List", href: "/user/product" },
          { name: "Category List", href: "/user/category" },
          { name: "Update Shipping Status", href: "/user/shippingstatus" },
        ]
      : []),
    { name: "My Orders", href: "/user/order" },
    { name: "Shipping Address", href: "/user/address" },
    { name: "Payment History", href: "/user/payments" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-5 hidden md:flex flex-col justify-between">
      <div>
        <div className="mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {user?.is_admin ? "🛡️ Admin Panel" : "👤 Customer Panel"}
          </h2>
          <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-rose-50 text-rose-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-6 w-full px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition text-left flex items-center justify-between"
      >
        <span>Sign Out</span>
        <span>🚪</span>
      </button>
    </aside>
  );
}