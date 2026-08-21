import { CbamRate, Material, Mrv, PartSpec, Process, SeedData } from '../types'
import { mixCo2 } from './mix'

const TRANSPORT_FACTOR = 0.0001 // kgCO2 per kg-km (road freight, conservative)

export interface CarbonOut {
  grossMass: number
  scrapMass: number
  mixCo2: number
  materialCo2: number
  energyCo2: number
  procCo2: number
  transportCo2: number
  perPartCo2: number
  annualCo2: number // kgCO2/yr
  annualCost: number // THB/yr
  mrv: Mrv
}

/** Core deterministic carbon + cost calculation for one part spec. */
export function calcCarbon(spec: PartSpec, data: SeedData): CarbonOut {
  const mat: Material | undefined = data.materials.find((m) => m.id === spec.materialId)
  const proc: Process | undefined = data.processes.find((p) => p.id === spec.processId)
  const mix = mixCo2(spec, data)

  const gross = spec.netMass / (1 - (proc?.scrapRate ?? 0))
  const scrap = gross - spec.netMass
  const materialCo2 = gross * mix // cradle-to-gate embodied
  const energyCo2 = gross * (proc?.energyIntensity ?? 0) * data.gridFactor
  const procCo2 = gross * (proc?.procEmission ?? 0)
  const transportCo2 = gross * spec.transportDist * TRANSPORT_FACTOR
  const perPartCo2 = materialCo2 + energyCo2 + procCo2 + transportCo2

  const annualParts = spec.batchSize * 12
  const annualCo2 = perPartCo2 * annualParts
  const annualCost =
    gross * (mat?.costPerKg ?? 0) * annualParts + gross * (proc?.extraCostPerKg ?? 0) * annualParts

  const mrv: Mrv = {
    scope1: procCo2 * annualParts,
    scope2: energyCo2 * annualParts,
    scope3: (materialCo2 + transportCo2) * annualParts,
  }

  return {
    grossMass: gross,
    scrapMass: scrap,
    mixCo2: mix,
    materialCo2,
    energyCo2,
    procCo2,
    transportCo2,
    perPartCo2,
    annualCo2,
    annualCost,
    mrv,
  }
}

/**
 * Carbon Score 0-100. Higher = lower footprint. Normalized against a
 * documented worst-case benchmark so the number is stable and defensible.
 */
export function carbonScore(annualCo2: number, benchmarkMax = 6000): number {
  return Math.max(0, Math.min(100, Math.round(100 * (1 - annualCo2 / benchmarkMax))))
}
