"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedProgressBarProps {
  value: number;     // 0-100
  max?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  bgColor?: string;
  height?: number;
  showValue?: boolean;
  delay?: number;    // ms animation delay
  className?: string;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  color = "#FF8A3D",
  bgColor = "#F4E2D3",
  height = 7,
  showValue = true,
  delay = 0,
  className = "",
}: AnimatedProgressBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setTimeout(() => {
            setWidth(Math.min((value / max) * 100, 100));
          }, delay);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, max, delay]);

  const pct = Math.min((value / max) * 100, 100).toFixed(0);

  return (
    <div ref={ref} className={`space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <div>
              <span className="text-xs font-bold text-[#201815]">{label}</span>
              {sublabel && <span className="text-[11px] text-[#7C6A5E] ml-1.5">{sublabel}</span>}
            </div>
          )}
          {showValue && (
            <span className="text-xs font-black" style={{ color }}>{pct}%</span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: bgColor }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
          }}
        >
          {/* Shimmer sweep */}
          <div
            className="absolute inset-0 animate-shine"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
