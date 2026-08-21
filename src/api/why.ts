// Embedded AI Assistant — JSON-in / JSON-out.
// Resolution order (so it "really runs" in every context):
//   1. VITE_OPENROUTER_KEY set → call OpenRouter directly from the frontend (dev/demo)
//   2. /api/why proxy           → Vercel serverless (key stays server-side, prod)
//   3. offline rule-based        → only when no network/key; reported honestly

export interface WhyRequest {
  hotspot: string
  part: string
  co2: number
  score: number
  cbam2028?: number
}

export interface WhyResponse {
  explanation: string
  suggestion: string
  severity: 'high' | 'med' | 'low'
  source: 'ai' | 'local'
}

const LOCAL_FALLBACK: Record<string, Omit<WhyResponse, 'source'>> = {
  material: {
    explanation:
      'วัสดุ dominant hotspot เนื่องจาก embodied CO₂ ของ virgin aluminum สูง (~8.24 kgCO₂/kg) คิดเป็นสัดส่วนใหญ่ของ footprint',
    suggestion: 'เปลี่ยนเป็น Al 6061 (50% Recycled) หรือใช้ recycled blend เพื่อลด embodied CO₂ ลง ~94%',
    severity: 'high',
  },
  process: {
    explanation:
      'กระบวนการ CNC from Billet มี scrap rate 70% → ต้องหลอม/ทิ้งวัสดุถึง 70% สิ้นเปลืองพลังงานและวัตถุดิบ',
    suggestion: 'พิจารณา Gravity Die Casting (scrap 12%) หรือ Extrusion + CNC (scrap 8%)',
    severity: 'high',
  },
  cbam: {
    explanation:
      'Embodied CO₂ สูงกว่า EU Benchmark ทำให้เสียภาษี CBAM หากส่งออกในปีที่มี obligation',
    suggestion: 'ลด CO₂ ให้ต่ำกว่า benchmark (2.5 t/yr) เพื่อหลีกเลี่ยง CBAM Tax ทั้งหมด',
    severity: 'high',
  },
  default: {
    explanation: 'จุดนี้ส่งผลต่อ Carbon Score โดยตรงจากสมการคำนวณ deterministic',
    suggestion: 'ปรับสไลเดอร์ใน What-If Simulator เพื่อดูผลลัพธ์แบบ real-time',
    severity: 'low',
  },
}

const SYS =
  'You are a carbon engineering assistant for Thai SME parts manufacturers facing EU CBAM. ' +
  'Reply ONLY with strict JSON: {"explanation": string, "suggestion": string, "severity": "high"|"med"|"low"}. ' +
  'Be concise and engineering-focused. No markdown, no prose outside the JSON.'

async function callOpenRouter(req: WhyRequest, key: string): Promise<WhyResponse> {
  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'stealth/ox-alpha',
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYS },
        { role: 'user', content: JSON.stringify(req) },
      ],
    }),
  })
  if (!upstream.ok) throw new Error('openrouter ' + upstream.status)
  const j = await upstream.json()
  const content = j?.choices?.[0]?.message?.content ?? ''
  const parsed = JSON.parse(content) as Omit<WhyResponse, 'source'>
  return { ...parsed, source: 'ai' }
}

export async function askWhy(req: WhyRequest): Promise<WhyResponse> {
  // 1) direct key (dev/demo)
  const key = (import.meta as any).env?.VITE_OPENROUTER_KEY
  if (key) {
    try {
      return await callOpenRouter(req, key)
    } catch {
      /* fall through */
    }
  }
  // 2) vercel proxy
  try {
    const res = await fetch('/api/why', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (res.ok) {
      const j = await res.json()
      // proxy returns raw OpenRouter envelope — unwrap choices[0].message.content
      let data: any = j
      if (!data.explanation && j?.choices?.[0]?.message?.content) {
        try {
          data = JSON.parse(String(j.choices[0].message.content).replace(/```json|```/g, '').trim())
        } catch {
          data = null
        }
      }
      if (data?.explanation && data?.suggestion) {
        return {
          explanation: String(data.explanation),
          suggestion: String(data.suggestion),
          severity: (['high', 'med', 'low'].includes(data.severity) ? data.severity : 'med'),
          source: 'ai',
        }
      }
    }
  } catch {
    /* fall through */
  }
  // 3) offline
  return { ...(LOCAL_FALLBACK[req.hotspot] ?? LOCAL_FALLBACK.default), source: 'local' }
}
