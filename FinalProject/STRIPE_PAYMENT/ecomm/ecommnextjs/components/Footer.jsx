import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";
import { LaptopIcon, CctvCameraIcon, DroneIcon, ShieldStripeIcon } from "@/components/ui/TechIcons";

const Footer = () => {
  return (
    <footer className="bg-[#11141d] text-slate-300 border-t border-white/10 pt-16 pb-12 mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info & Mission */}
          <div className="space-y-4 md:col-span-1">
            <BrandLogo light={true} />
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs mt-3">
              Official supplier of workstation laptops, enterprise 4K CCTV surveillance, 8K aerial drones, and flagship mobile technology.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-cyan-400 font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Nationwide TCS & DHL Insured Dispatch</span>
            </div>
          </div>

          {/* Store Hardware Collections */}
          <div className="space-y-2.5 text-xs">
            <p className="font-bold text-white uppercase tracking-widest text-[11px] mb-3 font-mono text-stone-400">
              Hardware Systems
            </p>
            <p>
              <Link href="/product" className="hover:text-cyan-400 transition flex items-center gap-2">
                <LaptopIcon className="w-3.5 h-3.5 text-cyan-500" />
                <span>Workstation Laptops & PCs</span>
              </Link>
            </p>
            <p>
              <Link href="/product" className="hover:text-indigo-400 transition flex items-center gap-2">
                <CctvCameraIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>4K CCTV & Neural Surveillance</span>
              </Link>
            </p>
            <p>
              <Link href="/product" className="hover:text-purple-400 transition flex items-center gap-2">
                <DroneIcon className="w-3.5 h-3.5 text-purple-500" />
                <span>8K Aerial Drones & Gimbal Optics</span>
              </Link>
            </p>
            <p>
              <Link href="/cart" className="hover:text-white transition">
                <span>View Shopping Bag</span>
              </Link>
            </p>
          </div>

          {/* Store Services & Order Tracking */}
          <div className="space-y-2.5 text-xs">
            <p className="font-bold text-white uppercase tracking-widest text-[11px] mb-3 font-mono text-stone-400">
              Client & Hardware Care
            </p>
            <p><Link href="/user/order" className="hover:text-white transition">Track Order & Live Status</Link></p>
            <p><Link href="/user/payments" className="hover:text-white transition">Payment Receipts & History</Link></p>
            <p><span className="text-stone-300 font-medium">Automated Stripe Card Refund on Cancel</span></p>
            <p><span className="text-stone-400">Official 1-Year Hardware Warranty</span></p>
            <p><span className="text-stone-400">24/7 Technical RMA Support</span></p>
          </div>

          {/* Stripe Encrypted Checkout & Payment Badges */}
          <div className="space-y-3 md:col-span-1 text-xs">
            <div className="flex items-center gap-2">
              <ShieldStripeIcon className="w-4 h-4 text-emerald-400" />
              <p className="font-bold text-white uppercase tracking-widest text-[11px] font-mono">
                Stripe Tier-1 Security
              </p>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Every checkout is processed directly via Stripe API with 256-bit AES SSL encryption. No card details touch our servers.
            </p>
            {/* Real Payment Method Badges */}
            <div className="pt-2">
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                Verified Payment Networks
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono font-bold text-[10px]">
                <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-stone-200">STRIPE</span>
                <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-stone-200">VISA</span>
                <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-stone-200">MASTERCARD</span>
                <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-stone-200">AMEX</span>
                <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-stone-200">UNIONPAY</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} AURA STUDIO Systems & Technology. All rights reserved.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="hover:text-stone-400 cursor-pointer">Hardware Warranty</span>
            <span>•</span>
            <span className="hover:text-stone-400 cursor-pointer">Stripe Security Policy</span>
            <span>•</span>
            <span className="hover:text-stone-400 cursor-pointer">Courier Delivery SLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;