import { useEffect, useState } from 'react'
import seedJson from './data/seed.json'
import { CbamRate, Material, MaterialMix, Process, SeedData, Supplier } from './types'

/**
 * Data layer — Phase C (read-only NocoDB pull).
 *
 * - Local seed.json is the DEMO SOURCE OF TRUTH (offline-safe). The live demo
 *   NEVER depends on the network.
 * - If VITE_NOCODB_* credentials exist, we pull materials / processes /
 *   cbam_rates / suppliers / material_mixes (brief §1.1, §6) with a hard 3s
 *   timeout and merge over the seed. ANY failure → silent fallback to local.
 * - No write path: scenarios stay in localStorage (HistoryPanel) by design.
 */

export interface NocoConfig {
  baseUrl: string
  token: string
  /** collection key -> NocoDB table id */
  tables: Record<string, string>
}

type EnvLike = Record<string, string | undefined> | undefined

export function nocoConfigFromEnv(env: EnvLike): NocoConfig | null {
  const baseUrl = env?.VITE_NOCODB_BASE_URL?.trim()
  const token = env?.VITE_NOCODB_API_TOKEN?.trim()
  if (!baseUrl || !token) return null // no credentials → zero network, local mode
  let tables: Record<string, string> = {}
  try {
    tables = JSON.parse(env?.VITE_NOCODB_TABLES ?? '{}') ?? {}
  } catch {
    tables = {}
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ''), token, tables }
}

function currentEnv(): EnvLike {
  try {
    return (import.meta as any)?.env
  } catch {
    return undefined
  }
}

async function fetchTable(key: string): Promise<Record<string, unknown>[] | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 3000) // hard cap — demo must never hang
  try {
    // Server-side proxy (api/noco.ts) holds NOCODB_* env — nothing secret in the bundle.
    // 501 = proxy not configured yet, 502/504 = upstream problem → local fallback either way.
    const res = await fetch(`/api/noco?table=${encodeURIComponent(key)}`, { signal: ctrl.signal })
    if (!res.ok) return null
    const json: unknown = await res.json()
    const list = (json as { list?: unknown })?.list
    return Array.isArray(list) ? (list as Record<string, unknown>[]) : null
  } catch {
    return null // abort / network / bad JSON → caller falls back
  } finally {
    clearTimeout(timer)
  }
}

// ---- defensive row mappers (bad rows are skipped, never throw) ----
const num = (v: unknown, d = 0): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}
const bool = (v: unknown, d = false): boolean => {
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === 1) return true
  if (v === 'false' || v === 0) return false
  return d
}
const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : v == null ? d : String(v))

function mapMaterial(r: Record<string, unknown>): Material | null {
  const id = num(r.id, 0)
  const name = str(r.name)
  if (!id || !name) return null
  return {
    id,
    name,
    alloy: str(r.alloy, name),
    density: num(r.density),
    emissionFactor: num(r.emission_factor),
    costPerKg: num(r.cost_per_kg),
    recyclable: bool(r.recyclable),
    tensileStrength: num(r.tensile_strength),
    yieldStrength: num(r.yield_strength),
    hardness: num(r.hardness),
    elongation: num(r.elongation),
    corrosion: num(r.corrosion, 3),
    thermalCond: num(r.thermal_cond),
    electricalCond: num(r.electrical_cond),
    recycleGrade: (['A', 'B', 'C', 'D'].includes(str(r.recycle_grade)) ? str(r.recycle_grade) : 'C') as Material['recycleGrade'],
    porosityClass: str(r.porosity_class, '—'),
    rohs: bool(r.rohs),
    source: str(r.source) || undefined,
  }
}

function mapProcess(r: Record<string, unknown>): Process | null {
  const id = num(r.id, 0)
  const name = str(r.name)
  if (!id || !name) return null
  return {
    id,
    name,
    energyIntensity: num(r.energy_intensity),
    scrapRate: num(r.scrap_rate),
    procEmission: num(r.proc_emission),
    extraCostPerKg: num(r.extra_cost_per_kg),
  }
}

