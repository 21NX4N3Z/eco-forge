import { Alternative, PartSpec, SeedData } from '../types'
import { evaluate } from './cbam'

/**
 * Rule-based alternative generator (NOT an LLM). Produces a small set of
 * comparable options the Embedded AI Assistant can then explain per-point.
 * Mirrors the v2 meeting comparison table (A / B / C).
 */
export function generateAlternatives(base: PartSpec, data: SeedData): Alternative[] {
  const alts: { label: string; note: string; patch: Partial<PartSpec> }[] = [
    {
      label: 'A',
      note: 'Gravity Die Casting + 50% Recycled — กระบวนการ scrap ต่ำ + วัสดุรีไซเคิล',
      patch: { processId: 2, recycledPercent: 50, mixId: 'mix-50r' },
    },
    {
      label: 'B',
      note: 'Extrusion + CNC — scrap ต่ำกว่า CNC เดี่ยว',
      patch: { processId: 3 },
    },
    {
      label: 'C',
      note: 'CNC + 50% Recycled — ปรับวัสดุอย่างเดียว',
      patch: { recycledPercent: 50, mixId: 'mix-50r' },
    },
  ]

  return alts.map((a) => {
    const spec: PartSpec = { ...base, ...a.patch }
    const result = evaluate(spec, data)
    return { label: a.label, note: a.note, spec, result }
  })
}

/** Find the best alternative by lowest annual CO2 (tie-break: lower cost). */
export function bestAlternative(base: PartSpec, data: SeedData): Alternative | null {
  const baseRes = evaluate(base, data)
  const alts = generateAlternatives(base, data)
  let best: Alternative | null = null
  for (const a of alts) {
    if (
      !best ||
      a.result.annualCo2 < best.result.annualCo2 - 1e-6 ||
      (Math.abs(a.result.annualCo2 - best.result.annualCo2) < 1e-6 &&
        a.result.annualCost < best.result.annualCost)
    ) {
      best = a
    }
  }
  return best && best.result.annualCo2 < baseRes.annualCo2 ? best : null
}
