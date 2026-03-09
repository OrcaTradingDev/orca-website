import type { Metadata } from "next";
import "./styles/globals.css";
import "./styles/tokens.css";
import { Navbar } from "./_components/navbar";
import { Providers } from "./providers"; // <--- Import the new wrapper

export const metadata: Metadata = {
  title: "OrcaTrading — Automate, Analyze, Trade Smarter",
  description: "OrcaTrading unites automation and market analytics...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap everything inside Providers */}
        <Providers>
          <Navbar />
          <div className="site">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
