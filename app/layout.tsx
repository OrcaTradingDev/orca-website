import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        <meta name="impact-site-verification" content="96fbbace-8eba-45b4-9413-6efb24c466ae" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-ZJR508TE6C" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ZJR508TE6C');
        `}</Script>
      </head>
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
