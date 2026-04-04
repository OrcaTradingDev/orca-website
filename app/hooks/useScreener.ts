import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchScreenerRows } from "@/app/api/screener";
import { queryKeys } from "@/app/lib/query/keys";
import { ScreenerPage } from "@/app/types/screener";

export const useScreener = (page = 1, pageSize = 250) => {
  return useQuery<ScreenerPage, Error>({
    // 1. Use the Factory Key (No typos!)
    queryKey: queryKeys.screener.rows(page, pageSize),

    // 2. The Fetcher
    queryFn: () => fetchScreenerRows(page, pageSize),

    // 3. Polling (Specific to this hook)
    // Refresh every 60 seconds automatically
    refetchInterval: 30 * 1000,

    // 4. UX Polish
    // When changing pages (Page 1 -> Page 2), keep showing Page 1 data
    // until Page 2 is ready. Prevents the table from "flashing" to a loading spinner.
    placeholderData: keepPreviousData, 
  });
};
