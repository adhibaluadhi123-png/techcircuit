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
  Maximize2,
  Download,
  AlertTriangle,
  Layers,
  FileCode,
  Tag,
  ShieldAlert,
  Info,
  ExternalLink,
  ChevronRight,
  ZoomIn
} from "lucide-react";

// Official Color Palette
const PALETTE = [
  { name: "Warm Canvas", hex: "#FFFBF7", role: "Primary background canvas", textDark: true },
  { name: "Pure Surface", hex: "#FFFFFF", role: "Card backgrounds and module containers", textDark: true },
  { name: "Apex Ochre", hex: "#C87539", role: "Primary brand identity signature", textDark: false },
  { name: "Apricot Glow", hex: "#FF8A3D", role: "Interactive highlights and buttons", textDark: false },
  { name: "Deep Charcoal", hex: "#201815", role: "Headings and primary brand typography", textDark: false },
  { name: "Muted Cocoa", hex: "#7C6A5E", role: "Subtitles, secondary labels, and specs", textDark: false },
  { name: "Warm Border", hex: "#F4E2D3", role: "Structural perimeters and dividers", textDark: true },
  { name: "Warning Light", hex: "#FFF0E2", role: "Advisory panels and attention surfaces", textDark: true },
];

// Product Brand Taxonomy
const PRODUCT_TAXONOMY = [
  {
    category: "Master Corporate Brand",
    name: "ApexDynamics®",
    symbol: "®",
    status: "REGISTERED",
    statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    deprecated: ["apexdynamics", "Apex Dynamics", "Apex dynamics"],
    description: "Global corporate master brand. Always capitalized in CamelCase with capital A and capital D, without internal spaces.",
    trademarkNotice: "USPTO Reg. No. 7,492,019 (Class 9 & 42)",
  },
  {
    category: "Flagship Software Engine",
    name: "Apex Core™",
    symbol: "™",
    status: "ACTIVE",
    statusClass: "bg-blue-50 text-blue-700 border-blue-200",
    deprecated: ["Apex Cloud", "Apex Platform", "ACE"],
    description: "Core high-throughput telemetry and cloud orchestration engine. Renamed from 'Apex Cloud' in 2025.",
    trademarkNotice: "Common law trademark of ApexDynamics Corp.",
  },
  {
    category: "Edge Computing Hardware",
    name: "Apex Pulse™",
    symbol: "™",
    status: "ACTIVE",
    statusClass: "bg-blue-50 text-blue-700 border-blue-200",
    deprecated: ["Apex Edge", "Pulse Module"],
    description: "Tier-1 edge compute nodes providing sub-45ms roundtrip global telemetry.",
    trademarkNotice: "Common law trademark of ApexDynamics Corp.",
  },
  {
    category: "Developer Toolchain",
    name: "Apex Studio™",
    symbol: "™",
    status: "ACTIVE",
    statusClass: "bg-blue-50 text-blue-700 border-blue-200",
    deprecated: ["Apex IDE", "DevStudio"],
    description: "Web and CLI developer workbench for real-time model verification and rule authoring.",
    trademarkNotice: "Common law trademark of ApexDynamics Corp.",
  },
  {
    category: "Industrial IoT Hardware",
    name: "Apex Sensor V2",
    symbol: "—",
    status: "HARDWARE SPEC",
    statusClass: "bg-purple-50 text-purple-700 border-purple-200",
    deprecated: ["Apex Sensor v1", "IoT Sensor 2024"],
    description: "IP68 rated telemetry sensor module designed for industrial telemetry acquisition.",
    trademarkNotice: "Hardware certification #HW-IP68-2026",
  },
];

