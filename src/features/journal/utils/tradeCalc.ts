/**
 * Calculate R:R from dollar-amount SL and TP.
 * e.g. risking $50 to make $150 → R:R = 3.00
 */
export function calcRR(
  slDollars: number | null,
  tpDollars: number | null,
): number | null {
  if (slDollars == null || tpDollars == null) return null;
  if (slDollars <= 0 || tpDollars <= 0) return null;
  return parseFloat((tpDollars / slDollars).toFixed(2));
}

/**
 * Estimate PnL from entry, exit, and lot/position size.
 * Accurate for most instruments when size is in the instrument's base unit.
 */
export function calcPnL(
  entry: number | null,
  exit: number | null,
  lot: number | null,
  dir: "LONG" | "SHORT",
): number | null {
  if (entry == null || exit == null || lot == null || lot <= 0) return null;
  const raw = (exit - entry) * lot;
  return parseFloat((dir === "LONG" ? raw : -raw).toFixed(2));
}
