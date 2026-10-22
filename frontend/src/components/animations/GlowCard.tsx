"use client";

import React, { useRef, useState } from "react";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderGlow?: string;
  intensity?: number;
}

export function GlowCard({
  children,
  className = "",
  glowColor = "rgba(255,138,61,0.22)",
  borderGlow = "rgba(255,174,116,0.5)",
  intensity = 1,
  ...props
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-2xl overflow-hidden bg-white/90 backdrop-blur-xl border transition-all duration-300 ${className}`}
      style={{
        borderColor: hovered ? borderGlow : "rgba(244,226,211,0.8)",
        boxShadow: hovered
          ? `0 0 32px -4px ${glowColor}, 0 8px 32px -8px rgba(255,138,61,0.12), inset 0 0 0 1px ${borderGlow}`
          : `0 2px 12px -4px rgba(32,24,21,0.06)`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-[inherit]"
        style={{
          opacity: hovered ? intensity : 0,
          background: `radial-gradient(500px circle at ${mouse.x}% ${mouse.y}%, ${glowColor}, transparent 60%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
