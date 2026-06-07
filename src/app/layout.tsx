// ============================================================
// Root Layout — wraps all pages with providers and base styles
// ============================================================

import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Industrial Copilot — AI工业销售助手",
  description:
    "面向工业自动化代理商的AI销售助手，支持施耐德与信捷产品选型、技术问答、方案推荐。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
