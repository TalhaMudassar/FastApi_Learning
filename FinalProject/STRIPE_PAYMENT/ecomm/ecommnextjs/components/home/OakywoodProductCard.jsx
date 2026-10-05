"use client";

import React, { useState } from "react";
import Link from "next/link";

/**
 * Luxury Hardware Product Card for Aura Studio
 * - High-end dark obsidian aesthetic
 * - Clean material pills & status badges
 * - High-definition image framing with smooth hover zoom
 * - Pakistani Rupee (Rs.) currency formatting
 * - 100% exact compatibility with existing FastAPI product props
 */
export default function OakywoodProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Format real image URL or provide high-end studio tech hardware fallback
  const rawImageUrl = product?.image_url
    ? `${baseUrl}/${product.image_url.replace(/\\/g, "/")}`
    : null;

  const titleLower = (product?.title || "").toLowerCase();
  const catLower = (product?.categories?.[0]?.name || "").toLowerCase();

  // Authentic studio hardware photography based on item classification
  let luxuryFallback = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"; // Laptop

  if (titleLower.includes("cctv") || titleLower.includes("camera") || catLower.includes("cctv") || catLower.includes("security")) {
    luxuryFallback = "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"; // CCTV / Security Cam
  } else if (titleLower.includes("drone") || catLower.includes("drone")) {
    luxuryFallback = "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80"; // Drone
  } else if (titleLower.includes("phone") || titleLower.includes("mobile") || catLower.includes("mobile")) {
    luxuryFallback = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"; // Mobile Phone
  } else if (titleLower.includes("pc") || titleLower.includes("desktop") || titleLower.includes("workstation")) {
    luxuryFallback = "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80"; // Custom PC
  }

  const displayImage = (!imgError && rawImageUrl) ? rawImageUrl : luxuryFallback;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#181c28] border border-white/10 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/40 hover:border-cyan-400/60">
      
      {/* Top Image Framing */}
      <Link href={`/product/${product.slug}`} className="block relative w-full aspect-4/3 rounded-xl overflow-hidden bg-[#11141d] mb-4 border border-white/[0.08]">
        {/* Status Pill Badge */}
        <div className="absolute top-3 left-3 z-10">
          {product.stock_quantity > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#11141d]/90 text-cyan-300 shadow-sm backdrop-blur-md border border-cyan-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>In Stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#11141d]/90 text-slate-400 border border-white/10 shadow-sm">
              Custom Order
            </span>
          )}
        </div>

        {/* Product Image with Smooth Hover Expansion */}
        <img
          src={displayImage}
          alt={product.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
        />

        {/* Ambient Subtle Hover Overlay */}
        <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/[0.06] transition-colors duration-300" />
      </Link>

      {/* Body Information */}
      <div className="flex flex-col flex-grow justify-between">
        <div>
          {/* Category / Material Tag */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold tracking-wider uppercase mb-1">
            <span className="font-mono text-cyan-400 font-bold">
              {product.categories?.[0]?.name || "Hardware"}
            </span>
            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
              <svg className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.9</span>
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-bold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>

          {/* Hardware Spec Badges */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#11141d] border border-white/10 text-slate-300 font-mono font-medium">
              Verified Spec
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#11141d] border border-white/10 text-slate-300 font-medium">
              1-Yr Warranty
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block font-mono">
              Price (PKR)
            </span>
            <span className="text-base font-extrabold text-cyan-400 font-mono">
              Rs. {Number(product.price).toLocaleString()}
            </span>
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all duration-200 shadow-sm shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Inspect</span>
            <span className="text-[12px] font-black">→</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
