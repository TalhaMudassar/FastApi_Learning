"use client";

import React from "react";
import Link from "next/link";

/**
 * High-end architectural brand logo inspired by modern design studios (Oakywood / Lusion).
 * Features a precision geometric monogram and sleek typography.
 */
export default function BrandLogo({ className = "", light = false }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-3 transition ${className}`}>
      {/* 3D Geometric Vector Monogram */}
      <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/60 shadow-md shadow-indigo-950/20 group-hover:scale-105 group-hover:border-indigo-500/80 transition-all duration-300">
        <svg
          className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Isometric Cube / Prism Geometry */}
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        {/* Ambient Core Glow */}
        <div className="absolute inset-0 rounded-xl bg-indigo-500/10 blur-sm group-hover:bg-indigo-500/25 transition" />
      </div>

      {/* Typographic Wordmark */}
      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-widest text-base leading-none font-sans uppercase ${
            light ? "text-white" : "text-slate-900"
          }`}
        >
          AURA<span className="text-indigo-600 font-light ml-0.5">·</span>STUDIO
        </span>
        <span className="text-[9px] font-semibold tracking-[0.25em] text-slate-400 uppercase mt-0.5">
          Atelier & Tech
        </span>
      </div>
    </Link>
  );
}
