// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrcaTrading",
  description:
    "OrcaTrading unites automation and market analytics in one transparent ecosystem.",
  metadataBase: new URL("https://tradewithorca.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Keep the viewport strict to stop zoom/overflow quirks on iOS */}
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="site">
        <main className="site__main">{children}</main>
      </body>
    </html>
  );
}

