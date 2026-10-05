"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AdminOnly from "@/components/AdminOnly";

export default function Dashboard() {
  const { user } = useAuth();

  const adminShortcuts = [
    {
      title: "Product Inventory",
      desc: "Manage catalog, stock levels, and pricing",
      icon: "📦",
      href: "/user/product",
      badge: "Catalog",
    },
    {
      title: "Category Controls",
      desc: "Create and organize product taxonomies",
      icon: "🏷️",
      href: "/user/category",
      badge: "Taxonomy",
    },
    {
      title: "Shipping Milestones",
      desc: "Update dispatch, transit, and delivery states",
      icon: "🚚",
      href: "/user/shippingstatus",
      badge: "Fulfillment",
    },
    {
      title: "Order Log",
      desc: "View customer receipts and cancellations",
      icon: "🧾",
      href: "/user/order",
      badge: "Sales",
    },
  ];

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <AdminOnly>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
              🛡️ Superuser Panel
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Logged in as <span className="font-mono text-gray-700 font-medium">{user?.email}</span>
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-1 text-xs text-gray-500">
            <span>Privileges: <strong className="text-emerald-600">Full Administrator</strong></span>
            <span>Store Status: <strong className="text-gray-800">Online</strong></span>
          </div>
        </div>

        {/* Quick Action Navigation Tiles */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Store Administration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminShortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-100 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-50 flex items-center text-xs font-semibold text-rose-600">
                  <span>Manage</span>
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}