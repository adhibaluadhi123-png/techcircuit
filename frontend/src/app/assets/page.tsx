"use client";

import React, { useState } from "react";
import {
  Palette,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  Sliders,
  Copy,
  Check
} from "lucide-react";

const PALETTE = [
  { name: "Main Background", hex: "#FFF9F3", role: "Primary canvas background" },
  { name: "Surface & Cards", hex: "#FFFFFF", role: "Content cards and modules" },
  { name: "Primary Accent", hex: "#F5A66B", role: "Highlights and subtle badges" },
  { name: "Strong Accent", hex: "#C87539", role: "Interactive buttons and callouts" },
  { name: "Main Typography", hex: "#382A20", role: "Headings and readable body copy" },
  { name: "Muted Typography", hex: "#8A7567", role: "Labels, subtitles, and captions" },
  { name: "Border Warmth", hex: "#F1E1D4", role: "Subtle structural boundaries" },
  { name: "Soft Warning Surface", hex: "#FFF0E2", role: "Advisory and attention panels" },
];

export default function AssetLibraryPage() {
  const [fgHex, setFgHex] = useState("#382A20");
  const [bgHex, setBgHex] = useState("#FFF9F3");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // WCAG contrast calculation
  const getLuminance = (hex: string) => {
    const clean = hex.replace("#", "");
    const rgb = [
      parseInt(clean.substr(0, 2), 16) / 255,
      parseInt(clean.substr(2, 2), 16) / 255,
      parseInt(clean.substr(4, 2), 16) / 255,
    ];
    const a = rgb.map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrast = (hex1: string, hex2: string) => {
    try {
      const l1 = getLuminance(hex1);
      const l2 = getLuminance(hex2);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      return Math.round(ratio * 100) / 100;
    } catch {
      return 1.0;
    }
  };

  const contrastRatio = getContrast(fgHex, bgHex);
  const passesNormal = contrastRatio >= 4.5;
  const passesLarge = contrastRatio >= 3.0;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#382A20]">
          Asset Library & Brand Visual Standards
        </h1>
        <p className="text-sm text-[#8A7567] mt-1">
          Editorial color palette, logo safe-zones, and interactive WCAG AA accessibility contrast validator.
        </p>
      </div>

      {/* Official Color Palette Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider">
          Certified Brand Palette (ApexDynamics)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PALETTE.map((color) => (
            <div key={color.hex} className="editorial-card overflow-hidden bg-white">
              <div
                className="h-20 w-full border-b border-[#F1E1D4]"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#382A20]">{color.name}</span>
                  <button
                    onClick={() => copyToClipboard(color.hex)}
                    className="text-[#8A7567] hover:text-[#C87539]"
                    title="Copy hex code"
                  >
                    {copiedHex === color.hex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-[#C87539] font-bold mt-0.5">{color.hex}</div>
                <div className="text-[11px] text-[#8A7567] mt-1">{color.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive WCAG Contrast Validator */}
      <div className="editorial-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Interactive WCAG AA Color Contrast Calculator
            </h2>
          </div>
          <span className="text-xs text-[#8A7567] font-medium">WCAG 2.1 Standard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#382A20]">Foreground Text Color</label>
              <div className="flex items-center gap-3 mt-1.5">
                <input
                  type="color"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value)}
                  className="w-10 h-10 rounded border border-[#F1E1D4] cursor-pointer"
                />
                <input
                  type="text"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value)}
                  className="editorial-input p-2 text-xs font-mono w-28 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#382A20]">Background Surface Color</label>
              <div className="flex items-center gap-3 mt-1.5">
                <input
                  type="color"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value)}
                  className="w-10 h-10 rounded border border-[#F1E1D4] cursor-pointer"
                />
                <input
                  type="text"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value)}
                  className="editorial-input p-2 text-xs font-mono w-28 uppercase"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="text-xs text-[#8A7567] pt-2">
              <span className="font-semibold text-[#382A20] block mb-1.5">Preset Tests:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setFgHex("#382A20");
                    setBgHex("#FFF9F3");
                  }}
                  className="px-2.5 py-1 rounded bg-[#FFF9F3] border border-[#F1E1D4] text-[11px] font-medium"
                >
                  Dark on Cream (Default)
                </button>
                <button
                  onClick={() => {
                    setFgHex("#C87539");
                    setBgHex("#FFFFFF");
                  }}
                  className="px-2.5 py-1 rounded bg-[#FFF9F3] border border-[#F1E1D4] text-[11px] font-medium"
                >
                  Strong Accent on White
                </button>
                <button
                  onClick={() => {
                    setFgHex("#F1E1D4");
                    setBgHex("#FFFFFF");
                  }}
                  className="px-2.5 py-1 rounded bg-[#FFF9F3] border border-[#F1E1D4] text-[11px] font-medium"
                >
                  Border on White (Low Contrast Fail)
                </button>
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div className="p-5 rounded-xl border border-[#F1E1D4] flex flex-col justify-between" style={{ backgroundColor: bgHex }}>
            <div style={{ color: fgHex }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Visual Contrast Preview
              </div>
              <p className="text-base font-bold leading-snug">
                "Consistent brand presentation fosters long-term customer trust."
              </p>
              <p className="text-xs mt-2 leading-relaxed opacity-90">
                Large and standard text rendered with exact RGB relative luminance calculations.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Contrast Ratio
                </div>
                <div className="text-2xl font-bold font-mono" style={{ color: fgHex }}>
                  {contrastRatio} : 1
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="flex items-center justify-end gap-1.5 text-xs font-bold">
                  {passesNormal ? (
                    <span className="text-emerald-700 bg-white/90 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Normal Text: PASS (AA)</span>
                    </span>
                  ) : (
                    <span className="text-red-700 bg-white/90 px-2 py-0.5 rounded border border-red-300 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Normal Text: FAIL</span>
                    </span>
                  )}
                </div>
                <div className="text-[10px] opacity-80" style={{ color: fgHex }}>
                  Requires ≥ 4.5:1 for standard body copy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
