"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Database, FileCheck2,
  AlertCircle, CheckSquare, Palette, BarChart3,
  ShieldCheck, Cpu, HelpCircle, LogOut, Menu, X,
  Sparkles, Zap, ChevronRight, Radio, Terminal, Lock
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";

const NAV_ITEMS = [
  { name: "Dashboard",          href: "/dashboard",  icon: LayoutDashboard, group: "core"    },
  { name: "Review Content",     href: "/review",     icon: FileCheck2,      group: "core", badge: "HOT" },
  { name: "Review Findings",    href: "/findings",   icon: AlertCircle,     group: "core"    },
  { name: "Approvals",          href: "/approvals",  icon: CheckSquare,     group: "core"    },
  { name: "Brand Rules",        href: "/rulebook",   icon: BookOpen,        group: "library" },
  { name: "Approved Facts",     href: "/facts",      icon: Database,        group: "library" },
  { name: "Brand Assets",       href: "/assets",     icon: Palette,         group: "library", badge: "NEW" },
  { name: "Analytics",          href: "/insights",   icon: BarChart3,       group: "intel"   },
  { name: "Audit History",      href: "/audit",      icon: ShieldCheck,     group: "intel"   },
  { name: "User Guide",         href: "/guide",      icon: HelpCircle,      group: "system"  },
  { name: "Settings",           href: "/settings",   icon: Cpu,             group: "system"  },
];

const GROUPS: Record<string, string> = {
  core:    "Review & Approvals",
  library: "Brand Guidelines",
  intel:   "Reports & History",
  system:  "Help & Settings",
};

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const syncUser = () => {
    api.getUsers()
      .then((data) => {
        const savedId    = typeof window !== "undefined" ? localStorage.getItem("canon_user_id")    : null;
        const savedName  = typeof window !== "undefined" ? localStorage.getItem("canon_user_name")  : null;
        const savedRole  = typeof window !== "undefined" ? localStorage.getItem("canon_user_role")  : null;
        const savedEmail = typeof window !== "undefined" ? localStorage.getItem("canon_user_email") : null;

        if (savedId) {
          const found = data.find((u) => u.id === savedId);
          setCurrentUser(found ?? (savedName && savedRole ? {
            id: savedId, email: savedEmail ?? "", full_name: savedName,
            role: savedRole as any, workspace_id: "ws-primary-001",
          } : null));
        } else if (data.length > 0) {
          setCurrentUser(data.find((u) => u.role === "CREATOR") ?? data[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    syncUser();
    const h = () => syncUser();
    window.addEventListener("storage", h);
    window.addEventListener("canon_user_changed", h);
    return () => { window.removeEventListener("storage", h); window.removeEventListener("canon_user_changed", h); };
  }, [pathname]);

  const handleLogout = () => {
    ["canon_token","canon_user_id","canon_user_role","canon_user_name","canon_user_email"]
      .forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("canon_user_changed"));
    window.dispatchEvent(new Event("storage"));
    setCurrentUser(null);
    router.push("/login");
  };

  /* group nav items */
  const grouped = Object.entries(GROUPS).map(([key, label]) => ({
    label,
    items: NAV_ITEMS.filter((n) => n.group === key),
  }));

  const sidebarContent = (
    <aside className="flex flex-col h-full">

      {/* ── Brand Logo ── */}
      <div className="p-5 border-b border-[#F4E2D3]">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Glowing orange icon with animated ring */}
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF8A3D] via-[#FF6A0D] to-[#E05200] flex items-center justify-center text-white shadow-lg shadow-[#FF8A3D]/40 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {/* Animated glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-[#FF8A3D]/30 blur-sm animate-pulse-subtle -z-10" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-[#201815]">CANON</span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74]">
                v2.4
              </span>
            </div>
            <p className="text-[10px] font-semibold text-[#7C6A5E] tracking-wide">
              Brand Governance Platform
            </p>
          </div>
        </Link>

        {/* Workspace status pill */}
        <div className="mt-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#FFFBF7] to-[#FFF5EC] border border-[#F4E2D3]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#201815] flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[#FF8A3D]" />
              Brand Workspace
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#027A48] opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#027A48]" />
              </span>
              LIVE
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#D95D0D] font-bold">
            <Sparkles className="w-3 h-3 text-[#FF8A3D]" />
            Zero Hallucinations Guaranteed
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {grouped.map(({ label, items }) => (
          <div key={label}>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#A49184] px-3 mb-1.5">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const isHovered = hoveredItem === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold
                      transition-all duration-200 group overflow-hidden
                      ${isActive
                        ? "bg-gradient-to-r from-[#FFF2E7] to-[#FFEAD9] text-[#D95D0D] border border-[#FDBA74] shadow-xs"
                        : "text-[#7C6A5E] hover:bg-[#FFF5EC] hover:text-[#D95D0D]"
                      }
                    `}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-[#FF8A3D] to-[#FF5F0F] shadow-sm shadow-[#FF8A3D]/50" />
                    )}

                    {/* Icon with glow on hover/active */}
                    <div className={`
                      w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                      ${isActive
                        ? "bg-[#FF8A3D]/15 shadow-xs"
                        : "group-hover:bg-[#FF8A3D]/10"
                      }
                    `}>
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-[#FF8A3D]" : "text-[#A49184] group-hover:text-[#FF8A3D]"}`}
                      />
                    </div>

                    <span className="flex-1 truncate">{item.name}</span>

                    {/* HOT badge */}
                    {"badge" in item && item.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF5F0F] text-white shadow-xs">
                        {item.badge}
                      </span>
                    )}

                    {/* Hover arrow */}
                    <ChevronRight
                      className={`w-3 h-3 shrink-0 transition-all duration-200 ${
                        (isActive || isHovered) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
                      } ${isActive ? "text-[#FF8A3D]" : "text-[#A49184]"}`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Profile Footer ── */}
      <div className="p-4 border-t border-[#F4E2D3]">
        <div
          className="p-3 rounded-2xl border mb-2.5"
          style={{ background: "linear-gradient(135deg,#FFFBF7,#FFF5EC)", borderColor: "#F4E2D3" }}
        >
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {/* Avatar with gradient */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#FF5F0F] text-white flex items-center justify-center font-black text-sm shadow-sm shadow-[#FF8A3D]/30">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#027A48] border-2 border-white" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-extrabold text-[#201815] truncate">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-[#7C6A5E] font-semibold truncate">
                  {currentUser.role.replace(/_/g, " ")}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#A49184] hover:text-[#B42318] hover:bg-[#FFF0F0] transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-xs font-bold text-[#D95D0D] hover:text-[#FF8A3D] transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign in to continue</span>
            </Link>
          )}
        </div>

        {/* Model status row */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-[#A49184] px-1">
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#FF8A3D]" />
            <span>Qwen2.5 · Local</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#027A48]" />
            <span className="text-[#027A48] font-bold">28ms</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-[#F4E2D3] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF8A3D] to-[#FF5F0F] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-black text-base text-[#201815]">CANON</span>
          <span className="text-[9px] bg-[#FFF2E7] text-[#D95D0D] font-black px-1.5 py-0.5 rounded-full border border-[#FDBA74]">v2.4</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl text-[#201815] hover:bg-[#FFF5EC] cursor-pointer transition-colors"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#201815]/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop: Fixed sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col
          bg-white/95 backdrop-blur-xl border-r border-[#F4E2D3]
          shadow-xl shadow-[#FF8A3D]/5
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
