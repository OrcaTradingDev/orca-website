import { QueryClient } from "@tanstack/react-query";
import { queryConfig } from "./options";

// Singleton — all components share the same cache
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
