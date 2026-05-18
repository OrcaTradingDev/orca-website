import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/tokens.css";
import { Navbar } from "@/components/shared/Navbar";
import { Providers } from "./providers";
import { AuthGuard } from "@/features/auth";

export const metadata: Metadata = {
  title: "OrcaTrading — Automate, Analyze, Trade Smarter",
  description:
    "OrcaTrading unites automation and market analytics to give modern traders a real, measurable edge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <div className="site">
            <AuthGuard>{children}</AuthGuard>
          </div>
        </Providers>
      </body>
    </html>
  );
}
