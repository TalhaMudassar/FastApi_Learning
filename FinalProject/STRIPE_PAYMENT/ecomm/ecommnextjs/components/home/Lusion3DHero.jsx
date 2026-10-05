"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  CpuChipIcon,
  CctvCameraIcon,
  DroneIcon,
  ShieldStripeIcon,
  LaptopIcon,
} from "@/components/ui/TechIcons";

/**
 * 3D Interactive Hero Canvas & Layout inspired by Lusion.co
 * Implements real-time 3D rotating geometry, particle field, and mouse-depth parallax.
 */
export default function Lusion3DHero() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // 3D Nodes Definition for Floating Polyhedron (Icosahedron / Prism)
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    // Ambient floating particles
    const particles = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 500 + 100,
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.4 + 0.2,
      speedZ: Math.random() * 0.6 + 0.3,
    }));

    let angleX = 0;
    let angleY = 0;
    let targetAngleX = 0;
    let targetAngleY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / width - 0.5;
      const normY = (e.clientY - rect.top) / height - 0.5;
      targetAngleY = normX * 1.2;
      targetAngleX = -normY * 1.2;
      setMousePos({ x: normX * 30, y: normY * 30 });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Main 3D Render Loop
    const render = () => {
      // Smooth interpolation for mouse parallax
      angleX += (targetAngleX - angleX) * 0.05;
      angleY += (targetAngleY - angleY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Radial Vignette Gradient
      const grad = ctx.createRadialGradient(
        width / 2 + mousePos.x * 2,
        height / 2 + mousePos.y * 2,
        40,
        width / 2,
        height / 2,
        width * 0.7
      );
      grad.addColorStop(0, "rgba(99, 102, 241, 0.12)");
      grad.addColorStop(0.5, "rgba(79, 70, 229, 0.04)");
      grad.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Floating 3D Star/Depth Particles
      particles.forEach((p) => {
        p.z -= p.speedZ;
        if (p.z <= 10) p.z = 600;

        const fov = 350;
        const scale = fov / (fov + p.z);
        const px = width / 2 + (p.x + mousePos.x * 4) * scale;
        const py = height / 2 + (p.y + mousePos.y * 4) * scale;

        ctx.beginPath();
        ctx.arc(px, py, p.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${p.baseAlpha * scale})`;
        ctx.fill();
      });

      // 3. Render 3D Rotating Polyhedron (Lusion-style Glass Gem)
      const scaleFactor = Math.min(width, height) * 0.22;
      const rotY = angleY + performance.now() * 0.0003;
      const rotX = angleX + performance.now() * 0.0002;

      // Project vertices to 2D
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      const projected = baseVertices.map(([vx, vy, vz]) => {
        // Y rotation
        let x1 = vx * cosY - vz * sinY;
        let z1 = vx * sinY + vz * cosY;
        // X rotation
        let y2 = vy * cosX - z1 * sinX;
        let z2 = vy * sinX + z1 * cosX;

        const dist = 4.5;
        const pz = z2 + dist;
        const px = (x1 / pz) * scaleFactor + width * 0.72;
        const py = (y2 / pz) * scaleFactor + height * 0.48;
        return { x: px, y: py, z: z2 };
      });

      // Draw Polyhedron Wireframe Edges
      ctx.lineWidth = 1.25;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = baseVertices[i][0] - baseVertices[j][0];
          const dy = baseVertices[i][1] - baseVertices[j][1];
          const dz = baseVertices[i][2] - baseVertices[j][2];
          const edgeDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Connect neighboring vertices of the icosahedron (edge length is exactly 2)
          if (Math.abs(edgeDist - 2) < 0.05) {
            const avgZ = (projected[i].z + projected[j].z) / 2;
            const alpha = Math.max(0.08, Math.min(0.65, (avgZ + 1.8) / 3));

            const edgeGrad = ctx.createLinearGradient(
              projected[i].x, projected[i].y,
              projected[j].x, projected[j].y
            );
            edgeGrad.addColorStop(0, `rgba(99, 102, 241, ${alpha})`);
            edgeGrad.addColorStop(1, `rgba(168, 85, 247, ${alpha * 0.8})`);

            ctx.strokeStyle = edgeGrad;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Glowing Nodes at Vertices
      projected.forEach((p) => {
        const nodeAlpha = Math.max(0.15, (p.z + 1.8) / 3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(199, 210, 254, ${nodeAlpha})`;
        ctx.shadowColor = "rgba(99, 102, 241, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mousePos.x, mousePos.y]);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-3xl bg-[#181c28] text-white my-4 shadow-2xl border border-white/10"
      style={{ minHeight: "580px" }}
    >
      {/* 3D Canvas Background Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Decorative Grid Lines Overlay (Lusion Aesthetic) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Hero Content Container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-16 md:py-24 flex flex-col justify-between" style={{ minHeight: "580px" }}>
        
        {/* Top Eyebrow Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>2026 Hardware Architecture</span>
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline-block font-mono tracking-tight">
            Laptops · Workstations · CCTV Optics · 8K Drones
          </span>
        </div>

        {/* Main Headline & Statement */}
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] font-sans">
            Precision{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300">
              Silicon.
            </span>
            <br />
            Engineered for{" "}
            <span className="underline decoration-cyan-500/60 decoration-4 underline-offset-8">
              Peak Performance.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
            High-refresh workstation laptops, enterprise 4K CCTV surveillance, and 8K autonomous aerial drones.
            Engineered with military-spec thermal management and protected by Stripe Tier-1 PCI-DSS encryption.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/product"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Hardware</span>
              <span className="font-extrabold text-base">→</span>
            </Link>

            <Link
              href="/cart"
              className="px-6 py-3.5 rounded-xl bg-[#141824] text-slate-200 border border-white/10 hover:border-cyan-500/60 hover:bg-[#181c28] font-semibold text-sm backdrop-blur-sm transition-all cursor-pointer"
            >
              View Selected Gear
            </Link>
          </div>
        </div>

        {/* Bottom Feature Ribbon (Heavy Industrial Tech Hardware Badges) */}
        <div className="pt-12 mt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141824]/80 border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-[#11141d] border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
              <LaptopIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200 tracking-tight">Workstation Laptops</p>
              <p className="text-[10px] text-slate-400 font-mono">RTX & M-Series Silicon</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141824]/80 border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-[#11141d] border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
              <CctvCameraIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200 tracking-tight">4K CCTV Surveillance</p>
              <p className="text-[10px] text-slate-400 font-mono">Sony Starvis Optics</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141824]/80 border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-[#11141d] border border-white/10 flex items-center justify-center text-purple-400 shrink-0">
              <DroneIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200 tracking-tight">8K Aerial Drones</p>
              <p className="text-[10px] text-slate-400 font-mono">LiDAR Obstacle Bypass</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141824]/80 border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-[#11141d] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldStripeIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200 tracking-tight">Stripe 256-Bit SSL</p>
              <p className="text-[10px] text-slate-400 font-mono">Instant Refund Guarantee</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
