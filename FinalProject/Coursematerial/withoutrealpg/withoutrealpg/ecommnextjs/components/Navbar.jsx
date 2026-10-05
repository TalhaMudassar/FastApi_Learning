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

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          🛒 MyShop
        </Link>

        <div className="space-x-4 flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "font-semibold underline"
                  : "hover:underline"
              }
            >
              {link.label}
            </Link>
          ))}

          {loading ? (
            <span className="text-gray-400 animate-pulse">Loading...</span>
          ) : user ? (
            <>
              <Link href="/user/order" className="hover:underline">
                My Orders
              </Link>
              <button
                onClick={logout}
                className="hover:underline text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="hover:underline">
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
