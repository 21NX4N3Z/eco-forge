import { CalcResult, CbamRate, CbamYear, PartSpec, SeedData } from '../types'
import { calcCarbon, carbonScore } from './carbon'
import { benchmarkFor, dvThailandFor } from '../data/cbam_real'

/**
 * CBAM Tax per year (per EU formula / TGO manual):
 *   CBAM Tax = (Embodied CO2 − Benchmark_CN) × ETS Price × Obligation%
 * Benchmark comes from the real EU table by CN code; below = €0.
 */
export function calcCbam(annualCo2Kg: number, rates: CbamRate[], cnCode?: string): { years: CbamYear[]; benchmark: number; dvTh: number | null } {
  const annualT = annualCo2Kg / 1000
  const benchmark = benchmarkFor(cnCode ?? '')
  const dvTh = dvThailandFor(cnCode ?? '')
  const years = rates.map((r) => {
    const excess = Math.max(0, annualT - benchmark)
    const taxEur = excess * r.etsPriceEur * r.obligationPercent
    return {
      year: r.year,
      obligation: r.obligationPercent,
      taxEur: Math.round(taxEur * 100) / 100,
      pass: excess <= 0,
    }
  })
  return { years, benchmark, dvTh }
}

/** Assemble the full deterministic result for a spec. */
export function evaluate(spec: PartSpec, data: SeedData): CalcResult {
  const c = calcCarbon(spec, data)
  const { years, benchmark, dvTh } = calcCbam(c.annualCo2, data.cbamRates, spec.cnCode)
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
    cbam: years,
    mrv: c.mrv,
    benchmark,
    dvTh,
  }
}