function mapCbamRate(r: Record<string, unknown>): CbamRate | null {
  const year = num(r.year, 0)
  if (!year) return null
  return {
    year,
    obligationPercent: num(r.obligation_percent),
    etsPriceEur: num(r.ets_price_eur),
    benchmarkCo2: num(r.benchmark_co2),
  }
}

function mapSupplier(r: Record<string, unknown>): Supplier | null {
  const id = num(r.id, 0)
  const name = str(r.name)
  if (!id || !name) return null
  let ids: number[] = []
  try {
    const raw = typeof r.material_ids === 'string' ? JSON.parse(r.material_ids) : r.material_ids
    ids = Array.isArray(raw) ? raw.map((x) => num(x)).filter(Boolean) : []
  } catch {
    ids = []
  }
  return { id, name, materialIds: ids, co2Certificate: str(r.co2_certificate), contact: str(r.contact) }
}

function mapMix(r: Record<string, unknown>): MaterialMix | null {
  const name = str(r.name)
  if (!name) return null
  const parts: MaterialMix['parts'] = []
  for (const i of [1, 2]) {
    const mid = num(r[`material_id_${i}`])
    const pct = num(r[`percent_${i}`])
    if (mid && pct) parts.push({ materialId: mid, percent: pct })
  }
  return {
    id: str(r.id) || name.toLowerCase().replace(/\s+/g, '-'),
    name,
    parts,
    calculatedCo2: num(r.calculated_co2),
  }
}

/** Pull every configured table via the /api/noco proxy; null if nothing usable. */
export async function fetchNocoSeed(_cfg: NocoConfig | null): Promise<Partial<SeedData> | null> {
  const wanted: [string, (r: Record<string, unknown>) => unknown][] = [
    ['materials', mapMaterial],
    ['processes', mapProcess],
    ['cbam_rates', mapCbamRate],
    ['suppliers', mapSupplier],
    ['material_mixes', mapMix],
  ]
  const mapped: Partial<SeedData> = {}
  let gotAny = false
  await Promise.all(
    wanted.map(async ([key, map]) => {
      const rows = await fetchTable(key)
      if (!rows) return
      const clean = rows.map(map).filter((x) => x != null)
      if (!clean.length) return
      gotAny = true
      ;(mapped as Record<string, unknown[]>)[key] = clean
    }),
  )
  return gotAny ? mapped : null
}

/** Overlay remote onto local — empty/missing collections keep the seed values. */
export function mergeSeed(local: SeedData, remote: Partial<SeedData> | null): SeedData {
  if (!remote) return local
  const pick = <T,>(r: T[] | undefined, l: T[]): T[] => (Array.isArray(r) && r.length ? r : l)
  return {
    gridFactor: typeof remote.gridFactor === 'number' ? remote.gridFactor : local.gridFactor,
    materials: pick(remote.materials, local.materials),
    processes: pick(remote.processes, local.processes),
    cbamRates: pick(remote.cbamRates, local.cbamRates),
    suppliers: pick(remote.suppliers, local.suppliers),
    mixes: pick(remote.mixes, local.mixes),
  }
}

export function useSeed(offline: boolean) {
  const [data, setData] = useState<SeedData>(seedJson as SeedData)
  const [source, setSource] = useState<'local' | 'nocodb'>('local')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (offline) {
      setData(seedJson as SeedData)
      setSource('local')
      return
    }
    const cfg = nocoConfigFromEnv(currentEnv())
    if (!cfg) {
      setData(seedJson as SeedData)
      setSource('local')
      return
    }
    let cancelled = false
    setLoading(true)
    fetchNocoSeed(cfg)
      .then((remote) => {
        if (cancelled) return
        setData(mergeSeed(seedJson as SeedData, remote))
        setSource(remote ? 'nocodb' : 'local')
        if (!remote) {
          console.warn('[EcoForge] NocoDB unreachable/unconfigured — local seed fallback (demo-safe)')
        }
      })
      .catch(() => {
        if (!cancelled) setSource('local')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [offline])

  const addMaterial = (m: Material) => {
    setData((d) => (d.materials.some((x) => x.id === m.id) ? d : { ...d, materials: [...d.materials, m] }))
  }

  return { data, source, loading, error, addMaterial }
}
