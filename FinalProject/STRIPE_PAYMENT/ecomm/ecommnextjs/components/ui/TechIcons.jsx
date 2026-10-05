import React from "react";

/**
 * Heavy-duty, industrial precision SVG icons for Aura Studio
 * Replaces cartoonish emojis with aerospace / hardware-grade vector emblems.
 */

export function CpuChipIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M8.5 1v3M12 1v3M15.5 1v3" />
      <path d="M8.5 20v3M12 20v3M15.5 20v3" />
      <path d="M20 8.5h3M20 12h3M20 15.5h3" />
      <path d="M1 8.5h3M1 12h3M1 15.5h3" />
    </svg>
  );
}

export function LaptopIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M2 18h20a1 1 0 0 1 1 1v1H1v-1a1 1 0 0 1 1-1z" />
      <line x1="10" y1="18" x2="14" y2="18" />
      <line x1="7" y1="7" x2="17" y2="7" opacity="0.3" />
    </svg>
  );
}

export function CctvCameraIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* CCTV Dome / Bullet Body */}
      <path d="M3 8l13-4 5 5-13 4-5-5z" />
      <circle cx="16" cy="6.5" r="2" fill="currentColor" fillOpacity="0.3" />
      <path d="M7 10v6l-4 4" />
      <path d="M13 14v4" />
      <path d="M2 20h6" />
      <circle cx="16" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function DroneIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Central Airframe */}
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      {/* Arms */}
      <line x1="9" y1="9" x2="4" y2="4" />
      <line x1="15" y1="9" x2="20" y2="4" />
      <line x1="9" y1="15" x2="4" y2="20" />
      <line x1="15" y1="15" x2="20" y2="20" />
      {/* Rotors */}
      <ellipse cx="4" cy="4" rx="3" ry="1.5" />
      <ellipse cx="20" cy="4" rx="3" ry="1.5" />
      <ellipse cx="4" cy="20" rx="3" ry="1.5" />
      <ellipse cx="20" cy="20" rx="3" ry="1.5" />
      {/* Optical Gimbal Eye */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function MobileIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <line x1="10" y1="5" x2="14" y2="5" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  );
}

export function ShieldStripeIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2L4 5v6.5C4 16.5 7.4 21 12 22c4.6-1 8-5.5 8-10.5V5l-8-3z" />
      <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThermalFanIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3a9 9 0 0 1 5 1.5l-3.5 5.5" />
      <path d="M21 12a9 9 0 0 1-1.5 5l-5.5-3.5" />
      <path d="M12 21a9 9 0 0 1-5-1.5l3.5-5.5" />
      <path d="M3 12a9 9 0 0 1 1.5-5l5.5 3.5" />
    </svg>
  );
}

export function ShoppingBagIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function HeavyBadge({ icon: Icon, label, color = "cyan" }) {
  const colorStyles = {
    cyan: "border-cyan-500/30 text-cyan-400 bg-cyan-950/40 shadow-cyan-950/20",
    indigo: "border-indigo-500/30 text-indigo-400 bg-indigo-950/40 shadow-indigo-950/20",
    emerald: "border-emerald-500/30 text-emerald-400 bg-emerald-950/40 shadow-emerald-950/20",
    slate: "border-slate-700 text-slate-300 bg-slate-900 shadow-slate-900/30",
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md shadow-sm ${colorStyles[color] || colorStyles.cyan}`}>
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="text-[11px] font-bold tracking-wider uppercase">{label}</span>
    </div>
  );
}
