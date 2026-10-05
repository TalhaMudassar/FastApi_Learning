"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/ui/BrandLogo";

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/product", label: "Products" },
    { href: "/cart", label: "Cart" },
  ];

  const getLinkClasses = (href) =>
    pathname === href
      ? "text-blue-600 font-bold"
      : "text-gray-600 hover:text-gray-900 transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs transition-all">
      <div className="container mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
        
        {/* Luxury Brand Logo in dark wordmark */}
        <BrandLogo light={false} />

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
            <span className="text-gray-400 text-xs animate-pulse font-mono">Loading...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* Admin Dashboard link visible only to staff */}
              {user.is_admin && (
                <Link
                  href="/user/dashboard"
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs transition font-semibold"
                >
                  Admin Dashboard
                </Link>
              )}

              <Link
                href="/user/order"
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:text-black text-xs transition font-semibold shadow-2xs"
              >
                Orders
              </Link>

              <button
                type="button"
                onClick={logout}
                className="text-gray-500 hover:text-rose-600 font-semibold transition text-xs cursor-pointer ml-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-gray-700 hover:text-black font-semibold text-xs transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-black text-xs font-semibold transition shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;