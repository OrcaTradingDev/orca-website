"""
FX Magnet Map Engine — Phase 2 (price-action structures).

Structure types:
  fvg_bull     — Bullish Fair Value Gap (imbalance zone below price)
  fvg_bear     — Bearish Fair Value Gap (imbalance zone above price)
  session_high — Prior completed session's high
  session_low  — Prior completed session's low
  week_high    — Prior completed week's high
  week_low     — Prior completed week's low
  swing_high   — Recent unswept structural swing high
  swing_low    — Recent unswept structural swing low
  eqh          — Equal Highs (2+ swing highs at same level = liquidity pool)
  eql          — Equal Lows  (2+ swing lows at same level = liquidity pool)

All distances are in ATR units for cross-instrument portability.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


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
    atr_distance: Optional[float]
    magnitude: Optional[float]


# ── helpers ──────────────────────────────────────────────────────────────────

def _atr_dist(price: float, top: float, bottom: float, atr: float) -> float:
    if price >= top:
        return (price - top) / atr
    if price <= bottom:
        return (bottom - price) / atr
    return 0.0  # inside the zone


def _is_bullish(structure_type: str) -> bool:
    return structure_type in {"fvg_bull", "session_low", "week_low", "swing_low", "eql"}


# ── Fair Value Gaps ───────────────────────────────────────────────────────────

def detect_fvgs(
    candles: List[Candle],
    current_price: float,
    current_atr: float,
    min_magnitude_atr: float = 0.08,
) -> List[MagnetStructure]:
    """
    Bullish FVG: candle[i-2].high < candle[i].low  → gap-up zone
    Bearish FVG: candle[i-2].low  > candle[i].high → gap-down zone
    Filled when a subsequent candle re-enters the zone.
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

        if h0 < l2 and (l2 - h0) >= min_magnitude_atr * current_atr:
            raw.append({"type": "fvg_bull", "top": l2, "bottom": h0, "formed_at": ts, "idx": i})
        if h2 < l0 and (l0 - h2) >= min_magnitude_atr * current_atr:
            raw.append({"type": "fvg_bear", "top": l0, "bottom": h2, "formed_at": ts, "idx": i})

    unfilled: list[dict] = []
    for fvg in raw:
        filled = False
        for j in range(fvg["idx"] + 1, len(candles)):
            c = candles[j]
            if fvg["type"] == "fvg_bull" and float(c[2]) <= fvg["top"]:
                filled = True; break
            if fvg["type"] == "fvg_bear" and float(c[1]) >= fvg["bottom"]:
                filled = True; break
        if not filled:
            unfilled.append(fvg)

    structures: List[MagnetStructure] = []
    for fvg in unfilled:
        structures.append(MagnetStructure(
            symbol="", timeframe="",
            structure_type=fvg["type"],
            price_top=fvg["top"],
            price_bottom=fvg["bottom"],
            formed_at=fvg["formed_at"],
            atr_distance=round(_atr_dist(current_price, fvg["top"], fvg["bottom"], current_atr), 3),
            magnitude=round((fvg["top"] - fvg["bottom"]) / current_atr, 3),
        ))
    return structures


# ── Session levels ────────────────────────────────────────────────────────────

def detect_session_levels(
    daily_candles: List[Candle],
    current_price: float,
    current_atr: float,
) -> List[MagnetStructure]:
    """Prior completed session's high and low from daily candles."""
    if len(daily_candles) < 2 or current_atr <= 0:
        return []

    prev = daily_candles[-2]
    prev_high = float(prev[1])
    prev_low  = float(prev[2])
    prev_ts   = prev[4]

    structures: List[MagnetStructure] = []
    for price, stype in [(prev_high, "session_high"), (prev_low, "session_low")]:
        structures.append(MagnetStructure(
            symbol="", timeframe="1day",
            structure_type=stype,
            price_top=price, price_bottom=price,
            formed_at=prev_ts,
            atr_distance=round(abs(current_price - price) / current_atr, 3),
            magnitude=0.0,
        ))
    return structures


