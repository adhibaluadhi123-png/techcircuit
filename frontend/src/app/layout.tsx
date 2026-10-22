import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "FIDELIS | Enterprise Brand Governance Platform",
  description: "Open-source Brand Governance Compiler. Converts brand guidelines into versioned testable rules, validates claims against evidence, and enforces No Citation, No Blocking Flag.",
  icons: {
    icon: "/fidelis_shield.jpg",
    apple: "/fidelis_shield.jpg",
  },
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
