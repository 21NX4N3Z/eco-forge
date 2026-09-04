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
    ? 'คุณคือ API วิเคราะห์เอกสารโรงงาน (production log, utility bill, supplier certificate) สำหรับโปรแกรมคำนวณ CBAM ของ SME ไทย ' +
      'ตอบ ONLY strict JSON: {"summary": string, "fields": object, "insights": string[]} — ' +
      '"fields" มีได้: partType ("Bracket"|"Housing"|"Shaft"|"Flange"|"Mount"|"Custom"), netMass (kg), materialName, co2PerKg, recycledPercent, batchSize (ชิ้น/เดือน), transportDist (km). ' +
      'ถ้าไม่พบ field ไหนในเอกสารให้ละไว้ summary = 1-2 ประโยคภาษาไทย insights = สูงสุด 3 ประโยคภาษาไทย ' +
      'ห้ามใช้อีโมจิเด็ดขาด ห้าม markdown ห้ามมีข้อความนอก JSON'
    : 'คุณคือผู้ช่วยวิศวกรรมคาร์บอนสำหรับโรงงาน SME ไทยที่ต้องเจอ EU CBAM ตอบเป็นภาษาไทยเท่านั้น ' +
      'ตอบ ONLY strict JSON: {"explanation": string, "suggestion": string, "severity": "high"|"med"|"low"} — ' +
      'explanation = อธิบายอย่างละเอียด 3-5 ประโยคภาษาไทย (สาเหตุ ตัวเลขที่เกี่ยวข้อง benchmark ผลกระทบ) ' +
      'suggestion = คำแนะนำแก้ไข 2-4 ประโยคภาษาไทย (ขั้นตอนปฏิบัติจริง ทางเลือกวัสดุ/กระบวนการ ผลที่คาดว่าจะได้) ' +
      'severity = "high" ถ้าต้นทุน/CO2 เกินเกณฑ์มาก, "med" ถ้าใกล้เคียง, "low" ถ้าผ่าน ' +
      'ห้ามใช้อีโมจิเด็ดขาด ห้าม markdown ห้ามมีข้อความนอก JSON'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60000)

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'minimax/minimax-m3:free',
        max_tokens: isExtract ? 4800 : 4000,
        reasoning_effort: 'minimal',
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