// Logo Do's & Don'ts
const LOGO_RULES = [
  {
    title: "Clear Space Isolation",
    type: "DO",
    desc: "Maintain a clear zone around all four sides equal to the height of the primary 'A' monogram.",
    tag: "Rule LOGO-01",
  },
  {
    title: "Monochrome on Dark Finishes",
    type: "DO",
    desc: "Use the certified pure white vector mark on packaging finishes with luminance below 0.2.",
    tag: "Rule LOGO-03",
  },
  {
    title: "Never Stretch or Distort",
    type: "DONT",
    desc: "Lock the 4:1 width-to-height aspect ratio. Stretching or squashing is strictly prohibited.",
    tag: "Rule LOGO-02",
  },
  {
    title: "No Drop Shadows or 3D Bevels",
    type: "DONT",
    desc: "Do not apply drop shadows, glows, bevels, or gradient fills to the official mark.",
    tag: "Rule LOGO-02",
  },
  {
    title: "No Crowding by Other Logos",
    type: "DONT",
    desc: "Partner lockups must be separated by at least 2x the monogram width and a 1px separator.",
    tag: "Rule LOGO-01",
  },
  {
    title: "No Unauthorized Colors",
    type: "DONT",
    desc: "Never recolor the logomark in unapproved neon tints, secondary pastels, or red.",
    tag: "Rule LOGO-02",
  },
];

