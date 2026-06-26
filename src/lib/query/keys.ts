export const queryKeys = {
  // Domain: Screener (Market Data)
  screener: {
    // 1. Root Key
    // Use this if you want to clear/refresh ALL screener data everywhere
    all: ["screener"] as const,

    // 2. Specific Data (Rows)
    // This is a function because the key depends on the page number.
    // Example output: ["screener", "rows", 1, 50]
    rows: (page: number, pageSize: number) =>
      [...queryKeys.screener.all, "rows", page, pageSize] as const,

    // 3. Symbol Detail
    // Example output: ["screener", "detail", "EURUSD"]
    detail: (symbol: string) =>
      [...queryKeys.screener.all, "detail", symbol] as const,
  },

  // Domain: Subscription (Stripe billing state)
  subscription: {
    all: ["subscription"] as const,
    status: () => [...queryKeys.subscription.all, "status"] as const,
  },
};
