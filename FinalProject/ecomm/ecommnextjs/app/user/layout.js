import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/user/SideBar";

export default function UserLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-140px)] flex bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <Sidebar />
        <main role="main" className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}