import Navbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "My E-commerce App",
  description: "Buy products at best prices",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
