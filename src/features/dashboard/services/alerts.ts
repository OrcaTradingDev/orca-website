import { http } from "@/lib/http";

interface AlertListResponse {
  symbols: string[];
}

/** Fetch the current user's alert subscriptions from the backend. */
export const fetchUserAlerts = async (): Promise<string[]> => {
  const res = await http.get<AlertListResponse>("/user/alerts");
  return res.data.symbols;
};

/** Subscribe the current user to signal alerts for a symbol (idempotent). */
export const subscribeAlert = async (symbol: string): Promise<void> => {
  await http.post(`/user/alerts/${symbol}`);
};

/** Remove the current user's alert subscription for a symbol. */
export const unsubscribeAlert = async (symbol: string): Promise<void> => {
  await http.delete(`/user/alerts/${symbol}`);
};
