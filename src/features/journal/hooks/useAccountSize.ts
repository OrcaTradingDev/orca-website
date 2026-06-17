"use client";

import { useState, useEffect, useCallback } from "react";

const LS_KEY = "orca_journal_account_size";

/**
 * Persists the user's starting account balance in localStorage.
 * Used to compute PnL% per trade and to draw the Robinhood-style
 * equity curve starting at the account value.
 */
export function useAccountSize() {
  const [accountSize, setAccountSizeState] = useState<number | null>(null);

  // Hydrate from localStorage after first render (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      const n = parseFloat(stored);
      if (!isNaN(n) && n > 0) setAccountSizeState(n);
    }
  }, []);

  const setAccountSize = useCallback((n: number | null) => {
    setAccountSizeState(n);
    if (n == null || n <= 0) {
      localStorage.removeItem(LS_KEY);
    } else {
      localStorage.setItem(LS_KEY, String(n));
    }
  }, []);

  return { accountSize, setAccountSize };
}
