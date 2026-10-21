"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shimmerColor?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
  shimmerColor = "linear-gradient(120deg, rgba(255, 138, 61, 0.25) 30%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 138, 61, 0.25) 70%)",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-[length:200%_100%] select-none ${
        disabled ? "" : "animate-shine"
      } ${className}`}
      style={{
        backgroundImage: shimmerColor,
        WebkitBackgroundClip: "text",
        animationDuration: animationDuration,
      }}
    >
      {text}
    </span>
  );
}
