// Vercel serverless proxy for the AI inference API (OpenRouter).
// Key stays server-side — frontend never sees it. Returns JSON only.
//
// Vercel Node Functions use the classic (req, res) signature: the default
// export receives an IncomingMessage-like req and a ServerResponse-like res.
// Returning a Response object is silently ignored there, so we write through
// res explicitly and never rely on Web Request/Response in this file.

import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { runtime: 'nodejs', maxDuration: 30 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS (same-origin app, but keep it permissive for the demo)
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-headers', 'content-type')
  res.setHeader('content-type', 'application/json')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).send(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  const key = (process as any).env?.OPENROUTER_API_KEY
  if (!key) {
    res.status(500).send(JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }))
    return
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>
  const isExtract = body.mode === 'extract'

  const sys = isExtract
    ? 'You are a fast JSON API that extracts part specifications from factory documents (production logs, utility bills, supplier certificates) for a CBAM carbon calculator. ' +
      'Output ONLY minified strict JSON: {"summary": string, "fields": object, "insights": string[]} — ' +
      '"fields" may contain: partType ("Bracket"|"Housing"|"Shaft"|"Flange"|"Mount"|"Custom"), netMass (kg), materialName, co2PerKg, recycledPercent, batchSize (per month), transportDist (km). ' +
      'Omit fields not found in the document. summary = 1 short Thai sentence. insights = max 3 short Thai sentences. No markdown, no prose outside the JSON.'
    : 'You are a fast JSON API — a carbon engineering assistant for Thai SME parts manufacturers facing EU CBAM. ' +
      'Output ONLY minified strict JSON: {"explanation": string, "suggestion": string, "severity": "high"|"med"|"low"} — ' +
      'max 12 words per field. No reasoning, no markdown, no prose outside the JSON.'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'stealth/ox-alpha',
        max_tokens: isExtract ? 800 : 400,
        reasoning_effort: 'low',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: JSON.stringify(body) },
        ],
      }),
    })

    const text = await upstream.text()
    res.status(upstream.status).send(text)
  } catch (err: any) {
    const aborted = err?.name === 'AbortError'
    res.status(504).send(
      JSON.stringify({
        error: aborted ? 'upstream timeout' : 'upstream fetch failed',
        detail: String(err?.message ?? err).slice(0, 200),
      }),
    )
  } finally {
    clearTimeout(timer)
  }
}
