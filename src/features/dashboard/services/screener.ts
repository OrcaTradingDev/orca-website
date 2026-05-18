import { http } from "@/lib/http";
import { ScreenerPage } from "@/features/dashboard/types/screener";

/**
 * Fetches paginated screener rows from the backend API.
 */
export const fetchScreenerRows = async (page = 1, pageSize = 250): Promise<ScreenerPage> => {
  const response = await http.get<ScreenerPage>("/screener/rows", {
    params: { page, pageSize },
  });
  return response.data;
};
