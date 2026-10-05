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
      <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-5 hidden md:block">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">User Console</h2>
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-5/6"></div>
        </div>
      </aside>
    );
  }

  const navItems = [
    ...(user?.is_admin
      ? [
          { name: "Dashboard", href: "/user/dashboard" },
          { name: "Products", href: "/user/product" },
          { name: "Categories", href: "/user/category" },
          { name: "Shipping Status", href: "/user/shippingstatus" },
        ]
      : []),
    { name: "Orders", href: "/user/order" },
    { name: "Addresses", href: "/user/address" },
    { name: "Payments", href: "/user/payments" },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-5 hidden md:flex flex-col justify-between text-gray-700">
      <div>
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {user?.is_admin ? "Admin Portal" : "Customer Portal"}
            </h2>
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">{user?.email}</p>
        </div>

        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? "bg-white text-gray-900 border border-gray-200 font-semibold shadow-2xs"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
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
        className="mt-6 w-full px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-rose-600 text-xs font-semibold transition text-left flex items-center justify-between cursor-pointer shadow-2xs"
      >
        <span>Logout</span>
        <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </aside>
  );
}