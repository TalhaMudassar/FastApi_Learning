"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
      ? "text-rose-600 font-semibold"
      : "text-gray-700 hover:text-rose-600 transition";

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
          <span>🛒</span>
          <span>My<span className="text-rose-600">Shop</span></span>
        </Link>

        {/* Navigation Items */}
        <div className="space-x-5 flex items-center text-sm font-medium">
          {/* Static Public Routes */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={getLinkClasses(link.href)}
            >
              {link.label}
            </Link>
          ))}

          {/* Conditional Auth Routes */}
          {loading ? (
            <span className="text-gray-400 text-xs animate-pulse">Loading session...</span>
          ) : user ? (
            <>
              {/* Admin Dashboard link visible only to staff */}
              {user.is_admin && (
                <Link
                  href="/user/dashboard"
                  className={getLinkClasses("/user/dashboard")}
                >
                  Dashboard
                </Link>
              )}

              <Link
                href="/user/order"
                className={getLinkClasses("/user/order")}
              >
                My Orders
              </Link>

              <button
                type="button"
                onClick={logout}
                className="text-red-600 hover:text-red-700 font-semibold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={getLinkClasses("/login")}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-rose-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-rose-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;