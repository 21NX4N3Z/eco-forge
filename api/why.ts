// Vercel serverless proxy for Hermes (Nous Portal API).
// Key stays server-side — frontend never sees it. Returns JSON only.
// Deploy as a Vercel Function at /api/why.

export const config = { runtime: 'nodejs18.x' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const key = (process as any).env?.NOUS_API_KEY
  if (!key) {
    return new Response(JSON.stringify({ error: 'NOUS_API_KEY not set' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  const body = await req.json().catch(() => ({}))
  const sys =
    'You are a carbon engineering assistant for Thai SME parts manufacturers facing EU CBAM. ' +
    'Reply ONLY with strict JSON: {"explanation": string, "suggestion": string, "severity": "high"|"med"|"low"}. ' +
    'Be concise and engineering-focused. No markdown, no prose outside the JSON.'

  const upstream = await fetch('https://portal.nousresearch.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'hermes',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: JSON.stringify(body) },
      ],
    }),
  })

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  })
}
