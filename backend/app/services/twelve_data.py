from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional

import httpx


# Normalize many user-friendly timeframes into TwelveData intervals
# TwelveData interval values are like: 5min, 30min, 1h, 4h, 1day
_TIMEFRAME_ALIASES: Dict[str, str] = {
    # canonical / preferred
    "5min": "5min",
    "30min": "30min",
    "1h": "1h",
    "4h": "4h",
    "1day": "1day",
    # shorthand aliases
    "5m": "5min",
    "30m": "30min",
    "60min": "1h",
    "1d": "1day",
    "daily": "1day",
    "day": "1day",
}


def _sanitize_base_url(url: str) -> str:
    u = (url or "").strip()
    if not u:
        return "https://api.twelvedata.com"
    if not re.match(r"^https?://", u):
        u = "https://" + u
    return u.rstrip("/")


def _is_fx_symbol(canonical: str) -> bool:
    # EURUSD, GBPUSD, USDJPY, etc.
    return bool(re.fullmatch(r"[A-Z]{6}", canonical))


def _to_provider_symbol(canonical: str) -> str:
    # EURUSD -> EUR/USD (required by Twelve Data for FX)
    if _is_fx_symbol(canonical):
        return canonical[:3] + "/" + canonical[3:]
    return canonical


def _parse_ts(ts: str) -> datetime:
    """
    TwelveData time_series timestamps usually come like:
      - "2025-12-31 22:04:00"
    We'll treat as UTC.
    """
    ts = ts.strip()
    # Handle possible ISO forms too
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        dt = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt


def _to_decimal(x: Any) -> Optional[Decimal]:
    if x is None:
        return None
    if isinstance(x, Decimal):
        return x
    s = str(x).strip()
    if s == "" or s.lower() == "null":
        return None
    return Decimal(s)


def _normalize_timeframe(timeframe: str) -> str:
    tf = (timeframe or "").strip().lower()
    # allow inputs like "5MIN" or " 5min "
    tf = tf.replace(" ", "")
    return _TIMEFRAME_ALIASES.get(tf, tf)


@dataclass
class TwelveDataService:
    api_key: str
    base_url: str

    def __post_init__(self) -> None:
        self.base_url = _sanitize_base_url(self.base_url)
        if not self.api_key:
            raise ValueError("Missing Twelve Data API key")

    async def fetch_ohlc(self, symbol: str, timeframe: str, limit: int = 500) -> List[Dict[str, Any]]:
        """
        Input:
          symbol: canonical (e.g. EURUSD)
          timeframe: accepts either:
            - 5min, 30min, 1h, 4h, 1day   (preferred / worker format)
            - 5m, 30m, 60min, 1d, daily   (aliases)

        Output rows:
          [{
            "timestamp": aware datetime UTC,
            "open": Decimal,
            "high": Decimal,
            "low": Decimal,
            "close": Decimal,
            "volume": Decimal|None,
          }, ...] sorted ascending by timestamp
        """
        tf_norm = _normalize_timeframe(timeframe)
        if tf_norm not in _TIMEFRAME_ALIASES:
            raise ValueError(f"Unsupported timeframe: {timeframe}")

        interval = _TIMEFRAME_ALIASES[tf_norm]

        canonical = symbol.strip().upper().replace("/", "")
        provider_symbol = _to_provider_symbol(canonical)

        params: Dict[str, Any] = {
            "symbol": provider_symbol,
            "interval": interval,
            "outputsize": int(limit),
            "apikey": self.api_key,
            "format": "JSON",
        }

        # Twelve Data expects FX requests to include exchange=FX (your earlier constraint)
        if _is_fx_symbol(canonical):
            params["exchange"] = "FX"

        url = f"{self.base_url}/time_series"

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        # TwelveData error shapes vary; normalize into a helpful exception
        if isinstance(data, dict) and data.get("status") == "error":
            raise RuntimeError(f"TwelveData error: {data.get('message') or data}")

        values = (data or {}).get("values") or []
        rows: List[Dict[str, Any]] = []

        for v in values:
            # keys usually: datetime, open, high, low, close, volume
            ts_raw = v.get("datetime") or v.get("timestamp")
            if not ts_raw:
                continue

            rows.append(
                {
                    "timestamp": _parse_ts(ts_raw),
                    "open": _to_decimal(v.get("open")) or Decimal("0"),
                    "high": _to_decimal(v.get("high")) or Decimal("0"),
                    "low": _to_decimal(v.get("low")) or Decimal("0"),
                    "close": _to_decimal(v.get("close")) or Decimal("0"),
                    "volume": _to_decimal(v.get("volume")),
                }
            )

        # TwelveData often returns newest-first; we want ascending for logs + determinism
        rows.sort(key=lambda r: r["timestamp"])
        return rows

