"use client";

import React, { useRef } from "react";

interface AnimatedGridProps {
  className?: string;
  dotColor?: string;
  glowColor?: string;
  gridSize?: number;
}

export function AnimatedGrid({
  className = "",
  dotColor = "rgba(255, 138, 61, 0.18)",
  glowColor = "rgba(255, 174, 116, 0.22)",
  gridSize = 36,
}: AnimatedGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="pale-orange-dots"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.2" fill={dotColor} />
          </pattern>
          <radialGradient id="pale-orange-center-glow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="60%" stopColor="rgba(255, 245, 236, 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#pale-orange-dots)" />
        <rect width="100%" height="100%" fill="url(#pale-orange-center-glow)" />
      </svg>

      <div
        className="absolute -top-32 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-40 animate-pulse-subtle pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255, 138, 61, 0.25) 0%, rgba(255, 174, 116, 0.05) 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-30 animate-pulse-subtle pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255, 106, 13, 0.18) 0%, rgba(255, 241, 230, 0.04) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}
