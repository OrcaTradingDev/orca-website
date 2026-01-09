# backend/app/domain/universe.py

# Canonical launch timeframes
LAUNCH_TIMEFRAMES = ["5m", "30m", "1h", "4h", "1d"]

# --- FX Majors (Twelve Data FX format handled later) ---
FX_MAJORS = [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "USDCHF",
    "USDCAD",
    "AUDUSD",
    "NZDUSD",
]

# --- Stocks (daily only for launch) ---
MAJOR_STOCKS_DAILY = [
    "AAPL", "MSFT", "AMZN", "GOOGL", "META", "NVDA", "TSLA",
    "JPM", "BAC", "XOM", "CVX", "WMT", "UNH", "JNJ", "V",
]

# --- Commodities (daily) ---
COMMODITIES_DAILY = [
    "XAUUSD",  # Gold
    "XAGUSD",  # Silver
    "WTI",     # Oil (verify provider symbol)
]

# --- Indices (optional / stretch) ---
INDICES_DAILY = [
    "US500",
    "US100",
]

