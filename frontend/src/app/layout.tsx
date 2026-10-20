import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "CANON | Brand Governance Compiler",
  description: "Open-source Brand Governance Compiler. Converts brand guidelines into versioned testable rules, validates claims against evidence, and enforces No Citation, No Blocking Flag.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFF9F3] text-[#382A20] flex">
        <Sidebar />
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col min-h-screen">
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
