// EcoForge domain types — aligned with NocoDB schema (v2 post-meeting).

export interface Material {
  id: number
  name: string
  alloy: string // metallurgical designation, e.g. Al 6061-T6
  density: number // kg/m3
  emissionFactor: number // kgCO2 per kg material (embodied, cradle-to-gate)
  costPerKg: number // THB per kg
  recyclable: boolean
  // — Material-science detail (for Carbon Twin depth) —
  tensileStrength: number // MPa (ultimate)
  yieldStrength: number // MPa
  hardness: number // Brinell (HB)
  elongation: number // % fracture strain
  corrosion: number // 1..5 (5 = excellent)
  thermalCond: number // W/m·K
  electricalCond: number // %IACS
  recycleGrade: 'A' | 'B' | 'C' | 'D' // end-of-life sorting grade
  porosityClass: string // ASTM E155 class
  rohs: boolean // RoHS compliant
  source?: string
}

export interface Process {
  id: number
  name: string
  energyIntensity: number // kWh per kg processed
  scrapRate: number // 0..1
  procEmission: number // kgCO2 per kg processed (direct/Scope1)
  extraCostPerKg: number // THB per kg processed (machining/tooling)
}

export interface CbamRate {
  year: number
  obligationPercent: number // 0..1
  etsPriceEur: number
  benchmarkCo2: number // t CO2/yr reference for the product category
}

export interface Supplier {
  id: number
  name: string
  materialIds: number[]
  co2Certificate: string
  contact: string
}

export interface MaterialMix {
  id: string
  name: string
  parts: { materialId: number; percent: number }[]
  calculatedCo2: number // kgCO2/kg after mix
}

export interface SeedData {
  gridFactor: number // kgCO2 per kWh (Thai Grid ~0.42)
  materials: Material[]
  processes: Process[]
  cbamRates: CbamRate[]
  suppliers: Supplier[]
  mixes: MaterialMix[]
}

export type InputSource = 'standard' | 'manual' | 'history' | 'supplier'

export interface PartSpec {
  inputSource: InputSource
  partType: string
  cnCode?: string // EU CN code (e.g. '76061250') — picks real CBAM benchmark
  netMass: number // kg
  materialId: number
  recycledPercent: number // 0..100
  mixId?: string
  processId: number
  batchSize: number // parts / month
  transportDist: number // km
}

export interface CbamYear {
  year: number
  obligation: number // 0..1
  taxEur: number
  pass: boolean
}

export interface Mrv {
  scope1: number // direct process (kgCO2/yr)
  scope2: number // electricity (kgCO2/yr)
  scope3: number // embedded material + transport (kgCO2/yr)
}

export interface CalcResult {
  grossMass: number
  scrapMass: number
  mixCo2: number // kgCO2/kg
  materialCo2: number // per part
  energyCo2: number
  procCo2: number
  transportCo2: number
  perPartCo2: number
  annualCo2: number // kgCO2 / yr
  annualCost: number // THB / yr
  score: number // 0..100
  cbam: CbamYear[]
  mrv: Mrv
  benchmark: number // EU benchmark used (tCO2e/t) — real value by CN code
  dvTh: number | null // Thailand default value fallback (tCO2e/t)
}

export interface Alternative {
  label: string
  note: string
  spec: PartSpec
  result: CalcResult
}
