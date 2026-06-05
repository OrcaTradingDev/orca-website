"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserAlerts } from "@/features/dashboard/services/alerts";
import { useScreenerStore } from "@/store/screener-store";
import { useAuthStore } from "@/store/auth-store";

export const useUserAlerts = () => {
  const token         = useAuthStore((s) => s.token);
  const setAlertSymbols = useScreenerStore((s) => s.setAlertSymbols);

  const query = useQuery({
    queryKey: ["user", "alerts"],
    queryFn:  fetchUserAlerts,
    enabled:  !!token,           // only fetch when logged in
    staleTime: 60 * 1000,        // treat as fresh for 1 minute
    retry: 1,
  });

  // Sync server state into the Zustand store when the query succeeds
  useEffect(() => {
    if (query.data) {
      setAlertSymbols(query.data);
    }
  }, [query.data, setAlertSymbols]);

  return query;
};
