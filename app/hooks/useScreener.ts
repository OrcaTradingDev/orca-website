import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchScreenerRows } from "@/app/api/screener";
import { queryKeys } from "@/app/lib/query/keys";
import { ScreenerPage } from "@/app/types/screener";

export const useScreener = (page = 1, pageSize = 250) => {
  return useQuery<ScreenerPage, Error>({
    // 1. Factory Key: Tracks page/pageSize so React Query caches pages independently
    queryKey: queryKeys.screener.rows(page, pageSize),

    // 2. Fetcher: Pass through the pagination arguments
    queryFn: () => fetchScreenerRows(page, pageSize),

    /* --- REAL-TIME & FRESHNESS (From Snippet 2) --- */
    
    // Ensure data is considered "old" immediately so manual refreshes always trigger a fetch
    staleTime: 0,
    
    // Automatically poll for updates every 30 seconds
    refetchInterval: 30 * 1000,
    
    // Sync data when the user returns to the tab or regains internet connection
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    
    // Fail fast on errors to avoid long "hanging" states
    retry: 1,

    /* --- UX & PAGINATION (From Snippet 1) --- */
    
    // Prevents the UI from jumping back to a loading spinner when changing pages.
    // It keeps the old data on screen until the new page arrives.
    placeholderData: keepPreviousData, 
  });
};
