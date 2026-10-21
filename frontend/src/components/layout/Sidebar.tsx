"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Database,
  FileCheck2,
  AlertCircle,
  CheckSquare,
  Palette,
  BarChart3,
  ShieldCheck,
  Cpu,
  User,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  KeyRound,
  LogOut,
  UserCheck
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";

const NAV_ITEMS = [
  { name: "🏠 Overview", href: "/", icon: LayoutDashboard },
  { name: "📖 How to Use (Guide)", href: "/guide", icon: HelpCircle },
  { name: "✍️ Write & Check Stories", href: "/review", icon: FileCheck2 },
  { name: "🔍 Review Findings", href: "/findings", icon: AlertCircle },
  { name: "✅ Approval Stamp", href: "/approvals", icon: CheckSquare },
  { name: "📚 Company Rules", href: "/rulebook", icon: BookOpen },
  { name: "🏦 True Fact Vault", href: "/facts", icon: Database },
  { name: "🎨 Photo & Logo Library", href: "/assets", icon: Palette },
  { name: "📊 Progress Charts", href: "/insights", icon: BarChart3 },
  { name: "📜 Golden Stamp Trail", href: "/audit", icon: ShieldCheck },
  { name: "✨ Create Account", href: "/login?tab=register", icon: UserCheck },
  { name: "🔑 Sign In / Switch Role", href: "/login", icon: KeyRound },
  { name: "⚙️ AI Brain Settings", href: "/settings", icon: Cpu },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const syncUser = () => {
    api.getUsers()
      .then((data) => {
        setUsers(data);
        const savedId = typeof window !== "undefined" ? localStorage.getItem("canon_user_id") : null;
        const savedName = typeof window !== "undefined" ? localStorage.getItem("canon_user_name") : null;
        const savedRole = typeof window !== "undefined" ? localStorage.getItem("canon_user_role") : null;
        const savedEmail = typeof window !== "undefined" ? localStorage.getItem("canon_user_email") : null;

        if (savedId) {
          const found = data.find((u) => u.id === savedId);
          if (found) {
            setCurrentUser(found);
          } else if (savedName && savedRole) {
            setCurrentUser({
              id: savedId,
              email: savedEmail || "",
              full_name: savedName,
              role: savedRole as any,
              workspace_id: "ws-apexdynamics-001"
            });
          }
        } else if (data.length > 0) {
          const defaultUser = data.find((u) => u.role === "CREATOR") || data[0];
          setCurrentUser(defaultUser);
        }
      })
      .catch((err) => console.error("Error loading users:", err));
  };

  useEffect(() => {
    syncUser();

    const handleUserEvent = () => syncUser();
    window.addEventListener("storage", handleUserEvent);
    window.addEventListener("canon_user_changed", handleUserEvent);

    return () => {
      window.removeEventListener("storage", handleUserEvent);
      window.removeEventListener("canon_user_changed", handleUserEvent);
    };
  }, [pathname]);

  const handleUserChange = (u: UserType) => {
    setCurrentUser(u);
    if (typeof window !== "undefined") {
      localStorage.setItem("canon_user_id", u.id);
      localStorage.setItem("canon_user_role", u.role);
      localStorage.setItem("canon_user_name", u.full_name);
      localStorage.setItem("canon_user_email", u.email);
      window.dispatchEvent(new Event("canon_user_changed"));
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#FFFFFF] border-b border-[#F1E1D4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#F5A66B]/40 shadow-sm shrink-0">
            <img src="/mascot.jpg" alt="Archie" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-base text-[#382A20]">CANON 🦉</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-[#382A20] hover:bg-[#FFF9F3] rounded-md"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FFFFFF] border-r border-[#F1E1D4] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Logo & Tag */}
          <div className="px-5 py-4 border-b border-[#F1E1D4]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm border border-[#F5A66B]/40 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/mascot.jpg"
                  alt="Archie the Brand Owl"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-extrabold tracking-tight text-[#382A20]">CANON</h1>
                  <span className="text-[9px] bg-[#FFF0E2] text-[#C87539] font-black px-1.5 py-0.5 rounded-full border border-[#F5A66B]/30">
                    🦉 ARCHIE
                  </span>
                </div>
                <p className="text-[10px] font-bold text-[#8A7567] tracking-wide">
                  Friendly Brand Helper
                </p>
              </div>
            </Link>

            {/* Active Workspace Badge */}
            <div className="mt-3 p-2.5 rounded-2xl bg-[#FFF9F3] border border-[#F1E1D4]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#382A20] flex items-center gap-1">
                  <span>🏢</span> ApexDynamics
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]">
                  🟢 Ready
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#C87539] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#12B76A]" />
                <span>Zero False Claims Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#FFF0E2] text-[#C87539] shadow-2xs"
                      : "text-[#382A20] hover:bg-[#FFF9F3] hover:text-[#C87539]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#C87539]" : "text-[#8A7567]"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Real User Profile & Switcher */}
        <div className="p-4 border-t border-[#F1E1D4] bg-[#FFF9F3]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#8A7567] uppercase tracking-wider">
              Signed-In User
            </span>
            <div className="flex items-center gap-1.5">
              <Link
                href="/login?tab=register"
                className="text-[10px] text-[#027A48] font-bold hover:underline"
              >
                + Sign Up
              </Link>
              <span className="text-[#8A7567] text-[10px]">•</span>
              <Link
                href="/login"
                className="text-[10px] text-[#C87539] font-bold hover:underline"
              >
                Switch
              </Link>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#F1E1D4]">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0E2] border border-[#F5A66B]/30 flex items-center justify-center text-[#C87539] font-bold text-xs shrink-0">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#382A20] truncate">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-[#8A7567] font-semibold truncate">
                  {currentUser.role.replace("_", " ")}
                </div>
              </div>
            </div>
          )}

          <div className="mt-2.5 text-[10px] text-[#8A7567] flex items-center justify-between font-medium">
            <span>Inference: Qwen2.5 (Local)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Local Model Online"></span>
          </div>
        </div>
      </aside>
    </>
  );
}
