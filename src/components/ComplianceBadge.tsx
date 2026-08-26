import { PartSpec, CalcResult } from '../types'
import { IconCheck, IconAlert } from './icons'

/**
 * Brief หน้า 4 — CBAM Compliance Badge:
 *   [IconCheck] ผ่านเกณฑ์ 2026-2028  /  [IconAlert] ต้องตรวจสอบ ...
 * Derived deterministically from the calc result (no mock).
 */

/** Full badge list for a given result — exported for reuse in PdfReport. */
export function complianceItems(spec: PartSpec, cur: CalcResult) {
  const items: { ok: boolean; text: string }[] = []

  // CBAM pass/fail per year window 2026-2028
  const w = cur.cbam.filter((c) => c.year >= 2026 && c.year <= 2028)
  const allPass = w.every((c) => c.pass)
  const anyTax = w.some((c) => c.taxEur > 0)
  if (allPass) {
    items.push({ ok: true, text: 'ผ่านเกณฑ์ CBAM 2026-2028 (ต่ำกว่า EU Benchmark)' })
  } else if (!anyTax) {
    items.push({ ok: true, text: 'ไม่มีภาระ CBAM ปี 2026-2028 — embedded ต่ำกว่า Benchmark' })
  } else {
    const first = w.find((c) => c.taxEur > 0)
    items.push({
      ok: false,
      text: `Definitive Period: จ่าย CBAM จริงตั้งแต่ปี ${first?.year} — €${w.reduce((a, b) => a + b.taxEur, 0).toFixed(0)} รวมถึงปี 2028`,
    })
  }

  // Porosity risk: casting processes need ASTM E155 verification
  const isCasting = spec.processId === 2
  items.push(
    isCasting
      ? { ok: false, text: 'ต้องตรวจสอบ Porosity (ASTM E155) — กระบวนการ Casting' }
      : { ok: true, text: 'Porosity risk ต่ำ — ไม่ต้องตรวจ ASTM E155 เป็นพิเศษ' },
  )

  // MRV completeness — deterministic engine always produces all 3 scopes
  const mrvOk = cur.mrv.scope1 >= 0 && cur.mrv.scope2 >= 0 && cur.mrv.scope3 >= 0
  items.push({ ok: mrvOk, text: 'MRV ครบ 3 Scopes (Direct / Electricity / Embedded) — ISO 14040' })

  // Penalty risk per brief §1.2: reporting without actual data → importer must use
  // punitive Default Values; wrong numbers / off-methodology → fine €10-50 per tCO₂.
  const primaryData = spec.inputSource !== 'standard'
  items.push(
    primaryData
      ? { ok: true, text: 'ใช้ primary data — ลดความเสี่ยง Default Values และค่าปรับ €10-50/tCO₂' }
      : { ok: false, text: 'ยังไม่ใช้ primary data หน้าสายการผลิต — เสี่ยงโดนประเมินด้วย Default Values + ปรับ €10-50/tCO₂ หากเลขไม่ตรง methodology' },
  )

  return items
}

export function BadgeList({ items }: { items: { ok: boolean; text: string }[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className={`inline-flex items-center gap-1.5 mr-2 ${it.ok ? 'text-ok' : 'text-warn'}`}>
          {it.ok ? <IconCheck className="w-4 h-4" /> : <IconAlert className="w-4 h-4" />}
          <span className="text-[13px] font-medium">{it.text}</span>
        </div>
      ))}

    </div>
  )
}
