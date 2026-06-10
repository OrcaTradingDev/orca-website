"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTrade,
  deleteTrade,
  fetchCoachingSettings,
  fetchOrcaAnalytics,
  fetchStats,
  fetchTrades,
  ListTradesParams,
  updateCoachingSettings,
  updateTrade,
} from "../services/journal";
import type { CoachingSettings, TradeCreatePayload, TradeUpdatePayload } from "../types/journal";

export const JOURNAL_KEYS = {
  trades: (params: ListTradesParams) => ["journal", "trades", params] as const,
  stats: () => ["journal", "stats"] as const,
  settings: () => ["journal", "settings"] as const,
  orcaAnalytics: () => ["journal", "orca-analytics"] as const,
};

export function useJournalTrades(params: ListTradesParams = {}) {
  return useQuery({
    queryKey: JOURNAL_KEYS.trades(params),
    queryFn: () => fetchTrades(params),
    staleTime: 30_000,
  });
}

export function useJournalStats() {
  return useQuery({
    queryKey: JOURNAL_KEYS.stats(),
    queryFn: fetchStats,
    staleTime: 30_000,
  });
}

export function useOrcaAnalytics() {
  return useQuery({
    queryKey: JOURNAL_KEYS.orcaAnalytics(),
    queryFn: fetchOrcaAnalytics,
    staleTime: 60_000,
  });
}

export function useCoachingSettings() {
  return useQuery({
    queryKey: JOURNAL_KEYS.settings(),
    queryFn: fetchCoachingSettings,
    staleTime: 60_000,
  });
}

export function useCreateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TradeCreatePayload) => createTrade(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}

export function useUpdateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TradeUpdatePayload }) =>
      updateTrade(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}

export function useDeleteTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTrade(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}

export function useUpdateCoachingSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: CoachingSettings) => updateCoachingSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: JOURNAL_KEYS.settings() });
    },
  });
}
