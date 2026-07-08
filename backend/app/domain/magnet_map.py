"""
FX Magnet Map Engine — Phase 1 (price-action structures only).

Detects unfilled Fair Value Gaps (FVGs) and prior session highs/lows from
pure OHLCV data — no volume profiles required, so this works cleanly on
spot FX where tick volume is not a reliable proxy for real traded volume.

Each detected structure is a "magnet": a price zone the market has an
observable tendency to return to. The engine finds them, checks which have
already been filled (price re-entered the zone), and returns only the live
unfilled ones for storage.

Structure types:
  fvg_bull  — Bullish imbalance (gap up, zone below current price if unfilled)
  fvg_bear  — Bearish imbalance (gap down, zone above current price if unfilled)
  session_high — Prior completed session's high
  session_low  — Prior completed session's low
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple


# (open, high, low, close, timestamp) — ascending by time
Candle = Tuple[float, float, float, float, object]


@dataclass
class MagnetStructure:
    symbol: str
    timeframe: str
    structure_type: str
    price_top: float
    price_bottom: float
    formed_at: object          # datetime
    atr_distance: Optional[float]  # distance from current price to nearest edge, in ATR units
    magnitude: Optional[float]     # size of structure in ATR units


def detect_fvgs(
    candles: List[Candle],
    current_price: float,
    current_atr: float,
    min_magnitude_atr: float = 0.08,
) -> List[MagnetStructure]:
    """
    Detect unfilled Fair Value Gaps in the candle series.

    Bullish FVG: candle[i-2].high < candle[i].low
      Zone = (candle[i-2].high, candle[i].low) — an upward gap nobody traded through.
      Filled when a subsequent candle's low <= zone top (price re-enters from above).

    Bearish FVG: candle[i-2].low > candle[i].high
      Zone = (candle[i].high, candle[i-2].low) — a downward gap nobody traded through.
      Filled when a subsequent candle's high >= zone bottom (price re-enters from below).

    Structures smaller than min_magnitude_atr × ATR are ignored as noise.
    """
    if len(candles) < 3 or current_atr <= 0:
        return []

    raw: list[dict] = []
    for i in range(2, len(candles)):
        h0 = float(candles[i - 2][1])
        l0 = float(candles[i - 2][2])
        h2 = float(candles[i][1])
        l2 = float(candles[i][2])
        ts  = candles[i][4]

        # Bullish FVG
        if h0 < l2:
            gap = l2 - h0
            if gap >= min_magnitude_atr * current_atr:
                raw.append({"type": "fvg_bull", "top": l2, "bottom": h0, "formed_at": ts, "idx": i})

        # Bearish FVG
        if h2 < l0:
            gap = l0 - h2
            if gap >= min_magnitude_atr * current_atr:
                raw.append({"type": "fvg_bear", "top": l0, "bottom": h2, "formed_at": ts, "idx": i})

    # Mark filled — a structure is filled once any subsequent candle enters the zone
    unfilled: list[dict] = []
    for fvg in raw:
        filled = False
        for j in range(fvg["idx"] + 1, len(candles)):
            c = candles[j]
            if fvg["type"] == "fvg_bull" and float(c[2]) <= fvg["top"]:
                filled = True
                break
            if fvg["type"] == "fvg_bear" and float(c[1]) >= fvg["bottom"]:
                filled = True
                break
        if not filled:
            unfilled.append(fvg)

    structures: List[MagnetStructure] = []
    for fvg in unfilled:
        midpoint = (fvg["top"] + fvg["bottom"]) / 2
        if current_price >= fvg["top"]:
            # price is above the zone → downside target
            dist = (current_price - fvg["top"]) / current_atr
        elif current_price <= fvg["bottom"]:
            # price is below the zone → upside target
            dist = (fvg["bottom"] - current_price) / current_atr
        else:
            # price is inside the zone (currently filling)
            dist = 0.0

        mag = (fvg["top"] - fvg["bottom"]) / current_atr

        structures.append(MagnetStructure(
            symbol="",
            timeframe="",
            structure_type=fvg["type"],
            price_top=fvg["top"],
            price_bottom=fvg["bottom"],
            formed_at=fvg["formed_at"],
            atr_distance=round(dist, 3),
            magnitude=round(mag, 3),
        ))

    return structures


def detect_session_levels(
    daily_candles: List[Candle],
    current_price: float,
    current_atr: float,
) -> List[MagnetStructure]:
    """
    Prior completed session's high and low from 1day candles.
    These are heavily watched levels — liquidity rests just beyond them,
    making them reliable magnets regardless of volume data quality.
    Uses the second-to-last candle (last completed session).
    """
    if len(daily_candles) < 2 or current_atr <= 0:
        return []

    prev = daily_candles[-2]
    prev_high = float(prev[1])
    prev_low  = float(prev[2])
    prev_ts   = prev[4]

    structures: List[MagnetStructure] = []
    for price, stype in [(prev_high, "session_high"), (prev_low, "session_low")]:
        dist = abs(current_price - price) / current_atr
        structures.append(MagnetStructure(
            symbol="",
            timeframe="1day",
            structure_type=stype,
            price_top=price,
            price_bottom=price,
            formed_at=prev_ts,
            atr_distance=round(dist, 3),
            magnitude=0.0,
        ))

    return structures


def nearest_above_and_below(
    structures: List[MagnetStructure],
    current_price: float,
) -> tuple[Optional[MagnetStructure], Optional[MagnetStructure]]:
    """
    From a list of structures, return the single nearest one above current
    price and the single nearest one below. Used by the API to surface the
    two most actionable targets.
    """
    above = [s for s in structures if (s.price_top + s.price_bottom) / 2 > current_price]
    below = [s for s in structures if (s.price_top + s.price_bottom) / 2 <= current_price]

    nearest_up   = min(above, key=lambda s: s.atr_distance or 999) if above else None
    nearest_down = min(below, key=lambda s: s.atr_distance or 999) if below else None

    return nearest_up, nearest_down
