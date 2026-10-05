import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/user/SideBar";

export default function UserLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-140px)] flex bg-[#181c28] rounded-2xl border border-white/10 overflow-hidden shadow-2xl my-4 text-slate-100">
        <Sidebar />
        <main role="main" className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#11141d]/70">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}