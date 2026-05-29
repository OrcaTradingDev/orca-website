# backend/app/domain/universe.py

# Canonical launch timeframes
LAUNCH_TIMEFRAMES = ["5m", "30m", "1h", "4h", "1d"]

# --- FX Majors + popular crosses ---
FX_MAJORS = [
    # Majors
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "USDCHF",
    "USDCAD",
    "AUDUSD",
    "NZDUSD",
    # Crosses (added)
    "EURJPY",
    "GBPJPY",
    "EURGBP",
    "AUDJPY",
]

# --- Stocks (daily only for launch) ---
MAJOR_STOCKS_DAILY = [
    "AMZN", "GOOGL", "META", "TSLA",
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
    "US30",
]

