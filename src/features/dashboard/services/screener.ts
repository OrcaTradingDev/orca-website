import { http } from "@/lib/http";
import { ScreenerPage, SymbolDetail } from "@/features/dashboard/types/screener";

/**
 * Fetches paginated screener rows from the backend API.
 */
export const fetchScreenerRows = async (page = 1, pageSize = 250): Promise<ScreenerPage> => {
  const response = await http.get<ScreenerPage>("/screener/rows", {
    params: { page, pageSize },
  });
  return response.data;
};

/**
 * Fetches per-timeframe detail + OrcaBot signals for a single symbol.
 */
export const fetchSymbolDetail = async (symbol: string): Promise<SymbolDetail> => {
  const response = await http.get<SymbolDetail>(`/screener/symbol/${symbol}/detail`);
  return response.data;
};
