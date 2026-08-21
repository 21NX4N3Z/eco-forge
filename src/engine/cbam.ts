import { CalcResult, CbamRate, CbamYear, PartSpec, SeedData } from '../types'
import { calcCarbon, carbonScore } from './carbon'
import { benchmarkFor, dvThailandFor, CBAM_FACTOR, DE_MINIMIS_TONNES, isDirectOnly } from '../data/cbam_real'

/**
 * CBAM Tax per year (per EU formula / TGO manual / Guidance No.3-5e):
 *   Taxable = max(0, Embedded − Benchmark_CN)   [direct-only for Al products]
 *   CBAM Tax = Taxable × ETS Price × CBAM Factor(year)   [2.5%→100% 2026-2034]
 */
export function calcCbam(annualCo2Kg: number, rates: CbamRate[], cnCode?: string): { years: CbamYear[]; benchmark: number; dvTh: number | null; directOnly: boolean } {
  const annualT = annualCo2Kg / 1000
  const benchmark = benchmarkFor(cnCode ?? '')
  const dvTh = dvThailandFor(cnCode ?? '')
  const directOnly = cnCode ? isDirectOnly(cnCode) : false
  const years = rates.map((r) => {
    const factor = CBAM_FACTOR[r.year] ?? r.obligationPercent
    const excess = Math.max(0, annualT - benchmark)
    const taxEur = excess * r.etsPriceEur * factor
    return {
      year: r.year,
      obligation: factor,
      taxEur: Math.round(taxEur * 100) / 100,
      pass: excess <= 0,
    }
  })
  return { years, benchmark, dvTh, directOnly }
}

/** Assemble the full deterministic result for a spec. */
export function evaluate(spec: PartSpec, data: SeedData): CalcResult {
  const c = calcCarbon(spec, data)
  const { years, benchmark, dvTh, directOnly } = calcCbam(c.annualCo2, data.cbamRates, spec.cnCode)

  // Guidance No.5e §2.2: Al products (Annex II) count DIRECT emissions only —
  // electricity (Scope 2) is excluded from taxable embedded emissions.
  const annualCo2Taxable = directOnly ? c.mrv.scope1 + c.transportCo2 * spec.batchSize * 12 : c.annualCo2
  const { years: yearsTaxable } = calcCbam(annualCo2Taxable, data.cbamRates, spec.cnCode)

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
    cbam: yearsTaxable,
    mrv: c.mrv,
    benchmark,
    dvTh,
    directOnly,
    deMinimis: annualCo2Taxable / 1000 < DE_MINIMIS_TONNES,
  }
}
