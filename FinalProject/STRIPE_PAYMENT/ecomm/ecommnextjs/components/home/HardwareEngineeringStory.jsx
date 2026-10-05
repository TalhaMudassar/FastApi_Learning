"use client";

import React from "react";
import Link from "next/link";
import { LaptopIcon, CctvCameraIcon, DroneIcon, ShieldStripeIcon } from "@/components/ui/TechIcons";

/**
 * Hardware Engineering & Architecture Showcase for Aura Studio
 * Replaces woodcraft with heavy-duty tech hardware, thermal benchmarking, and optical precision.
 */
export default function HardwareEngineeringStory() {
  return (
    <section className="my-16 rounded-3xl bg-[#181c28] text-slate-100 p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-white/10 shadow-2xl">
      {/* Background Micro-Circuit Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #1c1917 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column: Mission & Engineering Values */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Aura Hardware Laboratory</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Engineered for Extremes.{" "}
            <span className="text-slate-400 font-light block">
              Tested for Perfection.
            </span>
          </h2>

          <p className="text-slate-300 leading-relaxed text-sm sm:text-base font-light">
            Every workstation, laptop, drone, and enterprise CCTV camera cataloged at Aura Studio 
            undergoes rigorous thermal stress tests, optical calibration, and hardware burn-in diagnostics.
            We engineer tools for developers, surveillance directors, pilots, and creative pioneers.
          </p>

          {/* Core Hardware Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-[#141824] border border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <LaptopIcon className="w-4 h-4" />
                <span className="text-2xl font-black text-white font-mono">0.05ms</span>
              </div>
              <p className="text-xs font-bold text-slate-200">Panel Latency</p>
              <p className="text-[11px] text-slate-400 mt-0.5">240Hz Factory-Calibrated IPS & OLED</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141824] border border-white/10">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <CctvCameraIcon className="w-4 h-4" />
                <span className="text-2xl font-black text-white font-mono">4K UHD</span>
              </div>
              <p className="text-xs font-bold text-slate-200">Optical Surveillance</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Sony Starvis 2 Night-Vision Sensor</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141824] border border-white/10">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <DroneIcon className="w-4 h-4" />
                <span className="text-2xl font-black text-white font-mono">8K 60fps</span>
              </div>
              <p className="text-xs font-bold text-slate-200">Aerial Gimbal</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Omnidirectional LiDAR Avoidance</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141824] border border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldStripeIcon className="w-4 h-4" />
                <span className="text-2xl font-black text-white font-mono">100%</span>
              </div>
              <p className="text-xs font-bold text-slate-200">Stripe Protected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">256-bit PCI Encrypted & Automated Refund</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>Explore Verified Hardware</span>
              <span className="text-sm font-extrabold">→</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Studio Tech Hardware Photography Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden aspect-4/5 bg-[#11141d] border border-white/10 relative group">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                alt="Workstation Laptop Architecture"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11141d]/90 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-mono font-bold text-slate-200">CNC Aluminum Chassis</span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-square bg-[#11141d] border border-white/10 relative group">
              <img
                src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80"
                alt="8K Aerial Drone Avionics"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11141d]/90 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-mono font-bold text-slate-200">Carbon Drone Avionics</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <div className="rounded-2xl overflow-hidden aspect-square bg-[#11141d] border border-white/10 relative group">
              <img
                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"
                alt="4K CCTV Surveillance Lens"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11141d]/90 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-mono font-bold text-slate-200">Sony 4K Infrared CCTV</span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-4/5 bg-[#11141d] border border-white/10 relative group">
              <img
                src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"
                alt="Flagship Mobile Devices"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11141d]/90 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-mono font-bold text-slate-200">Titanium Mobile Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
