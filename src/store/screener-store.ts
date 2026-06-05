import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ScreenerStoreState {
  watchedSymbols: string[];
  alertSymbols: string[];
  toggleWatchlist: (symbol: string) => void;
  toggleAlert: (symbol: string) => void;
}

export const useScreenerStore = create<ScreenerStoreState>()(
  persist(
    (set) => ({
      watchedSymbols: [],
      alertSymbols: [],
      toggleWatchlist: (symbol) =>
        set((state) => ({
          watchedSymbols: state.watchedSymbols.includes(symbol)
            ? state.watchedSymbols.filter((s) => s !== symbol)
            : [...state.watchedSymbols, symbol],
        })),
      toggleAlert: (symbol) =>
        set((state) => ({
          alertSymbols: state.alertSymbols.includes(symbol)
            ? state.alertSymbols.filter((s) => s !== symbol)
            : [...state.alertSymbols, symbol],
        })),
    }),
    { name: "orca-screener-ui-state" }
  )
);
