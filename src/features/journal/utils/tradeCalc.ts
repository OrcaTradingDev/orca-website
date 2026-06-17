import type { Direction } from "../types/journal";

/**
 * Calculate planned R:R from entry, stop-loss, and take-profit prices.
 * Returns null if any value is missing or the numbers don't make sense
 * (e.g. SL is above entry on a LONG).
 */
export function calcRR(
  entry: number | null,
  sl: number | null,
  tp: number | null,
  dir: Direction,
): number | null {
  if (entry == null || sl == null || tp == null) return null;
  const risk   = dir === "LONG" ? entry - sl : sl - entry;
  const reward = dir === "LONG" ? tp - entry : entry - tp;
  if (risk <= 0 || reward <= 0) return null;
  return parseFloat((reward / risk).toFixed(2));
}

/**
 * Estimate PnL from entry, exit, and lot/position size.
 * This is a price-difference × size approximation — accurate for
 * most instruments when size is in the instrument's base unit.
 */
export function calcPnL(
  entry: number | null,
  exit: number | null,
  lot: number | null,
  dir: Direction,
): number | null {
  if (entry == null || exit == null || lot == null || lot <= 0) return null;
  const raw = (exit - entry) * lot;
  return parseFloat((dir === "LONG" ? raw : -raw).toFixed(2));
}
