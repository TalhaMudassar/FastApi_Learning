"use client";

import React from "react";

/**
 * Editorial Hardware Reviews & Industry Press Accolades for Aura Studio (Dark Luxury)
 */
export default function ReviewsRibbon() {
  const reviews = [
    {
      author: "Julian V.",
      role: "VFX Supervisor & Studio Lead, London",
      text: "The thermal architecture on this workstation laptop is phenomenal. Sustained dual-GPU 8K video renders without a hint of thermal throttling.",
      rating: 5,
    },
    {
      author: "Farhan A.",
      role: "Enterprise Infrastructure Director, Islamabad",
      text: "Deployed 16 of the 4K Starvis CCTV optics across our campus. Crystal clear night telemetry, local NVR encryption, and instant automated Stripe payment receipts.",
      rating: 5,
    },
    {
      author: "Marcus K.",
      role: "Aerial Cinematographer, Zurich",
      text: "The 8K carbon drone sustained 40-knot alpine wind gusts with rock-solid gimbal stabilization. Truly professional-grade hardware and fast TCS dispatch.",
      rating: 5,
    },
  ];

  return (
    <section className="my-14 border-t border-white/[0.08] pt-12">
      {/* Hardware Press Quotations */}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-stone-500 text-xs font-mono font-bold uppercase tracking-[0.2em] mb-12">
        <span>Wired Hardware</span>
        <span>•</span>
        <span>Tom&apos;s Hardware</span>
        <span>•</span>
        <span>AnandTech Pro</span>
        <span>•</span>
        <span>DPReview Lab</span>
      </div>

      {/* Customer Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#181c28] border border-white/10 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                {"★".repeat(rev.rating)}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                &ldquo;{rev.text}&rdquo;
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-white">{rev.author}</span>
              <span className="text-[11px] text-slate-400 font-mono font-medium">{rev.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
