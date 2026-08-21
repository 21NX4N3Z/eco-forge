import { CalcResult, CbamRate, CbamYear, PartSpec, SeedData } from '../types'
import { calcCarbon, carbonScore } from './carbon'

/**
 * CBAM Tax per year:
 *   CBAM Tax = (Embodied CO2 − EU Benchmark) × ETS Price × Obligation%
 * Only emissions ABOVE the EU benchmark are taxed. Below = €0.
 */
export function calcCbam(annualCo2Kg: number, rates: CbamRate[]): CbamYear[] {
  const annualT = annualCo2Kg / 1000 // kg -> t
  return rates.map((r) => {
    const excess = Math.max(0, annualT - r.benchmarkCo2)
    const taxEur = excess * r.etsPriceEur * r.obligationPercent
    return {
      year: r.year,
      obligation: r.obligationPercent,
      taxEur: Math.round(taxEur * 100) / 100,
      pass: excess <= 0,
    }
  })
}

/** Assemble the full deterministic result for a spec. */
export function evaluate(spec: PartSpec, data: SeedData): CalcResult {
  const c = calcCarbon(spec, data)
  const cbam = calcCbam(c.annualCo2, data.cbamRates)
  return {
    grossMass: c.grossMass,
    scrapMass: c.scrapMass,
    mixCo2: c.mixCo2,
    materialCo2: c.materialCo2,
    energyCo2: c.energyCo2,
    procCo2: c.procCo2,
    transportCo2: c.transportCo2,
    perPartCo2: c.perPartCo2,
    annualCo2: c.annualCo2,
    annualCost: c.annualCost,
    score: carbonScore(c.annualCo2),
    cbam,
    mrv: c.mrv,
  }
}