# ── Weekly levels ─────────────────────────────────────────────────────────────

def detect_weekly_levels(
    daily_candles: List[Candle],
    current_price: float,
    current_atr: float,
) -> List[MagnetStructure]:
    """
    Prior completed week's high and low, derived from daily candles.
    Weeks are identified by ISO week number from the candle timestamp.
    Only unswept levels (price hasn't traded through them since) are returned.
    """
    if len(daily_candles) < 7 or current_atr <= 0:
        return []

    try:
        import datetime
        # Group candles by ISO year-week
        weeks: Dict[str, list] = {}
        for c in daily_candles:
            ts = c[4]
            if hasattr(ts, "isocalendar"):
                y, w, _ = ts.isocalendar()
            else:
                dt = datetime.datetime.fromisoformat(str(ts))
                y, w, _ = dt.isocalendar()
            key = f"{y}-{w:02d}"
            weeks.setdefault(key, []).append(c)

        sorted_weeks = sorted(weeks.keys())
        if len(sorted_weeks) < 2:
            return []

        # Last fully completed week (second-to-last key)
        prev_week_candles = weeks[sorted_weeks[-2]]
        week_high = max(float(c[1]) for c in prev_week_candles)
        week_low  = min(float(c[2]) for c in prev_week_candles)
        week_ts   = prev_week_candles[-1][4]  # last candle of that week

        # Find the index of the last candle in the prior week
        last_week_idx = None
        for i, c in enumerate(daily_candles):
            ts = c[4]
            if hasattr(ts, "isocalendar"):
                y, w2, _ = ts.isocalendar()
            else:
                dt = datetime.datetime.fromisoformat(str(ts))
                y, w2, _ = dt.isocalendar()
            if f"{y}-{w2:02d}" == sorted_weeks[-2]:
                last_week_idx = i

        structures: List[MagnetStructure] = []
        if last_week_idx is not None:
            subsequent = daily_candles[last_week_idx + 1:]
            for price, stype in [(week_high, "week_high"), (week_low, "week_low")]:
                swept = any(
                    (stype == "week_high" and float(c[1]) >= price) or
                    (stype == "week_low"  and float(c[2]) <= price)
                    for c in subsequent
                )
                if not swept:
                    structures.append(MagnetStructure(
                        symbol="", timeframe="1day",
                        structure_type=stype,
                        price_top=price, price_bottom=price,
                        formed_at=week_ts,
                        atr_distance=round(abs(current_price - price) / current_atr, 3),
                        magnitude=0.0,
                    ))
        return structures

    except Exception:
        return []


# ── Swing highs / lows ────────────────────────────────────────────────────────

