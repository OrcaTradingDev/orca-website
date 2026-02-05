import { QueryClient } from "@tanstack/react-query";
import { queryConfig } from "./options";

// Create a single instance to be used across the entire app.
// This ensures all components share the same cache.
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
