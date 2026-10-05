"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function Sidebar() {
  const pathname = usePathname();
  const {user, loading, logout } = useAuth();
  const hasMounted = useHasMounted();

  if (!hasMounted || loading) {
    return (
      <aside className="w-64 bg-white border-r min-h-screen p-4">
        <h2 className="text-xl font-bold mb-6">User Panel</h2>
        <nav className="flex flex-col gap-2 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        </nav>
      </aside>
    );
  }

  const navItems = [
    ...(user?.is_admin ? [
      { name: "Dashboard", href: "/user/dashboard" },
      { name: "Product List", href: "/user/product" },
      { name: "Category List", href: "/user/category" },
      { name: "Update Shipping Status", href: "/user/shippingstatus" },
    ]: []),
    { name: "My Orders", href: "/user/order" },
    { name: "Shipping Address", href: "/user/address" },
    { name: "Payment History", href: "/user/payments" },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:block">
      <h2 className="text-xl font-bold mb-6">User Panel</h2>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`px-4 py-2 rounded text-gray-700 hover:bg-gray-200 transition ${
                isActive ? "bg-gray-200 font-medium" : ""
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="mt-6 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
      >
        Logout
      </button>
    </aside>
  );
}
