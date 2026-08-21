// Embedded AI Assistant — JSON-in / JSON-out via Vercel serverless proxy.
// Falls back to a local rule-based explainer so the demo never needs the network.

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
}

const LOCAL_FALLBACK: Record<string, WhyResponse> = {
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

export async function askWhy(req: WhyRequest): Promise<WhyResponse> {
  try {
    const useApi = (import.meta as any).env?.VITE_USE_API_WHY === 'true'
    if (useApi) {
      const res = await fetch('/api/why', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req),
      })
      if (res.ok) return (await res.json()) as WhyResponse
    }
    throw new Error('local')
  } catch {
    return LOCAL_FALLBACK[req.hotspot] ?? LOCAL_FALLBACK.default
  }
}
