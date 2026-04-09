import { DefaultOptions } from "@tanstack/react-query";

export const queryConfig: DefaultOptions = {
  queries: {
    // 1. Stale Time (30 seconds for general queries)
    // Data is considered "fresh" for 30s. If a component asks for data
    // within this window, we return the cache immediately and DO NOT call the API.
    // Why? Prevents API spam if the user switches tabs/pages quickly.
    // Note: Individual hooks can override this (like useScreener sets it to 0)
    staleTime: 30 * 1000,

    // 2. Garbage Collection Time (10 minutes)
    // If data is unused (user left the page), keep it in memory for 10m.
    gcTime: 10 * 60 * 1000,

    // 3. User Focus Refetching
    // If the user clicks another tab (e.g., Twitter) and clicks back here,
    // we IMMEDIATELY trigger a background refetch.
    refetchOnWindowFocus: true,

    // 4. Network Reconnect
    refetchOnReconnect: true,

    // 5. Retry Logic (Fail Fast)
    // Only retry a failed request once.
    retry: 1,
  },
};
