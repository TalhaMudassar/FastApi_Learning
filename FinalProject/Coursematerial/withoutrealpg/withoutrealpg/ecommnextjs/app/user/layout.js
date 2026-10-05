import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/user/Sidebar";
export default function UserLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        <Sidebar />
        <main role="main" className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
