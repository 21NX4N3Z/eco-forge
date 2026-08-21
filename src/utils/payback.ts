/**
 * Payback helper (UI-layer utility — engine is owned by another agent).
 *
 * Carbon price: 3,500 THB per tCO2 (Thai voluntary market reference).
 *
 * Payback (months) = annual cost premium of the alternative
 *                    ÷ monthly monetised CO2 saving.
 *   - Alternative cheaper than current → 0 months (pays off immediately)
 *   - Costs more but saves no CO2      → null (never breaks even)
 */
export const CARBON_PRICE_THB_PER_TCO2 = 3500

export function paybackMonths(
  curCost: number,
  altCost: number,
  co2SavedKg: number,
): number | null {
  const premium = Math.max(0, altCost - curCost)
  const monthlyCarbonValue = (co2SavedKg / 1000) * CARBON_PRICE_THB_PER_TCO2 / 12
  if (premium === 0) return 0
  if (monthlyCarbonValue <= 0) return null
  return Math.round((premium / monthlyCarbonValue) * 10) / 10
}

/** Human label for a paybackMonths() result. */
export function paybackLabel(m: number | null): string {
  if (m === null) return '—'
  if (m === 0) return 'ทันที'
  return `${m} เดือน`
}
