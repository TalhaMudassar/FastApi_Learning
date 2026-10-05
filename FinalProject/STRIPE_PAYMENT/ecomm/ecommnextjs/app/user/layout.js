import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/user/SideBar";

export default function UserLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-140px)] flex bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs my-4 text-gray-900">
        <Sidebar />
        <main role="main" className="flex-1 p-6 md:p-8 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}