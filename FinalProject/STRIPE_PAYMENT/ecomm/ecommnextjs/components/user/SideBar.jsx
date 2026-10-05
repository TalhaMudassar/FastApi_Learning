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
      <aside className="w-64 bg-[#141824] border-r border-white/10 min-h-screen p-5 hidden md:block">
        <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-6">User Console</h2>
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-8 bg-white/[0.05] rounded-lg w-full"></div>
          <div className="h-8 bg-white/[0.05] rounded-lg w-3/4"></div>
          <div className="h-8 bg-white/[0.05] rounded-lg w-5/6"></div>
        </div>
      </aside>
    );
  }

  const navItems = [
    ...(user?.is_admin
      ? [
          { name: "Command Center", href: "/user/dashboard" },
          { name: "Product Inventory", href: "/user/product" },
          { name: "Category Taxonomy", href: "/user/category" },
          { name: "Fulfillment Milestones", href: "/user/shippingstatus" },
        ]
      : []),
    { name: "Order History", href: "/user/order" },
    { name: "Delivery Addresses", href: "/user/address" },
    { name: "Payment Receipts", href: "/user/payments" },
  ];

  return (
    <aside className="w-64 bg-[#141824] border-r border-white/10 min-h-screen p-5 hidden md:flex flex-col justify-between">
      <div>
        <div className="mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {user?.is_admin ? "Admin Console" : "Customer Portal"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 truncate mt-1 font-mono">{user?.email}</p>
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
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-xs"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
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
        className="mt-6 w-full px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition text-left flex items-center justify-between cursor-pointer"
      >
        <span>End Session</span>
        <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </aside>
  );
}