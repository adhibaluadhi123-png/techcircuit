"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  once?: boolean;
  threshold?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = true,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggered.current || !once)) {
          triggered.current = true;
          const t = setTimeout(() => setVisible(true), delay);
          return () => clearTimeout(t);
        } else if (!entry.isIntersecting && !once) {
          setVisible(false);
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay, once, threshold]);

  const getInitialStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)`,
      willChange: "transform, opacity",
    };

    if (!visible) {
      switch (direction) {
        case "up":    return { ...base, opacity: 0, transform: "translateY(32px)" };
        case "down":  return { ...base, opacity: 0, transform: "translateY(-32px)" };
        case "left":  return { ...base, opacity: 0, transform: "translateX(32px)" };
        case "right": return { ...base, opacity: 0, transform: "translateX(-32px)" };
        case "scale": return { ...base, opacity: 0, transform: "scale(0.9)" };
        case "fade":  return { ...base, opacity: 0, transform: "none" };
      }
    }
    return { ...base, opacity: 1, transform: "none" };
  };

  return (
    <div ref={ref} className={className} style={getInitialStyle()}>
      {children}
    </div>
  );
}
