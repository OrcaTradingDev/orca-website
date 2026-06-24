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
    # Crosses
    "EURJPY",
    "GBPJPY",
    "EURGBP",
    "AUDJPY",
    "GBPCHF",
    "CADJPY",
    "CHFJPY",
    "NZDJPY",
    "EURAUD",
    "GBPAUD",
]

# --- Stocks ---
MAJOR_STOCKS_DAILY = [
    "AAPL", "MSFT", "NVDA", "AMZN", "GOOG", "META", "TSLA", "NFLX",
]

# --- Commodities ---
COMMODITIES_DAILY = [
    "XAUUSD",  # Gold
    "XAGUSD",  # Silver
    "XCUUSD",  # Copper
    "XPTUSD",  # Platinum
    "WTI",     # WTI Crude Oil (verify provider symbol)
    "UKOIL",   # Brent Crude Oil (verify provider symbol)
]

# --- Indices ---
INDICES_DAILY = [
    "US100",
    "US500",
    "US30",
    "GER40",  # verify provider symbol
    "UK100",  # verify provider symbol
    "JP225",  # verify provider symbol
    "EU50",   # verify provider symbol
]

