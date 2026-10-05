"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Hero from "@/components/Hero";
import OakywoodProductCard from "@/components/home/OakywoodProductCard";
import { LaptopIcon, CctvCameraIcon, ShieldStripeIcon } from "@/components/ui/TechIcons";

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
    <div className="space-y-12">
      {/* 1. Clean White Hero with hero-image.png */}
      <Hero />

      {/* 2. Three-Card Trust & Quality Reassurance Bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Insured Nationwide Delivery</h4>
            <p className="text-xs text-gray-500 mt-0.5">Expedited courier dispatch via TCS & DHL</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">1-Year Official Warranty</h4>
            <p className="text-xs text-gray-500 mt-0.5">Complete hardware coverage and RMA support</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <ShieldStripeIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Stripe Payment & Refunds</h4>
            <p className="text-xs text-gray-500 mt-0.5">Automated card refund on order cancellation</p>
          </div>
        </div>
      </section>

      {/* 3. Products Catalog & Category Filters */}
      <section className="space-y-8 pt-2">
        {/* Section Header & Interactive Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-blue-600 font-mono">
              Store Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">
              Featured Products
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Workstation laptops, 4K CCTV systems, and mobile gear
            </p>
          </div>

          {/* Category Filter Pills (Clean Light Aesthetic) */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Products
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("electronics")}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "electronics"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Laptops & PCs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("clothing")}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "clothing"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              CCTV & Accessories
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Electronics & Laptops Category Grid */}
            {showElectronics && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <span className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                      <LaptopIcon className="w-4 h-4" />
                    </span>
                    <span>Laptops & Computers</span>
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {electronics.length} Items Available
                  </span>
                </div>

                {electronics.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4">
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
                  <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <CctvCameraIcon className="w-4 h-4" />
                    </span>
                    <span>Surveillance, CCTV & Mobile Gear</span>
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {clothing.length} Items Available
                  </span>
                </div>

                {clothing.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4">
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
    </div>
  );
}