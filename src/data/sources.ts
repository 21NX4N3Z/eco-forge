/**
 * Central source registry — every number in MATEGAYCBAM traces back to an
 * official document. Cited inline via <Cite k="..." /> and listed in
 * the Sources panel / PDF Verification section.
 */

export interface Source {
  id: string
  title: string
  publisher: string
  year: string
  detail?: string // what specifically comes from this source
}

export const SOURCES: Record<string, Source> = {
  benchmark: {
    id: 'benchmark',
    title: 'CBAM Benchmarks (BMg)',
    publisher: 'European Commission · DG TAXUD',
    year: '2026-02-06',
    detail: 'Column K/L benchmark values per CN code (1,810 rows, Aluminium §1693+)',
  },
  dv: {
    id: 'dv',
    title: 'Default Values for embedded emissions (Annex I/II, correcting act)',
    publisher: 'European Commission',
    year: '2026-08-06',
    detail: 'Country-specific fallback values — Thailand Aluminium sheet 1.73 tCO2e/t',
  },
  g3: {
    id: 'g3',
    title: 'Guidance No.3 — CBAM methods for calculation of emissions embedded in goods',
    publisher: 'European Commission',
    year: '2024-12',
    detail: 'EEInpMat = Σ Mi·SEEi · bubble approach · co-product allocation · DV mark-up phase-in 2026-28',
  },
  g4: {
    id: 'g4',
    title: 'Guidance No.4 — Free allocation adjustment & CBAM factor schedule',
    publisher: 'European Commission',
    year: '2024-12',
    detail: 'CBAM factor 2.5% (2026) → 100% (2034) as EU ETS free allocation phases out',
  },
  g1: {
    id: 'g1',
    title: 'Guidance No.1 — Introduction to CBAM concepts',
    publisher: 'European Commission',
    year: '2024-12',
    detail: 'De minimis threshold 50 t/yr per importer · transitional/definitive timeline',
  },
  g5e: {
    id: 'g5e',
    title: 'Guidance No.5e — Sector-specific: Aluminium',
    publisher: 'European Commission',
    year: '2024-12',
    detail: 'Annex II direct-only rule for CN 7603–7616 · precursor = unwrought Al · PFC/anode reporting · scrap % declaration',
  },
  g2: {
    id: 'g2',
    title: 'Guidance No.2 — Quick guide for non-EU operators',
    publisher: 'European Commission',
    year: '2024-12',
    detail: '4-step implementation path for Thai factory operators',
  },
  insteu: {
    id: 'insteu',
    title: 'Guidance — CBAM implementation for installation operators outside the EU',
    publisher: 'European Commission · DG TAXUD (8 Dec 2023)',
    year: '2023-12-08',
    detail: 'Full manual for non-EU installations (252 pp)',
  },
  taxud: {
    id: 'taxud',
    title: 'Guidance on CBAM implementation for importers into the EU',
    publisher: 'European Commission · DG TAXUD (30 May 2024)',
    year: '2024-05-30',
    detail: 'Importer-side obligations',
  },
  tgo: {
    id: 'tgo',
    title: 'คู่มือการรายงาน CBAM สำหรับภาคอุตสาหกรรมอะลูมิเนียม',
    publisher: 'องค์การบริหารจัดการก๊าซเรือนกระจก (TGO)',
    year: '2567 (2024)',
    detail: 'Thai-language walkthrough · system boundaries · worked example',
  },
  tgocfp: {
    id: 'tgocfp',
    title: 'Requirements & Guidelines for Product Carbon Footprint Calculation (7th ed.)',
    publisher: 'TGO',
    year: '2020',
    detail: 'Thai CFP labelling scheme — cradle-to-gate LCA practice',
  },
  ice: {
    id: 'ice',
    title: 'Inventory of Carbon & Energy (ICE) Database v3.0',
    publisher: 'University of Bath (Hammond & Jones)',
    year: '2019',
    detail: 'Embodied CO2 factors — Al virgin 8.24 kgCO2/kg, recycled ~0.50',
  },
  ecoinvent: {
    id: 'ecoinvent',
    title: 'Ecoinvent Database v3',
    publisher: 'Ecoinvent Association',
    year: '2024',
    detail: 'Steel 1018, AlSi10Mg powder emission factors',
  },
  grid: {
    id: 'grid',
    title: 'Thailand Grid Emission Factor',
    publisher: 'EGAT / TGO',
    year: '2024',
    detail: '0.42 kgCO2/kWh (consumption-based, national grid mix)',
  },
  iso14040: {
    id: 'iso14040',
    title: 'ISO 14040:2006 — LCA Principles and framework',
    publisher: 'ISO',
    year: '2006',
  },
  iso14044: {
    id: 'iso14044',
    title: 'ISO 14044:2006 — LCA Requirements and guidelines',
    publisher: 'ISO',
    year: '2006',
  },
  iso14067: {
    id: 'iso14067',
    title: 'ISO 14067:2018 — Carbon footprint of products',
    publisher: 'ISO',
    year: '2018',
    detail: 'CFP quantification consistent with ISO 14040/14044',
  },
  astm: {
    id: 'astm',
    title: 'ASTM E155 — Reference radiographs for aluminium castings (porosity)',
    publisher: 'ASTM International',
    year: '2020',
  },
  carbonprice: {
    id: 'carbonprice',
    title: 'Thai Voluntary Carbon Market reference price',
    publisher: 'TGO / Thailand Greenhouse Gas Exchange (FTX)',
    year: '2024',
    detail: '~3,500 THB per tCO2 used for payback monetisation',
  },
}

/** Compact citation string for a key, e.g. cite('benchmark') → "(EU Commission, 2026)". */
export function cite(k: keyof typeof SOURCES | string): string {
  const s = SOURCES[k]
  return s ? `(${s.publisher.split('·')[0].trim()}, ${s.year.slice(0, 4)})` : ''
}
