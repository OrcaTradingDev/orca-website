from __future__ import annotations

from typing import List, Optional, Tuple

# ----------------------------
# Indicator math (no pandas)
# Extracted from worker/poll_ingest_worker.py so app/domain/orca_mc.py can
# reuse them without importing from the worker (layering violation).
# ----------------------------


def _ema(values: List[float], period: int) -> List[Optional[float]]:
    if len(values) < period:
        return [None] * len(values)
    k = 2.0 / (period + 1.0)
    out: List[Optional[float]] = [None] * len(values)
    sma = sum(values[:period]) / period
    out[period - 1] = sma
    prev = sma
    for i in range(period, len(values)):
        prev = values[i] * k + prev * (1.0 - k)
        out[i] = prev
    return out


def _sma(values: List[float], period: int) -> List[Optional[float]]:
    if len(values) < period:
        return [None] * len(values)
    out: List[Optional[float]] = [None] * len(values)
    window_sum = sum(values[:period])
    out[period - 1] = window_sum / period
    for i in range(period, len(values)):
        window_sum += values[i] - values[i - period]
        out[i] = window_sum / period
    return out


def _rsi_wilder(closes: List[float], period: int = 14) -> List[Optional[float]]:
    if len(closes) < period + 1:
        return [None] * len(closes)

    out: List[Optional[float]] = [None] * len(closes)

    gains = 0.0
    losses = 0.0
    for i in range(1, period + 1):
        ch = closes[i] - closes[i - 1]
        if ch >= 0:
            gains += ch
        else:
            losses += -ch

    avg_gain = gains / period
    avg_loss = losses / period

    def rsi_from(avgg, avgl) -> float:
        if avgl == 0:
            return 100.0
        rs = avgg / avgl
        return 100.0 - (100.0 / (1.0 + rs))

    out[period] = rsi_from(avg_gain, avg_loss)

    for i in range(period + 1, len(closes)):
        ch = closes[i] - closes[i - 1]
        gain = ch if ch > 0 else 0.0
        loss = (-ch) if ch < 0 else 0.0
        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period
        out[i] = rsi_from(avg_gain, avg_loss)

    return out


def _atr_wilder(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> List[Optional[float]]:
    n = len(closes)
    if n < period + 1:
        return [None] * n

    tr: List[float] = []
    tr.append(highs[0] - lows[0])
    for i in range(1, n):
        tr_val = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1]),
        )
        tr.append(tr_val)

    out: List[Optional[float]] = [None] * n

    first_atr = sum(tr[1 : period + 1]) / period
    out[period] = first_atr
    prev = first_atr

    for i in range(period + 1, n):
        prev = (prev * (period - 1) + tr[i]) / period
        out[i] = prev

    return out


def _adx_wilder(
    highs: List[float], lows: List[float], closes: List[float], period: int = 14
) -> Tuple[List[Optional[float]], List[Optional[float]], List[Optional[float]]]:
    """
    Returns (adx, plus_di, minus_di) lists aligned to input length.
    """
    n = len(closes)
    if n < period * 2 + 1:
        return ([None] * n, [None] * n, [None] * n)

    plus_dm: List[float] = [0.0]
    minus_dm: List[float] = [0.0]
    tr: List[float] = [highs[0] - lows[0]]

    for i in range(1, n):
        up_move = highs[i] - highs[i - 1]
        down_move = lows[i - 1] - lows[i]

        pdm = up_move if (up_move > down_move and up_move > 0) else 0.0
        mdm = down_move if (down_move > up_move and down_move > 0) else 0.0

        plus_dm.append(pdm)
        minus_dm.append(mdm)

        tr_val = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1]),
        )
        tr.append(tr_val)

    # Wilder smoothing
    def wilder_smooth(vals: List[float], p: int) -> List[Optional[float]]:
        out: List[Optional[float]] = [None] * len(vals)
        initial = sum(vals[1 : p + 1])  # start from 1
        out[p] = initial
        prev = initial
        for i in range(p + 1, len(vals)):
            prev = prev - (prev / p) + vals[i]
            out[i] = prev
        return out

    sm_tr = wilder_smooth(tr, period)
    sm_pdm = wilder_smooth(plus_dm, period)
    sm_mdm = wilder_smooth(minus_dm, period)

    plus_di: List[Optional[float]] = [None] * n
    minus_di: List[Optional[float]] = [None] * n
    dx: List[Optional[float]] = [None] * n

    for i in range(n):
        if sm_tr[i] is None or sm_tr[i] == 0 or sm_pdm[i] is None or sm_mdm[i] is None:
            continue
        pdi = 100.0 * (sm_pdm[i] / sm_tr[i])
        mdi = 100.0 * (sm_mdm[i] / sm_tr[i])
        plus_di[i] = pdi
        minus_di[i] = mdi
        denom = pdi + mdi
        if denom == 0:
            dx[i] = 0.0
        else:
            dx[i] = 100.0 * abs(pdi - mdi) / denom

    # ADX: Wilder average of DX
    adx: List[Optional[float]] = [None] * n
    start = period * 2
    dx_window = [d for d in dx[period + 1 : start + 1] if d is not None]
    if len(dx_window) < period:
        return (adx, plus_di, minus_di)

    first_adx = sum(dx_window[:period]) / period
    adx[start] = first_adx
    prev = first_adx

    for i in range(start + 1, n):
        if dx[i] is None:
            continue
        prev = ((prev * (period - 1)) + dx[i]) / period
        adx[i] = prev

    return (adx, plus_di, minus_di)
