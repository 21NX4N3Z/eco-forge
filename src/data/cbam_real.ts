// Real EU CBAM data extracted from official sources (EVO folder):
// - Benchmarks: EU Commission CBAM Benchmarks (2026-02-06), Aluminium section
// - Default Values: Commission Implementing Regulation Annex I/II (2026-08-06), Thailand sheet
// - Timeline & formulas: TGO CBAM Aluminium Manual (Aug 2024)

export interface CnEntry {
  cn: string
  desc: string
  bmK: number | null // Column K benchmark tCO2e/t
  bmL: number | null // Column L benchmark tCO2e/t
  dvTh: number | null // Thailand default value tCO2e/t (total)
}

/** Aluminium CN codes relevant to SME parts manufacturing. */
export const ALUMINIUM_CN: CnEntry[] = [
  { cn: '76011010', desc: 'Al slabs, not alloyed, unwrought', bmK: null, bmL: 0.091, dvTh: null },
  { cn: '76012040', desc: 'Unwrought Al alloys — billets', bmK: null, bmL: 0.091, dvTh: null },
  { cn: '76031000', desc: 'Powders of aluminium', bmK: 0.046, bmL: 0.14, dvTh: 1.05 },
  { cn: '76041010', desc: 'Bars, rods and profiles (non-alloy)', bmK: 0.056, bmL: 0.148, dvTh: 1.27 },
  { cn: '76042910', desc: 'Bars and rods of aluminium alloys', bmK: 0.056, bmL: 0.148, dvTh: 1.27 },
  { cn: '76042990', desc: 'Solid profiles of aluminium alloys', bmK: 0.06, bmL: 0.152, dvTh: 1.29 },
  { cn: '76061150', desc: 'Plates, sheets and strip (non-alloy)', bmK: 0.056, bmL: 0.148, dvTh: 1.73 },
  { cn: '76061250', desc: 'Plates, sheets and strip (alloys)', bmK: 0.056, bmL: 0.148, dvTh: 1.73 },
]

/** Official CBAM timeline (TGO manual p.5-6). */
export const CBAM_TIMELINE = [
  { date: '2023-10-01', label: 'Transitional period เริ่ม', note: 'Importers เริ่มรายงาน — ยังไม่เสียค่าธรรมเนียม' },
  { date: '2026-01-01', label: 'Definitive period เริ่ม', note: 'ซื้อ CBAM certificates ตามปริมาณคาร์บอนจริง' },
  { date: '2034-01-01', label: 'Phase-in เต็มรูปแบบ', note: 'แทนที่ใบอนุญาต ETS ฟรีโดยสมบูรณ์' },
]

/** Standards citations for reports (ISO full titles). */
export const STANDARDS = {
  iso14040: 'ISO 14040:2006 Environmental management — LCA — Principles and framework',
  iso14067: 'ISO 14067:2018 GHG — Carbon footprint of products — Requirements and guidelines for quantification',
  astm: 'ASTM E155 porosity assessment',
  tgo: 'TGO CFP Guidelines 7th ed. (2020) · TGO CBAM Aluminium Manual (Aug 2024)',
}

/**
 * CBAM factor schedule (Guidance No.4): obligation % of embedded emissions
 * that must be covered by certificates, as EU ETS free allocation phases out.
 * 2026=2.5% → 2034=100%.
 */
export const CBAM_FACTOR: Record<number, number> = {
  2026: 0.025, 2027: 0.05, 2028: 0.10, 2029: 0.225, 2030: 0.35,
  2031: 0.475, 2032: 0.60, 2033: 0.775, 2034: 1.0,
}

/** De minimis threshold (Guidance No.1): importers below 50 t/yr are exempt. */
export const DE_MINIMIS_TONNES = 50

/**
 * Aluminium products (CN 7603–7616) fall under Annex II — ONLY direct
 * emissions count in the definitive period (Guidance No.5e §2.2).
 */
const DIRECT_ONLY_PREFIXES = ['7603', '7604', '7605', '7606', '7607', '7608', '7609', '7610', '7611', '7612', '7613', '7614', '7616']

export function isDirectOnly(cn: string): boolean {
  return DIRECT_ONLY_PREFIXES.some((p) => cn.startsWith(p))
}

/**
 * Pick benchmark for a part: route L (scrap-based/EAF route) is the default
 * production-route benchmark for downstream semi-finished goods per EU Annex.
 * Falls back to legacy 2.5 if no CN match (non-Al materials).
 */
export function benchmarkFor(cn: string): number {
  const e = ALUMINIUM_CN.find((x) => x.cn === cn)
  return e?.bmL ?? 2.5
}

/** Thailand default value fallback (when factory lacks actual data). */
export function dvThailandFor(cn: string): number | null {
  return ALUMINIUM_CN.find((x) => x.cn === cn)?.dvTh ?? null
}
