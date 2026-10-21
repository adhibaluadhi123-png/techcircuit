"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public intro and authentication pages have NO sidebar
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/intro";

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-[#FFFBF7] text-[#201815] flex flex-col">
        {children}
      </div>
    );
  }

  // Internal workspace pages render inside the persistent sidebar layout
  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#201815] flex">
      <Sidebar />
      <main className="flex-1 lg:pl-64 min-w-0 flex flex-col min-h-screen">
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
