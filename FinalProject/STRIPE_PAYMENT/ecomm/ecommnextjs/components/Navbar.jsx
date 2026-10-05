"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/ui/BrandLogo";

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Studio" },
    { href: "/product", label: "Hardware Systems" },
    { href: "/cart", label: "Bag" },
  ];

  const getLinkClasses = (href) =>
    pathname === href
      ? "text-cyan-400 font-bold"
      : "text-stone-300 hover:text-white transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-[#11141d]/90 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="container mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
        
        {/* Luxury Brand Logo in light mode */}
        <BrandLogo light={true} />

        {/* Navigation Items */}
        <div className="flex items-center gap-6 text-xs font-semibold tracking-wide uppercase">
          {/* Static Public Routes */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={getLinkClasses(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Conditional Auth Routes */}
          {loading ? (
            <span className="text-stone-500 text-xs animate-pulse font-mono">Verifying...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* Admin Dashboard link visible only to staff */}
              {user.is_admin && (
                <Link
                  href="/user/dashboard"
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/60 text-xs transition font-mono"
                >
                  Admin Center
                </Link>
              )}

              <Link
                href="/user/order"
                className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900/80 text-stone-200 hover:border-stone-500 hover:text-white text-xs transition font-semibold"
              >
                Orders
              </Link>

              <button
                type="button"
                onClick={logout}
                className="text-stone-400 hover:text-rose-400 font-semibold transition text-xs cursor-pointer ml-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-stone-300 hover:text-white font-semibold text-xs transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-white text-stone-950 px-4 py-2 rounded-xl hover:bg-cyan-400 hover:text-black text-xs font-bold transition shadow-sm"
              >
                Join Studio
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;