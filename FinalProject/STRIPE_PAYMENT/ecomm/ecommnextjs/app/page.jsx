"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Lusion3DHero from "@/components/home/Lusion3DHero";
import Lusion3DCards from "@/components/home/Lusion3DCards";
import OakywoodProductCard from "@/components/home/OakywoodProductCard";
import HardwareEngineeringStory from "@/components/home/HardwareEngineeringStory";
import ReviewsRibbon from "@/components/home/ReviewsRibbon";
import { LaptopIcon, CctvCameraIcon, CpuChipIcon } from "@/components/ui/TechIcons";

export default function Home() {
  const [clothing, setClothing] = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductByCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        
        const [clothingRes, electronicsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/products?categories=clothing`),
          axios.get(`${baseUrl}/api/products?categories=electronics`),
        ]);

        setClothing(clothingRes.data.items || []);
        setElectronics(electronicsRes.data.items || []);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductByCategories();
  }, []);

  // Filtered lists based on active tab
  const showElectronics = activeTab === "all" || activeTab === "electronics";
  const showClothing = activeTab === "all" || activeTab === "clothing";

  return (
    <div className="space-y-14">
      {/* 1. Lusion.co-Inspired 3D Interactive Hero */}
      <Lusion3DHero />

      {/* 2. Lusion-Style 3D Tilt Hardware Feature Highlights */}
      <Lusion3DCards />

      {/* 3. Hardware Catalog & Category Filters */}
      <section className="space-y-8 pt-4">
        {/* Section Header & Interactive Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 font-mono">
              Hardware Laboratory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              Precision Devices & Hardware
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              High-refresh laptops, 4K CCTV optics, and aerial quadcopters engineered for extreme reliability
            </p>
          </div>

          {/* Category Filter Pills (Dark Glassmorphic) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#181c28] rounded-xl border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-cyan-400 text-black shadow-sm font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              All Hardware
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("electronics")}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "electronics"
                  ? "bg-cyan-400 text-black shadow-sm font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              Laptops & PCs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("clothing")}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "clothing"
                  ? "bg-cyan-400 text-black shadow-sm font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              CCTV & Mobile Gear
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-white/[0.04] border border-white/[0.05] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Electronics & Laptops Category Grid */}
            {showElectronics && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                      <LaptopIcon className="w-4 h-4" />
                    </span>
                    <span>High-Performance Computing & Laptops</span>
                  </h3>
                  <span className="text-xs text-stone-400 font-mono font-medium">
                    {electronics.length} Units Available
                  </span>
                </div>

                {electronics.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-4">
                    No computing units currently in inventory.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {electronics.map((product) => (
                      <OakywoodProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CCTV & Secondary Category Grid */}
            {showClothing && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">
                      <CctvCameraIcon className="w-4 h-4" />
                    </span>
                    <span>Surveillance, CCTV & Mobile Equipment</span>
                  </h3>
                  <span className="text-xs text-stone-400 font-mono font-medium">
                    {clothing.length} Units Available
                  </span>
                </div>

                {clothing.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-4">
                    No surveillance systems currently in inventory.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clothing.map((product) => (
                      <OakywoodProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Hardware Engineering & Architecture Story */}
      <HardwareEngineeringStory />

      {/* 5. Press Accolades & Verified Reviews Ribbon */}
      <ReviewsRibbon />
    </div>
  );
}