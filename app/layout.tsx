// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrcaTrading — Automate, Analyze, Trade Smarter",
  description:
    "OrcaTrading unites automation and market analytics in one transparent ecosystem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="site">
          {children}
        </div>
      </body>
    </html>
  );
}

