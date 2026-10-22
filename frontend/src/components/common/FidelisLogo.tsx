"use client";

import React from "react";
import Image from "next/image";

interface FidelisLogoProps {
  size?: number;
  showWordmark?: boolean;
  variant?: "vector" | "raster";
  className?: string;
  badgeText?: string;
}

export function FidelisLogo({
  size = 40,
  showWordmark = false,
  variant = "vector",
  className = "",
  badgeText = "BRAND GUARD",
}: FidelisLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden shadow-md shadow-[#FF8A3D]/25 transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      >
        {variant === "raster" ? (
          <Image
            src="/fidelis_shield.jpg"
            alt="FIDELIS"
            width={size}
            height={size}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="fidelisBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2A1B14" />
                <stop offset="100%" stopColor="#140D0A" />
              </linearGradient>
              <linearGradient id="fidelisShieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA057" />
                <stop offset="50%" stopColor="#E06008" />
                <stop offset="100%" stopColor="#8A2E00" />
              </linearGradient>
              <linearGradient id="fidelisGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFBA7A" />
                <stop offset="50%" stopColor="#FF7A1A" />
                <stop offset="100%" stopColor="#D94E00" />
              </linearGradient>
              <linearGradient id="fidelisGoldFacet" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD4A8" />
                <stop offset="100%" stopColor="#FF8A3D" />
              </linearGradient>
              <filter id="fidelisGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect width="100" height="100" rx="22" fill="url(#fidelisBg)" />

            <path
              d="M 50 12 L 82 23 C 82 54 68 76 50 88 C 32 76 18 54 18 23 Z"
              fill="none"
              stroke="url(#fidelisShieldBorder)"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            <path
              d="M 50 18 L 76 27 C 76 51 64 70 50 80 C 36 70 24 51 24 27 Z"
              fill="#201511"
              stroke="#4A2A1A"
              strokeWidth="1.5"
            />

            <g filter="url(#fidelisGlow)">
              <path
                d="M 36 28 L 68 28 L 64 39 L 46 39 L 46 48 L 60 48 L 56 58 L 46 58 L 46 72 L 36 72 Z"
                fill="url(#fidelisGold)"
              />
              <path
                d="M 36 28 L 68 28 L 64 33 L 46 33 L 46 48 L 60 48 L 58 53 L 46 53 L 46 72 L 41 72 L 41 33 L 36 28 Z"
                fill="url(#fidelisGoldFacet)"
                opacity="0.85"
              />
              <polygon points="68,28 72,33 64,39" fill="#FFA057" />
              <polygon points="60,48 64,52 56,58" fill="#FFA057" />
            </g>

            <circle cx="50" cy="80" r="2.5" fill="#FFA057" />
          </svg>
        )}
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg tracking-tight text-[#201815]">
              FIDELIS
            </span>
            {badgeText && (
              <span className="text-[9px] bg-[#FFF2E7] text-[#D95D0D] font-extrabold px-1.5 py-0.5 rounded-full border border-[#FDBA74]">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-[10px] font-semibold text-[#7C6A5E] tracking-wide">
            Brand Governance Platform
          </p>
        </div>
      )}
    </div>
  );
}
