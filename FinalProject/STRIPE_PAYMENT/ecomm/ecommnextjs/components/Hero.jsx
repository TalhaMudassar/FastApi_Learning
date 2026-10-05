import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-rose-100 to-rose-200 rounded-2xl overflow-hidden py-12 px-6 md:px-12 my-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Column: Text & CTA */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Welcome to <span className="text-stone-950">Aura Studio</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-lg leading-relaxed">
            High-performance workstation laptops, enterprise 4K CCTV systems, and 8K aerial drones.
          </p>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 bg-stone-950 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-cyan-700 active:scale-95 transition shadow-lg"
          >
            <span>Explore Hardware Systems →</span>
          </Link>
        </div>

        {/* Right Column: Hero Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="/hero-image.png"
            alt="Sale Banner"
            className="w-full max-w-md h-auto object-contain drop-shadow-md rounded-xl"
          />
        </div>

      </div>
    </section>
  );
};

export default Hero;