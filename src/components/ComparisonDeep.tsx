import { Alternative, CalcResult, PartSpec, SeedData } from '../types'
import { SOURCES } from '../data/sources'

/**
 * Deep side-by-side comparison: Current vs one AI alternative.
 * Covers materials science, environmental science, and business dimensions.
 */

const CREDIT_PRICE_THB = 220 // mid of T-VER range ~100–350 THB/tCO2

export default function ComparisonDeep({ spec, cur, alt, data }: { spec: PartSpec; cur: CalcResult; alt: Alternative; data: SeedData }) {
  const a = alt.result
  const matCur = data.materials.find((m) => m.id === spec.materialId)
  const matAlt = data.materials.find((m) => m.id === alt.spec.materialId)
  const procCur = data.processes.find((p) => p.id === spec.processId)
  const procAlt = data.processes.find((p) => p.id === alt.spec.processId)

  const co2SavedKg = cur.annualCo2 - a.annualCo2
  const co2SavedT = co2SavedKg / 1000
  const creditRevenue = Math.max(0, co2SavedT) * CREDIT_PRICE_THB

  // strength-to-weight & embodied efficiency (materials-science indices)
  const specStrengthCur = (matCur?.tensileStrength ?? 0) / (matCur?.density ?? 1)
  const specStrengthAlt = (matAlt?.tensileStrength ?? 0) / (matAlt?.density ?? 1)

  const Row = ({ label, curV, altV, better, cite }: { label: string; curV: string; altV: string; better?: 'cur' | 'alt' | 'eq'; cite?: string }) => (
    <tr className="border-t border-line">
      <td className="py-1.5 text-[13px] text-ink-mute">{label}{cite ? <span className="ml-1 text-[10px] text-accent/70">{cite}</span> : null}</td>
      <td className={`text-center text-[13px] tabular-nums ${better === 'cur' ? 'font-bold text-accent' : ''}`}>{curV}</td>
      <td className={`text-center text-[13px] tabular-nums ${better === 'alt' ? 'font-bold text-ok' : ''}`}>{altV}</td>
      <td className="text-center text-[12px]">{better === 'cur' ? '🔵 ปัจจุบันดีกว่า' : better === 'alt' ? '🟢 ทางเลือกดีกว่า' : '— เท่ากัน'}</td>
    </tr>
  )

  return (
    <div className="card">
      <div className="label mb-1">เจาะลึกเปรียบเทียบ — ปัจจุบัน vs ทางเลือก {alt.label}</div>
      <div className="text-xs text-ink-mute mb-3">{alt.note}</div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[12px] uppercase tracking-wide text-ink-mute">
              <th className="text-left font-semibold">ด้าน</th>
              <th className="text-center font-semibold w-[22%]">ปัจจุบัน</th>
              <th className="text-center font-semibold w-[22%]">ทางเลือก {alt.label}</th>
              <th className="text-center font-semibold w-[20%]">ผล</th>
            </tr>
          </thead>
          <tbody>
            {/* Materials science */}
            <tr><td colSpan={4} className="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-accent">🔬 วัสดุศาสตร์</td></tr>
            <Row label="วัสดุ" curV={matCur?.name ?? '—'} altV={matAlt?.name ?? '—'} />
            <Row label="Alloy designation" curV={matCur?.alloy ?? '—'} altV={matAlt?.alloy ?? '—'} />
            <Row label="Ultimate Strength (MPa)" curV={String(matCur?.tensileStrength ?? '—')} altV={String(matAlt?.tensileStrength ?? '—')} better={(matCur?.tensileStrength ?? 0) > (matAlt?.tensileStrength ?? 0) ? 'cur' : (matCur?.tensileStrength ?? 0) < (matAlt?.tensileStrength ?? 0) ? 'alt' : 'eq'} />
            <Row label="Yield Strength (MPa)" curV={String(matCur?.yieldStrength ?? '—')} altV={String(matAlt?.yieldStrength ?? '—')} better={(matCur?.yieldStrength ?? 0) > (matAlt?.yieldStrength ?? 0) ? 'cur' : (matCur?.yieldStrength ?? 0) < (matAlt?.yieldStrength ?? 0) ? 'alt' : 'eq'} />
            <Row label="Hardness (HB)" curV={String(matCur?.hardness ?? '—')} altV={String(matAlt?.hardness ?? '—')} />
            <Row label="Elongation (%)" curV={String(matCur?.elongation ?? '—')} altV={String(matAlt?.elongation ?? '—')} better={(matCur?.elongation ?? 0) > (matAlt?.elongation ?? 0) ? 'cur' : 'alt'} />
            <Row label="Specific Strength (kN·m/kg)" curV={specStrengthCur.toFixed(1)} altV={specStrengthAlt.toFixed(1)} better={specStrengthAlt > specStrengthCur ? 'alt' : 'cur'} cite="strength÷density" />
            <Row label="Corrosion (1–5)" curV={'★'.repeat(matCur?.corrosion ?? 0)} altV={'★'.repeat(matAlt?.corrosion ?? 0)} better={(matCur?.corrosion ?? 0) >= (matAlt?.corrosion ?? 0) ? 'cur' : 'alt'} />
            <Row label="Recycle Grade" curV={matCur?.recycleGrade ?? '—'} altV={matAlt?.recycleGrade ?? '—'} better={(matCur?.recycleGrade ?? 'D') <= (matAlt?.recycleGrade ?? 'D') ? 'cur' : 'alt'} />
            <Row label="Porosity class" curV={matCur?.porosityClass ?? '—'} altV={matAlt?.porosityClass ?? '—'} />

            {/* Process */}
            <tr><td colSpan={4} className="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-accent">🏭 กระบวนการผลิต</td></tr>
            <Row label="กระบวนการ" curV={procCur?.name ?? '—'} altV={procAlt?.name ?? '—'} />
            <Row label="Scrap rate" curV={`${((procCur?.scrapRate ?? 0) * 100).toFixed(0)}%`} altV={`${((procAlt?.scrapRate ?? 0) * 100).toFixed(0)}%`} better={(procCur?.scrapRate ?? 1) > (procAlt?.scrapRate ?? 0) ? 'alt' : 'cur'} cite="วัสดุที่ถูกทิ้ง" />
            <Row label="Energy intensity (kWh/kg)" curV={String(procCur?.energyIntensity ?? '—')} altV={String(procAlt?.energyIntensity ?? '—')} better={(procCur?.energyIntensity ?? 99) > (procAlt?.energyIntensity ?? 0) ? 'alt' : 'cur'} />
            <Row label="Tooling cost (one-time)" curV={`฿${(procCur?.toolingCostThb ?? 0).toLocaleString()}`} altV={`฿${(procAlt?.toolingCostThb ?? 0).toLocaleString()}`} />

            {/* Environmental science */}
            <tr><td colSpan={4} className="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-accent">🌍 สิ่งแวดล้อมศาสตร์</td></tr>
            <Row label="Embodied CO₂ mix" curV={`${cur.mixCo2.toFixed(2)} kg/kg`} altV={`${a.mixCo2.toFixed(2)} kg/kg`} better={a.mixCo2 < cur.mixCo2 ? 'alt' : 'cur'} cite="ICE v3.0" />
            <Row label="Gross mass used" curV={`${cur.grossMass.toFixed(2)} kg`} altV={`${a.grossMass.toFixed(2)} kg`} better={a.grossMass < cur.grossMass ? 'alt' : 'cur'} />
            <Row label="Scrap mass/yr" curV={`${(cur.scrapMass * spec.batchSize * 12).toFixed(0)} kg`} altV={`${(a.scrapMass * alt.spec.batchSize * 12).toFixed(0)} kg`} better={a.scrapMass < cur.scrapMass ? 'alt' : 'cur'} />
            <Row label="Scope 1 (direct)" curV={`${Math.round(cur.mrv.scope1)} kg`} altV={`${Math.round(a.mrv.scope1)} kg`} better={a.mrv.scope1 < cur.mrv.scope1 ? 'alt' : 'cur'} />
            <Row label="Scope 2 (electricity)" curV={`${Math.round(cur.mrv.scope2)} kg`} altV={`${Math.round(a.mrv.scope2)} kg`} better={a.mrv.scope2 < cur.mrv.scope2 ? 'alt' : 'cur'} cite="EU grid factor" />
            <Row label="Scope 3 (upstream)" curV={`${Math.round(cur.mrv.scope3)} kg`} altV={`${Math.round(a.mrv.scope3)} kg`} better={a.mrv.scope3 < cur.mrv.scope3 ? 'alt' : 'cur'} />

            {/* Business + carbon pricing */}
            <tr><td colSpan={4} className="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-accent">💰 ธุรกิจ &amp; ราคาคาร์บอน</td></tr>
            <Row label="ต้นทุน/ปี" curV={`฿${Math.round(cur.annualCost).toLocaleString()}`} altV={`฿${Math.round(a.annualCost).toLocaleString()}`} better={a.annualCost < cur.annualCost ? 'alt' : 'cur'} />
            <Row label="CBAM Tax 2028" curV={`€${cur.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}`} altV={`€${a.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}`} better={a.cbam.find((c) => c.year === 2028)?.taxEur! < cur.cbam.find((c) => c.year === 2028)?.taxEur! ? 'alt' : 'eq'} cite="No.4" />
            <Row label="Carbon Credit revenue (T-VER)" curV="—" altV={co2SavedT > 0 ? `+฿${Math.round(creditRevenue).toLocaleString()}/yr` : '—'} better={co2SavedT > 0 ? 'alt' : undefined} cite="~220฿/t" />
            <Row label="CO₂ รวม/ปี" curV={`${(cur.annualCo2 / 1000).toFixed(2)} t`} altV={`${(a.annualCo2 / 1000).toFixed(2)} t`} better={co2SavedKg > 0 ? 'alt' : 'cur'} />
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-ink-mute leading-relaxed">
        💡 <b>Carbon Tax vs Credit:</b> Tax = ภาษีที่ต้องจ่ายเมื่อปล่อยเกิน benchmark (จ่ายออก) · Credit (T-VER) = สินทรัพย์จากการลด CO₂ ที่ขายได้ (รายได้เข้า) —
        ทางเลือก {alt.label} ลด CO₂ ได้ {co2SavedT.toFixed(2)} t/yr ⇒ นอกจากประหยัดต้นทุน ยังสร้าง credit มูลค่า ~฿{Math.round(creditRevenue).toLocaleString()}/yr ได้อีก (อ้างอิงราคา T-VER ~{CREDIT_PRICE_THB} ฿/tCO₂)
        <br />Sources: {SOURCES.g4.title} · T-VER/FTIX market · {SOURCES.ice.title}
      </div>
    </div>
  )
}
