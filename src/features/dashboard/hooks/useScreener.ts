import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchScreenerRows } from "@/features/dashboard/services/screener";
import { queryKeys } from "@/lib/query/keys";
import { ScreenerPage } from "@/features/dashboard/types/screener";

export const useScreener = (page = 1, pageSize = 250) => {
  return useQuery<ScreenerPage, Error>({
    queryKey: queryKeys.screener.rows(page, pageSize),
    queryFn: () => fetchScreenerRows(page, pageSize),

    // Always fetch fresh — screener data changes every 30s
    staleTime: 0,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,

    // Keep previous data visible while next page loads
    placeholderData: keepPreviousData,
  });
};
