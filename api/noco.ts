import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * GET /api/noco?table=<key> — server-side NocoDB read proxy.
 *
 * Token never reaches the client bundle: NOCODB_* live in Vercel env only
 * (no VITE_ prefix). Mirrors the /api/why pattern: Node-style (req, res)
 * signature — NOT Web Request/Response (Vercel Node runtime ignores the
 * returned Response), CORS headers, AbortController timeout, graceful errors.
 *
 * Table keys map to ids via NOCODB_TABLES JSON, e.g.
 *   NOCODB_TABLES={"materials":"m1abc","processes":"m2def",...}
 */

const TABLE_KEYS = ['materials', 'processes', 'cbam_rates', 'suppliers', 'material_mixes']

const TIMEOUT_MS = 20000

export const config = { runtime: 'nodejs', maxDuration: 30 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — same posture as /api/why
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const key = String(req.query.table ?? '')
  if (!TABLE_KEYS.includes(key)) {
    res.status(400).json({ error: `table must be one of: ${TABLE_KEYS.join(', ')}` })
    return
  }

  const baseUrl = process.env.NOCODB_BASE_URL?.trim()
  const token = process.env.NOCODB_API_TOKEN?.trim()
  let tables: Record<string, string> = {}
  try {
    tables = JSON.parse(process.env.NOCODB_TABLES ?? '{}') ?? {}
  } catch {
    tables = {}
  }

  // Not configured yet → explicit signal; dataLayer treats this as local mode.
  if (!baseUrl || !token || !tables[key]) {
    res.status(501).json({ error: 'NocoDB not configured', table: key })
    return
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const upstream = await fetch(
      `${baseUrl.replace(/\/+$/, '')}/api/v2/tables/${tables[key]}/records?limit=1000`,
      { headers: { 'xc-token': token }, signal: ctrl.signal },
    )
    if (!upstream.ok) {
      res.status(502).json({ error: `NocoDB ${upstream.status}`, table: key })
      return
    }
    const json: unknown = await upstream.json()
    const list = (json as { list?: unknown })?.list
    res.status(200).json({ table: key, list: Array.isArray(list) ? list : [] })
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError'
    res.status(aborted ? 504 : 502).json({
      error: aborted ? 'NocoDB timeout' : 'NocoDB unreachable',
      table: key,
    })
  } finally {
    clearTimeout(timer)
  }
}
