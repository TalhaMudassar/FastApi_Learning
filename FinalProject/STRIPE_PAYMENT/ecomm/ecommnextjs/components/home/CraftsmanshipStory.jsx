"use client";

import React from "react";
import Link from "next/link";

/**
 * Editorial Craftsmanship Section inspired by Oakywood.shop
 * Highlights natural materials, artisan joinery, and design philosophy.
 */
export default function CraftsmanshipStory() {
  return (
    <section className="my-16 bg-[#fbfbfa] border border-stone-200/90 rounded-3xl p-8 sm:p-12 lg:p-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Image Collage */}
        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80"
              alt="Artisan Woodworking Studio"
              className="w-full h-full object-cover"
            />
            {/* Ambient Material Badge */}
            <div className="absolute bottom-4 left-4 bg-stone-900/90 text-white backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Solid European Oak & Walnut</span>
            </div>
          </div>

          {/* Floating Secondary Inset Card */}
          <div className="hidden sm:block absolute -bottom-6 -right-6 w-48 p-4 rounded-xl bg-white border border-stone-200 shadow-xl text-xs space-y-1">
            <p className="font-bold text-stone-900">Hand-Polished Finish</p>
            <p className="text-stone-500 text-[11px] leading-tight">
              Natural ecological oils preserving real wood grain warmth.
            </p>
          </div>
        </div>

        {/* Right Column: Editorial Narrative */}
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-stone-200/70 text-stone-700">
            The Atelier Standard
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Designed to bring nature, order, and calm to your daily ritual.
          </h2>

          <p className="text-stone-600 text-sm leading-relaxed">
            Inspired by architectural minimalism, every piece in our collection is crafted with respect for genuine raw materials. We reject disposable plastics and imitation finishes in favor of solid hardwoods, matte metals, and ecological oils that develop character over a lifetime of use.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-stone-200/80">
              <span className="text-base mb-1 block">🌿</span>
              <h4 className="font-bold text-stone-900 text-sm">FSC®-Certified Wood</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Harvested strictly from sustainably managed European and American forests.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-stone-200/80">
              <span className="text-base mb-1 block">🛡️</span>
              <h4 className="font-bold text-stone-900 text-sm">Lifetime Craft Warranty</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Engineered with traditional joinery to endure generations of daily work.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-indigo-600 transition underline underline-offset-4"
            >
              <span>Explore All Atelier Creations</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
