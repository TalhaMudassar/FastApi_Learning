"use client";
import { useAuth } from "@/context/AuthContext";
import AdminOnly from "@/components/AdminOnly";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AdminOnly>
      <div className="p-4">
        <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
        <p className="text-sm text-gray-600">Email: {user?.email}</p>
      </div>
    </AdminOnly>
  );
}