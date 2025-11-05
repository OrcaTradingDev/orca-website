import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OrcaTrading — Automate, Analyze, Trade Smarter",
  description:
    "OrcaTrading unites automation and market analytics in one transparent ecosystem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans text-[var(--foreground)] bg-[var(--background)] antialiased">
        {children}
      </body>
    </html>
  );
}

