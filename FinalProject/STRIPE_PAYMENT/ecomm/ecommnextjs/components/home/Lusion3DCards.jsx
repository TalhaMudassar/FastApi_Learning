"use client";

import React, { useState } from "react";
import { LaptopIcon, CctvCameraIcon, DroneIcon } from "@/components/ui/TechIcons";

function TiltCard({ title, subtitle, icon: Icon, tag, description, color = "cyan" }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const colorStyles = {
    cyan: {
      badge: "text-cyan-300 bg-cyan-950/70 border-cyan-500/30",
      iconBg: "bg-[#11141d] text-cyan-400 border-cyan-500/30",
      line: "bg-cyan-500",
      titleHover: "group-hover:text-cyan-400",
    },
    indigo: {
      badge: "text-indigo-300 bg-indigo-950/70 border-indigo-500/30",
      iconBg: "bg-[#11141d] text-indigo-400 border-indigo-500/30",
      line: "bg-indigo-500",
      titleHover: "group-hover:text-indigo-400",
    },
    purple: {
      badge: "text-purple-300 bg-purple-950/70 border-purple-500/30",
      iconBg: "bg-[#11141d] text-purple-400 border-purple-500/30",
      line: "bg-purple-500",
      titleHover: "group-hover:text-purple-400",
    },
  };

  const scheme = colorStyles[color] || colorStyles.cyan;

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calculate 3D tilt angles (max +/- 10 deg)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${
          isHovered ? 1.02 : 1
        }, ${isHovered ? 1.02 : 1}, 1)`,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        transformStyle: "preserve-3d",
      }}
      className="relative p-6 sm:p-8 rounded-2xl bg-[#181c28] border border-white/10 shadow-2xl hover:shadow-cyan-950/40 hover:border-cyan-500/50 transition-all duration-300 group overflow-hidden"
    >
      {/* Specular Highlight Glare Effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${
            (rotate.y / 10 + 1) * 50
          }% ${(-rotate.x / 10 + 1) * 50}%, rgba(6,182,212,0.15) 0%, transparent 60%)`,
        }}
      />

      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`w-11 h-11 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded-full ${scheme.badge}`}>
          {tag}
        </span>
      </div>

      <h3 className={`text-lg font-bold text-white transition-colors ${scheme.titleHover}`}>
        {title}
      </h3>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5 font-mono">
        {subtitle}
      </p>

      <p className="text-xs text-slate-300 leading-relaxed mt-3">
        {description}
      </p>

      {/* 3D Depth Indicator Line */}
      <div className={`w-8 h-0.5 rounded-full mt-5 group-hover:w-16 transition-all duration-300 ${scheme.line}`} />
    </div>
  );
}

export default function Lusion3DCards() {
  const cards = [
    {
      icon: LaptopIcon,
      color: "cyan",
      tag: "COMPUTING & SILICON",
      title: "Workstations & Laptops",
      subtitle: "Intel Core Ultra · AMD Ryzen · Apple M-Series",
      description:
        "High-density liquid-metal thermal dissipation, 240Hz calibrated color displays, and extreme NVMe PCIe Gen 5 throughput.",
    },
    {
      icon: CctvCameraIcon,
      color: "indigo",
      tag: "SURVEILLANCE & AI",
      title: "4K Enterprise CCTV Systems",
      subtitle: "Sony Starvis 2 · Infrared Night Vision NVR",
      description:
        "Continuous 24/7 high-resolution neural monitoring, optical pan-tilt-zoom, and encrypted local storage arrays with zero lag.",
    },
    {
      icon: DroneIcon,
      color: "purple",
      tag: "AERIAL & MOBILE TECH",
      title: "8K Drones & Smart Devices",
      subtitle: "LiDAR Obstacle Bypass · 45-Min Flight Telemetry",
      description:
        "Carbon-fiber composite airframes, 3-axis stabilized optical gimbals, and ultra-durable flagship mobile communication hardware.",
    },
  ];

  return (
    <section className="my-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <TiltCard key={idx} {...card} />
        ))}
      </div>
    </section>
  );
}