export default function AssetLibraryPage() {
  const [activeTab, setActiveTab] = useState<"logos" | "taxonomy" | "colors">("logos");
  const [logoTheme, setLogoTheme] = useState<"light" | "dark" | "ochre">("light");
  const [showClearspace, setShowClearspace] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // WCAG Tool State
  const [fgHex, setFgHex] = useState("#201815");
  const [bgHex, setBgHex] = useState("#FFFBF7");

  // WCAG Calculations
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

  const copyText = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  const downloadSVG = (name: string, svgContent: string) => {
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // SVG Source Code strings
  const primaryLogoSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <defs>
    <linearGradient id="apexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8A3D" />
      <stop offset="100%" stop-color="#C87539" />
    </linearGradient>
  </defs>
  <!-- Monogram A Icon -->
  <polygon points="50,15 85,85 68,85 58,64 42,64 32,85 15,85" fill="url(#apexGrad)" />
  <polygon points="50,34 45,52 55,52" fill="#FFFFFF" />
  <circle cx="50" cy="50" r="42" fill="none" stroke="#C87539" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.4" />
  <!-- Wordmark -->
  <text x="105" y="62" font-family="'Inter', sans-serif" font-size="34" font-weight="900" fill="#201815" letter-spacing="-0.5">Apex<tspan fill="#C87539">Dynamics</tspan></text>
  <!-- Registered Trademark Symbol -->
  <text x="352" y="42" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#7C6A5E">®</text>
  <text x="108" y="80" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#7C6A5E" letter-spacing="2.5">PRECISION COMPUTING &amp; TELEMETRY</text>
</svg>`;

  const monogramSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="monoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8A3D" />
      <stop offset="100%" stop-color="#C87539" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#201815" />
  <polygon points="50,20 80,80 66,80 58,62 42,62 34,80 20,80" fill="url(#monoGrad)" />
  <polygon points="50,38 45,52 55,52" fill="#201815" />
</svg>`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74] uppercase tracking-wide">
              Official Brand Kit
            </span>
            <span className="text-xs text-[#7C6A5E] font-semibold">ApexDynamics System Standards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#201815]">
            Brand Assets, Logos & Taxonomy Studio
          </h1>
          <p className="text-sm text-[#7C6A5E] mt-1 max-w-2xl">
            Vector logos, clearspace isolation boundaries, product naming architecture, and certified color standards for packaging, hardware markings, and digital applications.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-[#F4E2D3] shadow-xs shrink-0">
          <button
            onClick={() => setActiveTab("logos")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "logos"
                ? "bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] text-white shadow-xs"
                : "text-[#7C6A5E] hover:text-[#201815] hover:bg-[#FFF5EC]"
            }`}
          >
            Logos & Clearspace
          </button>
          <button
            onClick={() => setActiveTab("taxonomy")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "taxonomy"
                ? "bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] text-white shadow-xs"
                : "text-[#7C6A5E] hover:text-[#201815] hover:bg-[#FFF5EC]"
            }`}
          >
            Product Naming
          </button>
          <button
            onClick={() => setActiveTab("colors")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "colors"
                ? "bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] text-white shadow-xs"
                : "text-[#7C6A5E] hover:text-[#201815] hover:bg-[#FFF5EC]"
            }`}
          >
            Color Palette & WCAG
          </button>
        </div>
      </div>

      {/* ─── TAB 1: LOGOS & CLEARSPACE ─── */}
      {activeTab === "logos" && (
        <div className="space-y-6">
          {/* Main Logo Display Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#F4E2D3] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4E2D3]">
              <div>
                <h2 className="text-base font-black text-[#201815] flex items-center gap-2">
                  <span>Primary Brand Lockup (Wordmark + Monogram)</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]">
                    4:1 Aspect Ratio
                  </span>
                </h2>
                <p className="text-xs text-[#7C6A5E] mt-0.5">
                  Official lockup for packaging boxes, hardware datasheets, exhibition collateral, and headers.
                </p>
              </div>

              {/* Surface Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7C6A5E]">Surface:</span>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FFF5EC] border border-[#F4E2D3]">
                  <button
                    onClick={() => setLogoTheme("light")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      logoTheme === "light" ? "bg-white text-[#201815] shadow-xs" : "text-[#7C6A5E]"
                    }`}
                  >
                    Light Canvas
                  </button>
                  <button
                    onClick={() => setLogoTheme("dark")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      logoTheme === "dark" ? "bg-[#201815] text-white shadow-xs" : "text-[#7C6A5E]"
                    }`}
                  >
                    Dark Finish
                  </button>
                  <button
                    onClick={() => setLogoTheme("ochre")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      logoTheme === "ochre" ? "bg-[#C87539] text-white shadow-xs" : "text-[#7C6A5E]"
                    }`}
                  >
                    Ochre Brand
                  </button>
                </div>

                <button
                  onClick={() => setShowClearspace(!showClearspace)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                    showClearspace
                      ? "bg-[#FFF0E2] text-[#D95D0D] border-[#FDBA74]"
                      : "bg-white text-[#7C6A5E] border-[#F4E2D3]"
                  }`}
                >
                  {showClearspace ? "Clearspace: ON" : "Clearspace: OFF"}
                </button>
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div
              className={`p-10 rounded-2xl flex items-center justify-center transition-colors duration-300 relative overflow-hidden ${
                logoTheme === "light"
                  ? "bg-[#FFFBF7]"
                  : logoTheme === "dark"
                  ? "bg-[#161210]"
                  : "bg-[#C87539]"
              }`}
            >
              {/* Clearspace boundary overlay */}
              {showClearspace && (
                <div className="absolute inset-4 border-2 border-dashed border-[#FF8A3D]/50 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between text-[10px] font-mono text-[#D95D0D] font-bold">
                    <span>1x 'A' Clear Margin</span>
                    <span>Safe Zone Boundary (Rule LOGO-01)</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#D95D0D] font-bold">
                    <span>Minimum 24px digital / 12mm print</span>
                    <span>1x 'A' Clear Margin</span>
                  </div>
                </div>
              )}

              {/* Vector Logo Render */}
              <div className="max-w-md w-full relative z-10 py-6">
                <svg viewBox="0 0 400 100" className="w-full h-auto drop-shadow-xs">
                  <defs>
                    <linearGradient id="canvasApexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF8A3D" />
                      <stop offset="100%" stopColor="#C87539" />
                    </linearGradient>
                  </defs>
                  {/* Monogram A */}
                  <polygon
                    points="50,15 85,85 68,85 58,64 42,64 32,85 15,85"
                    fill={logoTheme === "dark" ? "url(#canvasApexGrad)" : "#C87539"}
                  />
                  <polygon
                    points="50,34 45,52 55,52"
                    fill={logoTheme === "light" ? "#FFFBF7" : logoTheme === "dark" ? "#161210" : "#FFFFFF"}
                  />
                  {/* Wordmark */}
                  <text
                    x="105"
                    y="62"
                    fontFamily="'Inter', sans-serif"
                    fontSize="34"
                    fontWeight="900"
                    fill={logoTheme === "light" ? "#201815" : "#FFFFFF"}
                    letterSpacing="-0.5"
                  >
                    Apex<tspan fill="#FF8A3D">Dynamics</tspan>
                  </text>
                  {/* Registered Trademark symbol */}
                  <text
                    x="352"
                    y="42"
                    fontFamily="'Inter', sans-serif"
                    fontSize="14"
                    fontWeight="800"
                    fill={logoTheme === "light" ? "#7C6A5E" : "#F4E2D3"}
                  >
                    ®
                  </text>
                  <text
                    x="108"
                    y="80"
                    fontFamily="'Inter', sans-serif"
                    fontSize="9"
                    fontWeight="700"
                    fill={logoTheme === "light" ? "#7C6A5E" : "#F4E2D3"}
                    letterSpacing="2.5"
                  >
                    PRECISION COMPUTING &amp; TELEMETRY
                  </text>
                </svg>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-[#7C6A5E]">
                <span className="font-bold text-[#201815]">Formats:</span>
                <span className="bg-[#FFF5EC] px-2 py-0.5 rounded-lg border border-[#F4E2D3] font-mono">SVG (Vector)</span>
                <span className="bg-[#FFF5EC] px-2 py-0.5 rounded-lg border border-[#F4E2D3] font-mono">PNG (Transparent)</span>
                <span className="bg-[#FFF5EC] px-2 py-0.5 rounded-lg border border-[#F4E2D3] font-mono">EPS / PDF</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyText(primaryLogoSVG, "Primary Logo SVG")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF5EC] text-[#201815] text-xs font-bold border border-[#F4E2D3] transition-all shadow-xs"
                >
                  {copiedToken === "Primary Logo SVG" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#7C6A5E]" />
                  )}
                  <span>{copiedToken === "Primary Logo SVG" ? "Copied SVG!" : "Copy SVG Code"}</span>
                </button>
                <button
                  onClick={() => downloadSVG("ApexDynamics_Horizontal_Lockup", primaryLogoSVG)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] text-white text-xs font-extrabold transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Marks: Icon Monogram & Wordmark Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monogram App Icon */}
            <div className="p-5 rounded-2xl bg-white border border-[#F4E2D3] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#201815]">Monogram 'A' Icon</h3>
                  <p className="text-xs text-[#7C6A5E]">Hardware badge, app icon & favicon (1:1 aspect)</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74]">
                  1:1 Ratio
                </span>
              </div>

              <div className="h-36 rounded-xl bg-[#FFFBF7] flex items-center justify-center p-4 border border-[#F4E2D3]">
                <div className="w-20 h-20 shadow-md rounded-2xl overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect width="100" height="100" rx="22" fill="#201815" />
                    <polygon points="50,20 80,80 66,80 58,62 42,62 34,80 20,80" fill="#FF8A3D" />
                    <polygon points="50,38 45,52 55,52" fill="#201815" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#7C6A5E] font-medium">Min size: 16px × 16px</span>
                <button
                  onClick={() => downloadSVG("ApexDynamics_Monogram_Icon", monogramSVG)}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D95D0D] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Icon SVG</span>
                </button>
              </div>
            </div>

            {/* Inverted Monochromatic Mark */}
            <div className="p-5 rounded-2xl bg-white border border-[#F4E2D3] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#201815]">Monochrome Stamp (Laser / Silkscreen)</h3>
                  <p className="text-xs text-[#7C6A5E]">For hardware chassis engraving and 1-color cartons</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                  1-Color Only
                </span>
              </div>

              <div className="h-36 rounded-xl bg-[#1E1B18] flex items-center justify-center p-4 border border-black/20">
                <div className="max-w-xs w-full">
                  <svg viewBox="0 0 400 100" className="w-full h-auto opacity-95">
                    <polygon points="50,15 85,85 68,85 58,64 42,64 32,85 15,85" fill="#FFFFFF" />
                    <polygon points="50,34 45,52 55,52" fill="#1E1B18" />
                    <text x="105" y="62" fontFamily="'Inter', sans-serif" fontSize="34" fontWeight="900" fill="#FFFFFF" letterSpacing="-0.5">
                      ApexDynamics
                    </text>
                    <text x="352" y="42" fontFamily="'Inter', sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF">
                      ®
                    </text>
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#7C6A5E] font-medium">100% Solid White or Black</span>
                <button
                  onClick={() => copyText("ApexDynamics®", "Monochrome Copy")}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D95D0D] hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Label Text</span>
                </button>
              </div>
            </div>
          </div>

          {/* Logo Do's and Don'ts Matrix */}
          <div className="p-6 rounded-3xl bg-white border border-[#F4E2D3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#201815]">Logo Usage Directives: Do's &amp; Don'ts</h2>
                <p className="text-xs text-[#7C6A5E]">Enforced deterministically by Rule LOGO-01 and LOGO-02</p>
              </div>
              <span className="text-xs font-bold text-[#D95D0D] bg-[#FFF2E7] px-2.5 py-1 rounded-xl border border-[#FDBA74]">
                Strict Blocking Rules
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LOGO_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    rule.type === "DO"
                      ? "bg-[#EDFDF5]/50 border-[#A6F4C5] hover:bg-[#EDFDF5]"
                      : "bg-[#FFF0F0]/50 border-[#FECDCA] hover:bg-[#FFF0F0]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        rule.type === "DO"
                          ? "bg-[#027A48] text-white"
                          : "bg-[#B42318] text-white"
                      }`}
                    >
                      {rule.type === "DO" ? "✓ APPROVED PRACTICE" : "✕ STRICTLY PROHIBITED"}
                    </span>
                    <span className="text-[10px] font-bold text-[#7C6A5E] font-mono">{rule.tag}</span>
                  </div>
                  <h3 className="text-xs font-extrabold text-[#201815]">{rule.title}</h3>
                  <p className="text-[11px] text-[#7C6A5E] mt-1 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRODUCT BRAND TAXONOMY ─── */}
      {activeTab === "taxonomy" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-[#F4E2D3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] flex items-center justify-center text-[#D95D0D] shrink-0 mt-0.5">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#201815]">
                  Why does Product Naming Compliance matter?
                </h2>
                <p className="text-xs text-[#7C6A5E] leading-relaxed mt-0.5">
                  Using deprecated product names (such as "Apex Cloud") confuses customers, damages SEO equity, and creates contractual ambiguities in enterprise SLAs. CANON ensures all product references map to official catalog taxonomy.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#F4E2D3] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4E2D3]">
              <h2 className="text-base font-black text-[#201815]">
                Official Product Hierarchy Matrix (5 Certified Brands)
              </h2>
              <span className="text-xs text-[#7C6A5E]">Click any product name to copy</span>
            </div>

            <div className="divide-y divide-[#F4E2D3]">
              {PRODUCT_TAXONOMY.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#7C6A5E] uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyText(item.name, item.name)}
                        className="text-lg font-black text-[#201815] group-hover:text-[#D95D0D] transition-colors flex items-center gap-1.5"
                      >
                        <span>{item.name}</span>
                        {copiedToken === item.name ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#7C6A5E] opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#7C6A5E] leading-relaxed">{item.description}</p>
                    <div className="text-[11px] font-mono text-[#7C6A5E]">{item.trademarkNotice}</div>
                  </div>

                  {/* Deprecated Names warning pill */}
                  <div className="p-3 rounded-xl bg-[#FFF0F0] border border-[#FECDCA] lg:w-72 shrink-0">
                    <div className="text-[10px] font-extrabold text-[#B42318] flex items-center gap-1 uppercase tracking-wide">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Forbidden Aliases:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.deprecated.map((dep, dIdx) => (
                        <span key={dIdx} className="text-[11px] font-mono font-bold text-[#B42318] line-through bg-white/80 px-2 py-0.5 rounded-md border border-[#FECDCA]">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: COLORS & WCAG ─── */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          {/* Palette Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#201815] uppercase tracking-wider">
                Certified Master Palette (8 Official Tokens)
              </h2>
              <button
                onClick={() => {
                  const css = `:root {\n${PALETTE.map(c => `  --color-${c.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}: ${c.hex}; /* ${c.role} */`).join("\n")}\n}`;
                  copyText(css, "CSS Tokens");
                }}
                className="text-xs font-bold text-[#D95D0D] hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedToken === "CSS Tokens" ? "Copied CSS!" : "Export CSS Tokens"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PALETTE.map((color) => (
                <div
                  key={color.hex}
                  className="rounded-2xl overflow-hidden bg-white border border-[#F4E2D3] shadow-xs hover:shadow-md transition-all group"
                >
                  <div
                    className="h-20 w-full border-b border-[#F4E2D3] group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#201815] truncate">{color.name}</span>
                      <button
                        onClick={() => copyText(color.hex, color.hex)}
                        className="text-[#7C6A5E] hover:text-[#D95D0D] p-0.5"
                        title="Copy hex code"
                      >
                        {copiedToken === color.hex ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-[#D95D0D] font-black mt-0.5">{color.hex}</div>
                    <div className="text-[11px] text-[#7C6A5E] mt-1 line-clamp-1">{color.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive WCAG Contrast Validator */}
          <div className="p-6 rounded-3xl bg-white border border-[#F4E2D3] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4E2D3]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#D95D0D]" />
                <h2 className="text-base font-black text-[#201815]">
                  Packaging & Display Contrast Validator (WCAG AA / AAA)
                </h2>
              </div>
              <span className="text-xs text-[#7C6A5E] font-semibold">Real-Time Relative Luminance</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#201815]">Text & Logo Finish (Foreground)</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <input
                      type="color"
                      value={fgHex}
                      onChange={(e) => setFgHex(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-[#F4E2D3] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={fgHex}
                      onChange={(e) => setFgHex(e.target.value)}
                      className="p-2 text-xs font-mono font-bold w-32 uppercase rounded-xl border border-[#F4E2D3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#201815]">Chassis / Packaging Background (Surface)</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <input
                      type="color"
                      value={bgHex}
                      onChange={(e) => setBgHex(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-[#F4E2D3] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgHex}
                      onChange={(e) => setBgHex(e.target.value)}
                      className="p-2 text-xs font-mono font-bold w-32 uppercase rounded-xl border border-[#F4E2D3]"
                    />
                  </div>
                </div>

                {/* 1-Click Brand Presets */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#201815] block mb-2">
                    1-Click Certified Brand Combinations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setFgHex("#201815"); setBgHex("#FFFBF7"); }}
                      className="p-2.5 rounded-xl bg-[#FFFBF7] hover:bg-[#FFF5EC] border border-[#F4E2D3] text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-[#201815]">Charcoal on Cream Canvas</div>
                      <div className="text-[10px] text-[#027A48] font-bold">14.2:1 Ratio • AAA Flawless</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setFgHex("#C87539"); setBgHex("#FFFFFF"); }}
                      className="p-2.5 rounded-xl bg-[#FFFBF7] hover:bg-[#FFF5EC] border border-[#F4E2D3] text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-[#201815]">Apex Ochre on White</div>
                      <div className="text-[10px] text-[#027A48] font-bold">4.8:1 Ratio • AA Pass</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setFgHex("#FFFFFF"); setBgHex("#C87539"); }}
                      className="p-2.5 rounded-xl bg-[#FFFBF7] hover:bg-[#FFF5EC] border border-[#F4E2D3] text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-[#201815]">White on Apex Ochre</div>
                      <div className="text-[10px] text-[#027A48] font-bold">4.8:1 Ratio • AA Pass</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setFgHex("#F4E2D3"); setBgHex("#FFFFFF"); }}
                      className="p-2.5 rounded-xl bg-[#FFFBF7] hover:bg-[#FFF5EC] border border-[#F4E2D3] text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-[#201815]">Warm Border on White</div>
                      <div className="text-[10px] text-[#B42318] font-bold">1.2:1 Ratio • Low Contrast Fail</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Render */}
              <div
                className="p-6 rounded-2xl border border-[#F4E2D3] flex flex-col justify-between shadow-xs transition-colors duration-200"
                style={{ backgroundColor: bgHex }}
              >
                <div style={{ color: fgHex }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-Time Packaging & Label Preview</span>
                  </div>
                  <h3 className="text-xl font-black leading-snug">
                    "Apex Core™ delivers continuous telemetry with zero compromise."
                  </h3>
                  <p className="text-xs mt-3 leading-relaxed opacity-90 font-medium">
                    Rendered with strict relative luminance formula under WCAG 2.1 AA specifications. Packaging silkscreening and digital displays must satisfy this threshold.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      Calculated Contrast
                    </div>
                    <div className="text-3xl font-black font-mono" style={{ color: fgHex }}>
                      {contrastRatio} : 1
                    </div>
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <div>
                      {passesAAA ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Triple-A (AAA): Certified</span>
                        </span>
                      ) : passesNormal ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Double-A (AA): Passes Standard</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800 bg-red-100 px-3 py-1 rounded-lg border border-red-300">
                          <XCircle className="w-4 h-4 text-red-700" />
                          <span>Fail: Too Low for Production</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium opacity-80" style={{ color: fgHex }}>
                      {passesNormal ? "Approved for customer-facing materials" : "Adjust hex values to meet 4.5:1 ratio"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