def detect_swing_points(
    candles: List[Candle],
    current_price: float,
    current_atr: float,
    lookback: int = 3,
    min_separation_atr: float = 0.3,
    max_per_side: int = 5,
) -> List[MagnetStructure]:
    """
    Local structural swing highs and lows.

    A swing high at index i: candle[i].high is the maximum high in the
    window [i-lookback .. i+lookback].
    A swing low at index i: candle[i].low is the minimum low in the same window.

    Swept swing highs (any subsequent candle's high trades through them) are
    excluded. Only the most recent max_per_side of each direction are kept.
    Nearby swings within min_separation_atr × ATR of each other are collapsed
    to the most recent to avoid cluttering the chart.
    """
    if len(candles) < lookback * 2 + 2 or current_atr <= 0:
        return []

    n = len(candles)
    # Don't include the last candle — it may still be forming
    search_end = n - 1

    raw_highs: list[dict] = []
    raw_lows:  list[dict] = []

    for i in range(lookback, search_end - lookback):
        h = float(candles[i][1])
        l = float(candles[i][2])
        window_highs = [float(candles[j][1]) for j in range(i - lookback, i + lookback + 1) if j != i]
        window_lows  = [float(candles[j][2]) for j in range(i - lookback, i + lookback + 1) if j != i]

        if h >= max(window_highs):
            raw_highs.append({"price": h, "idx": i, "formed_at": candles[i][4]})
        if l <= min(window_lows):
            raw_lows.append( {"price": l, "idx": i, "formed_at": candles[i][4]})

    def filter_unswept_highs(swings: list[dict]) -> list[dict]:
        result = []
        for sw in swings:
            swept = any(float(candles[j][1]) > sw["price"] for j in range(sw["idx"] + 1, n))
            if not swept:
                result.append(sw)
        return result

    def filter_unswept_lows(swings: list[dict]) -> list[dict]:
        result = []
        for sw in swings:
            swept = any(float(candles[j][2]) < sw["price"] for j in range(sw["idx"] + 1, n))
            if not swept:
                result.append(sw)
        return result

    def deduplicate(swings: list[dict], is_high: bool) -> list[dict]:
        """Drop swings within min_separation_atr of each other, keeping the most recent."""
        swings = sorted(swings, key=lambda s: s["idx"], reverse=True)
        kept: list[dict] = []
        for sw in swings:
            too_close = any(
                abs(sw["price"] - k["price"]) < min_separation_atr * current_atr
                for k in kept
            )
            if not too_close:
                kept.append(sw)
            if len(kept) >= max_per_side:
                break
        return kept

    unswept_highs = filter_unswept_highs(raw_highs)
    unswept_lows  = filter_unswept_lows(raw_lows)

    final_highs = deduplicate(unswept_highs, is_high=True)
    final_lows  = deduplicate(unswept_lows,  is_high=False)

    structures: List[MagnetStructure] = []
    for sw in final_highs:
        structures.append(MagnetStructure(
            symbol="", timeframe="",
            structure_type="swing_high",
            price_top=sw["price"], price_bottom=sw["price"],
            formed_at=sw["formed_at"],
            atr_distance=round(abs(current_price - sw["price"]) / current_atr, 3),
            magnitude=0.0,
        ))
    for sw in final_lows:
        structures.append(MagnetStructure(
            symbol="", timeframe="",
            structure_type="swing_low",
            price_top=sw["price"], price_bottom=sw["price"],
            formed_at=sw["formed_at"],
            atr_distance=round(abs(current_price - sw["price"]) / current_atr, 3),
            magnitude=0.0,
        ))
    return structures


# ── Equal Highs / Equal Lows (liquidity pools) ───────────────────────────────

