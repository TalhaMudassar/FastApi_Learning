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
      title: "Hardware Inventory",
      desc: "Manage workstation models, stock levels, pricing (PKR), and specs",
      icon: CpuChipIcon,
      href: "/user/product",
      badge: "Silicon Catalog",
      color: "cyan",
    },
    {
      title: "Category Controls",
      desc: "Configure hardware taxonomies (Laptops, 4K CCTV, Drones)",
      icon: LaptopIcon,
      href: "/user/category",
      badge: "Taxonomy",
      color: "indigo",
    },
    {
      title: "Courier & Fulfillment",
      desc: "Update TCS, Leopard, and DHL dispatch tracking milestones",
      icon: DroneIcon,
      href: "/user/shippingstatus",
      badge: "Fulfillment",
      color: "purple",
    },
    {
      title: "Order Log & Stripe Audits",
      desc: "Monitor customer orders, Stripe receipts, and automated card refunds",
      icon: ShieldStripeIcon,
      href: "/user/order",
      badge: "Stripe Sales",
      color: "emerald",
    },
  ];

  const colorMap = {
    cyan: {
      iconBg: "bg-cyan-950/60 border-cyan-500/30 text-cyan-400",
      badge: "text-cyan-300 bg-cyan-950/70 border-cyan-500/30",
      link: "text-cyan-400 group-hover:text-cyan-300",
    },
    indigo: {
      iconBg: "bg-indigo-950/60 border-indigo-500/30 text-indigo-400",
      badge: "text-indigo-300 bg-indigo-950/70 border-indigo-500/30",
      link: "text-indigo-400 group-hover:text-indigo-300",
    },
    purple: {
      iconBg: "bg-purple-950/60 border-purple-500/30 text-purple-400",
      badge: "text-purple-300 bg-purple-950/70 border-purple-500/30",
      link: "text-purple-400 group-hover:text-purple-300",
    },
    emerald: {
      iconBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      badge: "text-emerald-300 bg-emerald-950/70 border-emerald-500/30",
      link: "text-emerald-400 group-hover:text-emerald-300",
    },
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <AdminOnly>
      <div className="max-w-5xl mx-auto space-y-8 py-6">
        {/* Command Center Welcome Header */}
        <div className="bg-[#181c28] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold uppercase tracking-wider mb-3 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Superuser Command Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-mono">
              Terminal session: <span className="text-cyan-400 font-semibold">{user?.email}</span>
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold">
              ● Root Privilege Verified
            </span>
            <span className="text-slate-400 text-[11px]">
              Stripe Engine: <strong className="text-white">Active (256-Bit)</strong>
            </span>
          </div>
        </div>

        {/* Quick Action Navigation Tiles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white font-mono tracking-tight">
              Hardware Systems Administration
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              4 Subsystems Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {adminShortcuts.map((item) => {
              const Icon = item.icon;
              const styles = colorMap[item.color] || colorMap.cyan;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-[#181c28] border border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-cyan-950/30 hover:border-cyan-500/40 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${styles.iconBg} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border font-mono ${styles.badge}`}>
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-white group-hover:text-cyan-400 transition text-base">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                    <div className={`mt-6 pt-4 border-t border-white/10 flex items-center text-xs font-mono font-bold ${styles.link}`}>
                    <span>Launch Subsystem</span>
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