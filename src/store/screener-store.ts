import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ALL_ASSET_CLASSES = ["Forex", "Commodities", "Indices", "Crypto"];
export const ALL_TIMEFRAMES    = ["5M", "30M", "1H", "4H", "1D"];

export interface ScreenerSettings {
  enabledAssetClasses: string[];
  enabledTimeframes:   string[];
  autoRefresh:         boolean;
  refreshInterval:     number; // seconds
  emailAlerts:         boolean;
  browserAlerts:       boolean;
}

interface ScreenerStoreState extends ScreenerSettings {
  watchedSymbols: string[];
  alertSymbols:   string[];
  // Actions
  toggleWatchlist:     (symbol: string) => void;
  toggleAlert:         (symbol: string) => void;
  setScreenerSettings: (settings: Partial<ScreenerSettings>) => void;
}

export const useScreenerStore = create<ScreenerStoreState>()(
  persist(
    (set) => ({
      // Watchlist / alerts
      watchedSymbols: [],
      alertSymbols:   [],

      // Default screener settings
      enabledAssetClasses: ALL_ASSET_CLASSES,
      enabledTimeframes:   ["30M", "1H", "4H", "1D"],
      autoRefresh:         true,
      refreshInterval:     60,
      emailAlerts:         true,
      browserAlerts:       false,

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

      setScreenerSettings: (settings) =>
        set((state) => ({ ...state, ...settings })),
    }),
    { name: "orca-screener-ui-state" }
  )
);
