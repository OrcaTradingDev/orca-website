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
  },
};
