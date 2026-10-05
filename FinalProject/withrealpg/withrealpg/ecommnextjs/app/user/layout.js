import ProtectedRoute from "@/components/ProtectedRoute";
import EmailVerificationSend from "@/components/user/EmailVerificationSend";
import Sidebar from "@/components/user/Sidebar";
export default function UserLayout({ children }) {
  return (
    <ProtectedRoute>
      <EmailVerificationSend />
      <div className="min-h-screen flex">
        <Sidebar />
        <main role="main" className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