def detect_equal_highs_lows(
    candles: List[Candle],
    current_price: float,
    current_atr: float,
    swing_lookback: int = 3,
    tolerance_atr: float = 0.12,
    min_cluster_size: int = 2,
) -> List[MagnetStructure]:
    """
    Equal Highs (EQH) and Equal Lows (EQL) — clusters of 2+ swing highs or
    lows at approximately the same price level.

    These represent liquidity pools: traders' stop losses accumulate just
    beyond these levels, making them high-probability magnetic targets.
    Price tends to sweep through them before reversing.

    Tolerance: two swing highs/lows are "equal" if their prices are within
    tolerance_atr × ATR of each other.
    """
    if len(candles) < swing_lookback * 2 + 2 or current_atr <= 0:
        return []

    n = len(candles)
    search_end = n - 1
    tolerance = tolerance_atr * current_atr

    # Detect swing highs and lows (broader lookback for EQH/EQL)
    raw_highs: list[dict] = []
    raw_lows:  list[dict] = []

    for i in range(swing_lookback, search_end - swing_lookback):
        h = float(candles[i][1])
        l = float(candles[i][2])
        window_h = [float(candles[j][1]) for j in range(i - swing_lookback, i + swing_lookback + 1) if j != i]
        window_l = [float(candles[j][2]) for j in range(i - swing_lookback, i + swing_lookback + 1) if j != i]
        if h >= max(window_h):
            raw_highs.append({"price": h, "idx": i, "ts": candles[i][4]})
        if l <= min(window_l):
            raw_lows.append( {"price": l, "idx": i, "ts": candles[i][4]})

    def cluster(swings: list[dict]) -> list[list[dict]]:
        """Group swings within tolerance of each other."""
        sorted_swings = sorted(swings, key=lambda s: s["price"])
        clusters: list[list[dict]] = []
        for sw in sorted_swings:
            placed = False
            for cl in clusters:
                if abs(sw["price"] - sum(s["price"] for s in cl) / len(cl)) <= tolerance:
                    cl.append(sw)
                    placed = True
                    break
            if not placed:
                clusters.append([sw])
        return [cl for cl in clusters if len(cl) >= min_cluster_size]

    def is_swept_high(cl: list[dict]) -> bool:
        last_idx = max(s["idx"] for s in cl)
        level = max(s["price"] for s in cl)
        return any(float(candles[j][1]) > level for j in range(last_idx + 1, n))

    def is_swept_low(cl: list[dict]) -> bool:
        last_idx = max(s["idx"] for s in cl)
        level = min(s["price"] for s in cl)
        return any(float(candles[j][2]) < level for j in range(last_idx + 1, n))

    structures: List[MagnetStructure] = []
    for cl in cluster(raw_highs):
        if is_swept_high(cl):
            continue
        price = sum(s["price"] for s in cl) / len(cl)
        formed_at = max(cl, key=lambda s: s["idx"])["ts"]
        structures.append(MagnetStructure(
            symbol="", timeframe="",
            structure_type="eqh",
            price_top=max(s["price"] for s in cl),
            price_bottom=min(s["price"] for s in cl),
            formed_at=formed_at,
            atr_distance=round(abs(current_price - price) / current_atr, 3),
            magnitude=round((max(s["price"] for s in cl) - min(s["price"] for s in cl)) / current_atr, 3),
        ))

    for cl in cluster(raw_lows):
        if is_swept_low(cl):
            continue
        price = sum(s["price"] for s in cl) / len(cl)
        formed_at = max(cl, key=lambda s: s["idx"])["ts"]
        structures.append(MagnetStructure(
            symbol="", timeframe="",
            structure_type="eql",
            price_top=max(s["price"] for s in cl),
            price_bottom=min(s["price"] for s in cl),
            formed_at=formed_at,
            atr_distance=round(abs(current_price - price) / current_atr, 3),
            magnitude=round((max(s["price"] for s in cl) - min(s["price"] for s in cl)) / current_atr, 3),
        ))

    return structures


# ── Bias score ────────────────────────────────────────────────────────────────

def compute_bias(structures: List[MagnetStructure], current_price: float) -> float:
    """
    Net directional magnetic pull across all detected structures.

    Returns a value from -100 (maximum downside pull) to +100 (maximum upside
    pull). Structures closer to current price are weighted more heavily
    (proximity_weight = 1 / max(0.1, atr_distance)).

    Structures above current price represent upside targets — bullish pull.
    Structures below current price represent downside targets — bearish pull.
    """
    bull_pull = 0.0
    bear_pull = 0.0

    for s in structures:
        midpoint = (s.price_top + s.price_bottom) / 2
        weight = 1.0 / max(0.1, s.atr_distance or 1.0)
        if midpoint > current_price:
            bull_pull += weight
        else:
            bear_pull += weight

    total = bull_pull + bear_pull
    if total == 0:
        return 0.0
    return round((bull_pull - bear_pull) / total * 100, 1)


# ── Convenience ──────────────────────────────────────────────────────────────

def nearest_above_and_below(
    structures: List[MagnetStructure],
    current_price: float,
) -> tuple[Optional[MagnetStructure], Optional[MagnetStructure]]:
    above = [s for s in structures if (s.price_top + s.price_bottom) / 2 > current_price]
    below = [s for s in structures if (s.price_top + s.price_bottom) / 2 <= current_price]
    nearest_up   = min(above, key=lambda s: s.atr_distance or 999) if above else None
    nearest_down = min(below, key=lambda s: s.atr_distance or 999) if below else None
    return nearest_up, nearest_down
