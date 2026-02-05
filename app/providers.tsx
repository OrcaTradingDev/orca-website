"use client"; // 1. Must be a Client Component to use Context

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query/client"; // This now points to app/lib/query/client
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
