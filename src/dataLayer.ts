import { useEffect, useState } from 'react'
import seedJson from './data/seed.json'
import { Material, SeedData } from './types'

/**
 * Data layer. Local seed.json is the DEMO SOURCE OF TRUTH (offline-safe).
 * NocoDB is the scalable story — if you wire NOCODB_* env + an api call here,
 * fetch and merge; on any failure we fall back to seed so the live demo never
 * breaks (Backup Plan).
 */
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
    // Placeholder for NocoDB sync. Until configured, always use local seed.
    setData(seedJson as SeedData)
    setSource('local')
  }, [offline])

  const addMaterial = (m: Material) => {
    setData((d) => (d.materials.some((x) => x.id === m.id) ? d : { ...d, materials: [...d.materials, m] }))
  }

  return { data, source, loading, error, addMaterial }
}
