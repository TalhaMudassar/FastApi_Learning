import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-100/90 via-blue-50/40 to-white border border-gray-200/90 rounded-3xl p-8 sm:p-12 md:p-14 shadow-sm my-4">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Left Column: Text & CTA */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-blue-700 shadow-2xs mb-5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Official Store • Precision Laptops, CCTV & Drones</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
            Next-Generation Tech <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-950 bg-clip-text text-transparent">
              Built for Performance
            </span>
          </h1>

          <p className="text-base text-gray-600 mb-8 max-w-lg leading-relaxed mx-auto lg:mx-0">
            Workstation laptops, enterprise 4K CCTV systems, and aerial drones. Backed by an official 1-year warranty and verified 256-bit Stripe payments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
            <Link
              href="/product"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-black active:scale-95 transition shadow-sm"
            >
              <span>Explore Products</span>
              <span className="font-bold">→</span>
            </Link>

            <Link
              href="/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-50 active:scale-95 transition"
            >
              <span>View Cart</span>
            </Link>
          </div>

          {/* Key Trust Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-gray-200/80 text-xs">
            <div>
              <p className="font-bold text-gray-900">Insured Delivery</p>
              <p className="text-gray-500 text-[11px] mt-0.5">TCS & DHL Express</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">1-Yr Warranty</p>
              <p className="text-gray-500 text-[11px] mt-0.5">Official Coverage</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Stripe Refund</p>
              <p className="text-gray-500 text-[11px] mt-0.5">Automated on Cancel</p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md lg:max-w-lg p-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-md">
            <img
              src="/hero-image.png"
              alt="Aura Studio Computing & Hardware"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;