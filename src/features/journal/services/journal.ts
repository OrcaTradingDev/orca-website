import { http } from "@/lib/http";
import type {
  CoachingSettings,
  JournalStats,
  Trade,
  TradeCreatePayload,
  TradesPage,
  TradeUpdatePayload,
} from "../types/journal";

export interface ListTradesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  direction?: string;
  session?: string;
  status?: string;
  emotional_state?: string;
}

export const fetchTrades = async (params: ListTradesParams = {}): Promise<TradesPage> => {
  const { data } = await http.get<TradesPage>("/journal/trades", { params });
  return data;
};

export const createTrade = async (payload: TradeCreatePayload): Promise<Trade> => {
  const { data } = await http.post<Trade>("/journal/trades", payload);
  return data;
};

export const updateTrade = async (id: number, payload: TradeUpdatePayload): Promise<Trade> => {
  const { data } = await http.put<Trade>(`/journal/trades/${id}`, payload);
  return data;
};

export const deleteTrade = async (id: number): Promise<void> => {
  await http.delete(`/journal/trades/${id}`);
};

export const fetchStats = async (): Promise<JournalStats> => {
  const { data } = await http.get<JournalStats>("/journal/stats");
  return data;
};

export const fetchCoachingSettings = async (): Promise<CoachingSettings> => {
  const { data } = await http.get<CoachingSettings>("/journal/settings");
  return data;
};

export const updateCoachingSettings = async (settings: CoachingSettings): Promise<CoachingSettings> => {
  const { data } = await http.put<CoachingSettings>("/journal/settings", settings);
  return data;
};
