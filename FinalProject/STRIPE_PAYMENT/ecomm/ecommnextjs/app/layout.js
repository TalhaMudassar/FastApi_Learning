import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "AURA STUDIO — Precision Hardware, Laptops, 4K CCTV & Aerial Drones",
  description: "High-performance workstation computing, enterprise 4K CCTV surveillance, and 8K aerial drones with secure 256-bit Stripe checkout.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}