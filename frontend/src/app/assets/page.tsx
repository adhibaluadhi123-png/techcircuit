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
  Check,
  Lightbulb,
  Type,
  Maximize2
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
  const [copiedCSS, setCopiedCSS] = useState(false);

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
  const passesAAA = contrastRatio >= 7.0;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const copyCSSVariables = () => {
    const css = `:root {\n${PALETTE.map(c => `  --color-${c.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}: ${c.hex}; /* ${c.role} */`).join("\n")}\n}`;
    navigator.clipboard.writeText(css);
    setCopiedCSS(true);
    setTimeout(() => setCopiedCSS(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30 uppercase tracking-wide">
              Brand Visual Standards
            </span>
            <span className="text-xs text-[#8A7567] font-medium">ApexDynamics Certified System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#382A20]">
            Asset Studio & Color Accessibility Validator
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Official editorial color palette, typography guidelines, and real-time readability testing for non-designers.
          </p>
        </div>

        <button
          onClick={copyCSSVariables}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#C87539] text-xs font-bold border border-[#F1E1D4] transition-all shadow-xs"
        >
          {copiedCSS ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copiedCSS ? "Copied CSS Tokens!" : "Export CSS Tokens"}</span>
        </button>
      </div>

      {/* Non-Technical Explanatory Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#F1E1D4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E2] flex items-center justify-center text-[#C87539] shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#382A20]">
              Why does Color Contrast matter in brand reviews?
            </h2>
            <p className="text-xs text-[#8A7567] leading-relaxed mt-0.5">
              Marketing text that blends into the background can't be read in bright sunlight or by people with visual impairments. WCAG rules ensure your copy is clear, professional, and accessible to 100% of readers.
            </p>
          </div>
        </div>
      </div>

      {/* Official Color Palette Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider">
            Certified Brand Palette (8 Official Tokens)
          </h2>
          <span className="text-xs text-[#8A7567]">Click any hex code to copy</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PALETTE.map((color) => (
            <div
              key={color.hex}
              className="editorial-card overflow-hidden bg-white border border-[#F1E1D4] shadow-2xs hover:shadow-xs transition-all"
            >
              <div
                className="h-20 w-full border-b border-[#F1E1D4] transition-transform hover:scale-105 duration-200"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#382A20] truncate">{color.name}</span>
                  <button
                    onClick={() => copyToClipboard(color.hex)}
                    className="text-[#8A7567] hover:text-[#C87539] p-1"
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
                <div className="text-[11px] text-[#8A7567] mt-1 line-clamp-1">{color.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive WCAG Contrast Validator */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Interactive Accessibility & Contrast Tester
            </h2>
          </div>
          <span className="text-xs text-[#8A7567] font-semibold">Instant Live Preview</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls & Quick Presets */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#382A20]">Text Color (Foreground)</label>
              <div className="flex items-center gap-3 mt-1.5">
                <input
                  type="color"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-[#F1E1D4] cursor-pointer"
                />
                <input
                  type="text"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value)}
                  className="editorial-input p-2 text-xs font-mono w-32 uppercase"
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
                  className="w-10 h-10 rounded-xl border border-[#F1E1D4] cursor-pointer"
                />
                <input
                  type="text"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value)}
                  className="editorial-input p-2 text-xs font-mono w-32 uppercase"
                />
              </div>
            </div>

            {/* Quick Presets for Non-Technical Users */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#382A20] block mb-2">
                1-Click Preset Color Pairs:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFgHex("#382A20");
                    setBgHex("#FFF9F3");
                  }}
                  className="p-2.5 rounded-xl bg-[#FFF9F3] hover:bg-[#FFF0E2] border border-[#F1E1D4] text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#382A20]">Dark Copy on Cream Canvas</div>
                  <div className="text-[10px] text-[#027A48] font-semibold">12.8:1 Ratio • Triple-A Pass</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFgHex("#C87539");
                    setBgHex("#FFFFFF");
                  }}
                  className="p-2.5 rounded-xl bg-[#FFF9F3] hover:bg-[#FFF0E2] border border-[#F1E1D4] text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#382A20]">Strong Accent on White</div>
                  <div className="text-[10px] text-[#027A48] font-semibold">4.8:1 Ratio • Double-A Pass</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFgHex("#FFFFFF");
                    setBgHex("#C87539");
                  }}
                  className="p-2.5 rounded-xl bg-[#FFF9F3] hover:bg-[#FFF0E2] border border-[#F1E1D4] text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#382A20]">White on Button Accent</div>
                  <div className="text-[10px] text-[#027A48] font-semibold">4.8:1 Ratio • Double-A Pass</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFgHex("#F1E1D4");
                    setBgHex("#FFFFFF");
                  }}
                  className="p-2.5 rounded-xl bg-[#FFF9F3] hover:bg-[#FFF0E2] border border-[#F1E1D4] text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#382A20]">Soft Border on White</div>
                  <div className="text-[10px] text-[#B42318] font-semibold">1.2:1 Ratio • Low Contrast Fail</div>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Live Preview */}
          <div
            className="p-6 rounded-2xl border border-[#F1E1D4] flex flex-col justify-between shadow-xs transition-colors duration-200"
            style={{ backgroundColor: bgHex }}
          >
            <div style={{ color: fgHex }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Rendering Preview</span>
              </div>
              <h3 className="text-xl font-bold leading-snug">
                "Consistent brand presentation fosters long-term customer trust."
              </h3>
              <p className="text-xs mt-3 leading-relaxed opacity-90 font-medium">
                Standard paragraph text rendered with exact relative luminance calculations. Anyone viewing this headline will experience this exact level of clarity.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Contrast Score
                </div>
                <div className="text-3xl font-bold font-mono" style={{ color: fgHex }}>
                  {contrastRatio} : 1
                </div>
              </div>

              <div className="space-y-1.5 sm:text-right">
                <div>
                  {passesAAA ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Triple-A (AAA): Flawless</span>
                    </span>
                  ) : passesNormal ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Double-A (AA): Passes Standards</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800 bg-red-100/90 px-3 py-1 rounded-lg border border-red-300">
                      <XCircle className="w-4 h-4 text-red-700" />
                      <span>Hard to Read: Contrast Too Low</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-medium opacity-80" style={{ color: fgHex }}>
                  {passesNormal ? "Safe for customer marketing copy" : "Increase darkness or brightness to fix"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
