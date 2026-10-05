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
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col font-sans bg-[#11141d] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black ambient-glow">
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