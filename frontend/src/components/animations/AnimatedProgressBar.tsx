"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  bgColor?: string;
  height?: number;
  showValue?: boolean;
  delay?: number;
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
            <span className="font-mono text-xs font-bold text-[#D95D0D] ml-auto">
              {pct}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ backgroundColor: bgColor, height }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${width}%`,
            background: color.startsWith("linear")
              ? color
              : `linear-gradient(90deg, ${color}, #FF6A0D)`,
          }}
        />
      </div>
    </div>
  );
}
