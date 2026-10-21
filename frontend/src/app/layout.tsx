import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "CANON | Enterprise Brand Governance Compiler",
  description: "Open-source Brand Governance Compiler. Converts brand guidelines into versioned testable rules, validates claims against evidence, and enforces No Citation, No Blocking Flag.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFF9F3] text-[#382A20]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
