/**
 * Payback helper (UI-layer utility — engine is owned by another agent).
 *
 * Carbon price: 3,500 THB per tCO2 (Thai voluntary market reference).
 *
 * Payback (months) = one-time switching cost (tooling) ÷ monthly total saving.
 * Total saving = annual cash saving + monetised CO2 saving, per month.
 *   - No tooling needed and cheaper → 0 months ("ทันที")
 *   - Never breaks even             → null ("—")
 */
export const CARBON_PRICE_THB_PER_TCO2 = 3500

export function paybackMonths(
  curCost: number,
  altCost: number,
  co2SavedKg: number,
  toolingDeltaThb = 0,
): number | null {
  if (toolingDeltaThb <= 0 && altCost <= curCost) return 0
  const monthlyCashSaving = Math.max(0, curCost - altCost) / 12
  const monthlyCarbonValue = ((co2SavedKg / 1000) * CARBON_PRICE_THB_PER_TCO2) / 12
  const monthlyTotal = monthlyCashSaving + monthlyCarbonValue
  if (monthlyTotal <= 0) return null
  return Math.round((toolingDeltaThb / monthlyTotal) * 10) / 10
}

/** Human label for a paybackMonths() result. */
export function paybackLabel(m: number | null): string {
  if (m === null) return '—'
  if (m === 0) return 'ทันที'
  return `${m} เดือน`
}
