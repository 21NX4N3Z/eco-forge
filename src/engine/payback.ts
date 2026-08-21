import { CalcResult, PartSpec } from '../types'

/**
 * One-time tooling / changeover investment when switching process (THB).
 * Documented SME-scale estimates for aluminium parts — kept explicit so the
 * payback number is defensible in the demo (brief: Alt A ≈ 8 months).
 */
export const TOOLING_COST_THB: Record<number, number> = {
  1: 0, // CNC from Billet — fixture only (baseline)
  2: 95000, // Gravity Die Casting — permanent mould
  3: 120000, // Extrusion + CNC — extrusion die + fixture
  4: 250000, // Additive Mfg — powder handling / build plate setup
}

export interface PaybackOut {
  /** Months to recover the one-time investment. null = no net saving. 0 = immediate (no extra tooling). */
  months: number | null
  investmentThb: number
  annualSavingThb: number
}

/**
 * Payback period = incremental tooling investment / annual cost saving × 12.
 *
 *   Payback (months) = (Tooling[alt] − Tooling[base]) / (Cost_base − Cost_alt) × 12
 *
 * Only counts investment ABOVE what the baseline already spent. If the
 * alternative saves nothing, payback is undefined (null).
 */
export function paybackPeriod(
  base: { spec: PartSpec; result: CalcResult },
  alt: { spec: PartSpec; result: CalcResult },
): PaybackOut {
  const investment = Math.max(
    0,
    (TOOLING_COST_THB[alt.spec.processId] ?? 0) - (TOOLING_COST_THB[base.spec.processId] ?? 0),
  )
  const annualSaving = base.result.annualCost - alt.result.annualCost

  if (annualSaving <= 0) {
    return { months: null, investmentThb: investment, annualSavingThb: annualSaving }
  }
  if (investment === 0) {
    return { months: 0, investmentThb: 0, annualSavingThb: annualSaving }
  }
  const months = Math.round((investment / annualSaving) * 120) / 10 // 1 decimal
  return { months, investmentThb: investment, annualSavingThb: annualSaving }
}

/** Human label for a PaybackOut. */
export function paybackLabel(p: PaybackOut): string {
  if (p.months === null) return '—'
  if (p.months === 0) return 'ทันที'
  return `${p.months} เดือน`
}
