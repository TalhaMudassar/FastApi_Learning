"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AdminOnly from "@/components/AdminOnly";
import {
  CpuChipIcon,
  LaptopIcon,
  DroneIcon,
  ShieldStripeIcon,
} from "@/components/ui/TechIcons";

export default function Dashboard() {
  const { user } = useAuth();

  const adminShortcuts = [
    {
      title: "Products",
      desc: "Manage product listings, inventory levels, pricing (PKR), and images",
      icon: CpuChipIcon,
      href: "/user/product",
      badge: "Inventory",
      color: "blue",
    },
    {
      title: "Categories",
      desc: "Organize catalog categories for easy customer browsing",
      icon: LaptopIcon,
      href: "/user/category",
      badge: "Taxonomy",
      color: "indigo",
    },
    {
      title: "Shipping Status",
      desc: "Track and update order fulfillment milestones (TCS / Courier)",
      icon: DroneIcon,
      href: "/user/shippingstatus",
      badge: "Fulfillment",
      color: "purple",
    },
    {
      title: "Orders & Refunds",
      desc: "Review customer orders, Stripe receipts, and automated card refunds",
      icon: ShieldStripeIcon,
      href: "/user/order",
      badge: "Stripe",
      color: "emerald",
    },
  ];

  const colorMap = {
    blue: {
      iconBg: "bg-blue-50 border-blue-100 text-blue-600",
      badge: "text-blue-700 bg-blue-50 border-blue-200",
      link: "text-blue-600 group-hover:text-blue-700",
    },
    indigo: {
      iconBg: "bg-indigo-50 border-indigo-100 text-indigo-600",
      badge: "text-indigo-700 bg-indigo-50 border-indigo-200",
      link: "text-indigo-600 group-hover:text-indigo-700",
    },
    purple: {
      iconBg: "bg-purple-50 border-purple-100 text-purple-600",
      badge: "text-purple-700 bg-purple-50 border-purple-200",
      link: "text-purple-600 group-hover:text-purple-700",
    },
    emerald: {
      iconBg: "bg-emerald-50 border-emerald-100 text-emerald-600",
      badge: "text-emerald-700 bg-emerald-50 border-emerald-200",
      link: "text-emerald-600 group-hover:text-emerald-700",
    },
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <AdminOnly>
      <div className="max-w-5xl mx-auto space-y-8 py-4 text-gray-900">
        {/* Welcome Header */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Admin Management Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Signed in as: <span className="text-gray-900 font-semibold">{user?.email}</span>
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
              ● Admin Privileges Active
            </span>
            <span className="text-gray-500 text-[11px]">
              Stripe Payments: <strong className="text-gray-900">Enabled</strong>
            </span>
          </div>
        </div>

        {/* Quick Action Navigation Tiles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Management Modules
            </h2>
            <span className="text-xs text-gray-500">
              4 Sections
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {adminShortcuts.map((item) => {
              const Icon = item.icon;
              const styles = colorMap[item.color] || colorMap.blue;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${styles.iconBg} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${styles.badge}`}>
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-base">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className={`mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-semibold ${styles.link}`}>
                    <span>Open Module</span>
                    <span className="ml-1 group-hover:translate-x-1.5 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}