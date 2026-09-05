// NocoDB serverless proxy for EcoForge.
// Keeps credentials server-side — only table name in query string.
// Returns { list: [...] } compatible with dataLayer fetchTable().

import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { runtime: 'nodejs', maxDuration: 10 }

const TABLE_MAP: Record<string, string> = {
  materials: 'materials',
  processes: 'processes',
  cbam_rates: 'cbam_rates',
  suppliers: 'suppliers',
  material_mixes: 'material_mixes',
  factory_history: 'factory_history',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-headers', 'content-type')
  res.setHeader('content-type', 'application/json')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'GET') {
    res.status(405).send(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  const table = (req.query?.table as string | undefined)?.toLowerCase()
  if (!table) {
    res.status(400).send(JSON.stringify({ error: 'table query required' }))
    return
  }
  const tableId = TABLE_MAP[table]
  if (!tableId) {
    res.status(400).send(JSON.stringify({ error: `Unknown table: ${table}` }))
    return
  }

  const baseUrl = (process.env as any).NOCODB_BASE_URL?.trim()
  const token = (process.env as any).NOCODB_API_TOKEN?.trim()
  if (!baseUrl || !token) {
    // No NocoDB configured — return 501 so dataLayer falls back to local seed
    res.status(501).send(JSON.stringify({ error: 'NocoDB not configured' }))
    return
  }

  const url = `${baseUrl.replace(/\/+$/, '')}/api/v2/tables/${tableId}/records`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 3000)

  try {
    const res2 = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'xc-token': token, 'content-type': 'application/json' },
    })
    if (!res2.ok) {
      res.status(502).send(JSON.stringify({ error: `NocoDB ${res2.status}` }))
      return
    }
    const json = await res2.json()
    // NocoDB returns { list: [...] }
    const list = (json as any)?.list ?? []
    if (!Array.isArray(list)) {
      res.status(502).send(JSON.stringify({ error: 'invalid NocoDB response' }))
      return
    }
    res.status(200).send(JSON.stringify({ list }))
  } catch (e: any) {
    const aborted = e?.name === 'AbortError'
    res.status(504).send(
      JSON.stringify({
        error: aborted ? 'NocoDB timeout' : 'NocoDB fetch failed',
        detail: String(e?.message ?? e).slice(0, 200),
      }),
    )
  } finally {
    clearTimeout(timer)
  }
}