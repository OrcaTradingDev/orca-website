import { useQuery } from "@tanstack/react-query";
import { fetchSymbolDetail } from "@/features/dashboard/services/screener";
import { queryKeys } from "@/lib/query/keys";
import { SymbolDetail } from "@/features/dashboard/types/screener";

/**
 * Fetches per-timeframe breakdown and OrcaBot signals for a single symbol.
 * Only runs when a symbol is provided (modal open).
 */
export const useSymbolDetail = (symbol: string | null) => {
  return useQuery<SymbolDetail, Error>({
    queryKey: queryKeys.screener.detail(symbol ?? ""),
    queryFn: () => fetchSymbolDetail(symbol!),
    enabled: !!symbol,
    staleTime: 30 * 1000, // 30s — same cadence as screener refresh
    retry: 1,
  });
};
