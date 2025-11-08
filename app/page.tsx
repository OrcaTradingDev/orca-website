// app/page.tsx
import React from "react";
import Pricing from "./components/Pricing";

export default function Page() {
  return (
    <main>
      {/* ======= Existing hero / intro / top sections ======= */}
      {/* Keep your existing content above Pricing. If you had components here, leave them as-is. */}

      {/* ======= Pricing (Beta + After V1) ======= */}
      <Pricing />

      {/* ======= Existing sections after pricing (trust, footer, etc.) ======= */}
      {/* Keep your existing content below Pricing as-is. */}
    </main>
  );
}

