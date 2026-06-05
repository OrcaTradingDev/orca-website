import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchScreenerRows } from "@/features/dashboard/services/screener";
import { queryKeys } from "@/lib/query/keys";
import { ScreenerPage } from "@/features/dashboard/types/screener";

interface UseScreenerOptions {
  autoRefresh?:    boolean;
  refreshInterval?: number; // seconds
}

export const useScreener = (
  page = 1,
  pageSize = 250,
  options?: UseScreenerOptions,
) => {
  const auto     = options?.autoRefresh    ?? true;
  const interval = options?.refreshInterval ?? 30;

  return useQuery<ScreenerPage, Error>({
    queryKey: queryKeys.screener.rows(page, pageSize),
    queryFn:  () => fetchScreenerRows(page, pageSize),

    staleTime:           0,
    refetchInterval:     auto ? interval * 1000 : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect:  true,
    retry: 1,

    placeholderData: keepPreviousData,
  });
};
