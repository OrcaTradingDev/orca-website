import { http } from "@/app/lib/http"; // Import our configured instance
import { ScreenerPage } from "@/app/types/screener";

/**
 * Fetches the paginated screener rows.
 */
export const fetchScreenerRows = async (page = 1, pageSize = 250): Promise<ScreenerPage> => {
  // Axios automatically converts the response JSON into a JS Object.
  // We explicitly tell TS that the response .data is of type <ScreenerPage>
  const response = await http.get<ScreenerPage>("/screener/rows", {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
};
