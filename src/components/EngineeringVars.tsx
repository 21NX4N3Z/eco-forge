import { useState } from 'react'
import { CalcResult, PartSpec, SeedData } from '../types'

/**
 * Per-KPI engineering drill-down: each KPI card opens ONLY the variables and
 * substituted equations behind that one number — nothing else.
 */

export type VarFocus = 'score' | 'co2' | 'cost' | 'cbam' | 'credit'

const n = (v: number, d = 4): string => {
  if (!Number.isFinite(v)) return '—'
  const s = Number.isInteger(v) ? String(v) : v.toFixed(d).replace(/\.?0+$/, '')
  return s.includes('.') && s.split('.')[1]?.length > 6 ? v.toPrecision(8) : s
}

const TRANSPORT_FACTOR = 0.0001
const SCORE_MAX = 6000
const TVER_PRICE_THB = 220 // ฿/tCO₂ — Thai voluntary market reference price

type Row = [string, string, string, string, string] // sym, desc, val, unit, source
type Eq = [string, string] // equation, substituted

const TITLE: Record<VarFocus, string> = {
  score: 'Carbon Score',
  co2: 'CO₂ / ปี',
  cost: 'ต้นทุน / ปี',
  cbam: 'CBAM Tax',
  credit: 'Credit Revenue (T-VER)',
}

export default function EngineeringVars({ spec, data, cur, focus, bestAnnualCo2 }: { spec: PartSpec; data: SeedData; cur: CalcResult; focus: VarFocus; bestAnnualCo2?: number }) {
  const [copied, setCopied] = useState(false)

  const mat = data.materials.find((m) => m.id === spec.materialId)
  const proc = data.processes.find((p) => p.id === spec.processId)
  const recMat = mat ? data.materials.find((m) => m.id === mat.id + 1 && /recycled/i.test(m.name)) : undefined
  const xRec = Math.max(0, Math.min(100, spec.recycledPercent)) / 100
  const annualParts = spec.batchSize * 12
  const taxableT = (cur.directOnly ? cur.mrv.scope1 + cur.transportCo2 * annualParts : cur.annualCo2) / 1000
  const ets2028 = data.cbamRates.find((r) => r.year === 2028)?.etsPriceEur ?? 0
  const phi2028 = cur.cbam.find((c) => c.year === 2028)?.obligation ?? 0

  let rows: Row[] = []
  let eqs: Eq[] = []
  let extra: 'cbam' | null = null

  if (focus === 'score') {
    rows = [
      ['E_annual', 'CO₂ รวมต่อปีของชิ้นงาน', n(cur.annualCo2, 2), 'kgCO₂/yr', 'computed'],
      ['S_max', 'ค่า benchmark แย่สุดที่ใช้ normalize', String(SCORE_MAX), 'kgCO₂/yr', 'ค่าคงที่'],
    ]
    eqs = [
      ['Score = clamp₀₁₀₀(100 × (1 − E_annual / S_max))', `= 100 × (1 − ${n(cur.annualCo2, 0)} / ${SCORE_MAX}) = ${cur.score} /100`],
    ]
  }

  if (focus === 'co2') {
    rows = [
      ['m_net', 'Net mass', n(spec.netMass), 'kg', 'ผู้ใช้ป้อน'],
      ['r_scrap', 'Scrap rate', n(proc?.scrapRate ?? 0, 4), '—', `Process: ${proc?.name ?? '—'}`],
      ['m_gross', 'Gross mass', n(cur.grossMass), 'kg', 'derived'],
      ['EF_mat', 'EF วัสดุหลัก', n(mat?.emissionFactor ?? 0), 'kgCO₂/kg', `Material: ${mat?.name ?? '—'}`],
      ...(recMat ? ([['EF_rec', 'EF วัสดุรีไซเคิล', n(recMat.emissionFactor), 'kgCO₂/kg', `Material: ${recMat.name}`]] as Row[]) : []),
      ['x_rec', 'Recycled content', n(spec.recycledPercent / 100, 2), '—', 'ผู้ใช้ป้อน'],
      ['EF_mix', 'EF เฉลี่ยของ blend', n(cur.mixCo2), 'kgCO₂/kg', 'computed'],
      ['E_int', 'Energy intensity', n(proc?.energyIntensity ?? 0), 'kWh/kg', `Process: ${proc?.name ?? '—'}`],
      ['G_grid', 'Grid factor (ไทย)', n(data.gridFactor, 3), 'kgCO₂/kWh', 'Grid DB'],
      ['e_proc', 'Direct process emission', n(proc?.procEmission ?? 0), 'kgCO₂/kg', `Process: ${proc?.name ?? '—'}`],
      ['d_tr', 'ระยะขนส่ง', n(spec.transportDist), 'km', 'ผู้ใช้ป้อน'],
      ['f_tr', 'Road freight factor', String(TRANSPORT_FACTOR), 'kgCO₂/kg·km', 'ค่าคงที่'],
      ['N_y', 'ผลิตต่อปี', n(annualParts), 'pcs/ปี', 'derived'],
    ]
    eqs = [
      ['m_gross = m_net / (1 − r_scrap)', `= ${n(spec.netMass)} / (1 − ${n(proc?.scrapRate ?? 0, 4)}) = ${n(cur.grossMass)} kg`],
      [
        recMat && xRec > 0 ? 'EF_mix = x_rec·EF_rec + (1−x_rec)·EF_mat' : 'EF_mix = EF_mat',
        recMat && xRec > 0
          ? `= ${n(xRec, 2)}·${n(recMat.emissionFactor)} + ${n(1 - xRec, 2)}·${n(mat?.emissionFactor ?? 0)} = ${n(cur.mixCo2)}`
          : `= ${n(cur.mixCo2)} kgCO₂/kg`,
      ],
      ['E_material = m_gross × EF_mix', `= ${n(cur.grossMass)} × ${n(cur.mixCo2)} = ${n(cur.materialCo2)} kgCO₂/part`],
      ['E_energy = m_gross × E_int × G_grid', `= ${n(cur.grossMass)} × ${n(proc?.energyIntensity ?? 0)} × ${n(data.gridFactor, 3)} = ${n(cur.energyCo2)} kgCO₂/part`],
      ['E_process = m_gross × e_proc', `= ${n(cur.grossMass)} × ${n(proc?.procEmission ?? 0)} = ${n(cur.procCo2)} kgCO₂/part`],
      ['E_transport = m_gross × d_tr × f_tr', `= ${n(cur.grossMass)} × ${n(spec.transportDist)} × ${TRANSPORT_FACTOR} = ${n(cur.transportCo2)} kgCO₂/part`],
      ['E_part = Σ(E_material…E_transport)', `= ${n(cur.perPartCo2)} kgCO₂/part`],
      ['E_annual = E_part × N_y', `= ${n(cur.perPartCo2)} × ${n(annualParts)} = ${n(cur.annualCo2, 2)} kgCO₂/yr (${n(cur.annualCo2 / 1000, 3)} t)`],
    ]
  }

  if (focus === 'cost') {
    rows = [
      ['m_gross', 'Gross mass (มี scrap รวม)', n(cur.grossMass), 'kg', 'derived'],
      ['C_mat', 'ราคาวัสดุ', n(mat?.costPerKg ?? 0, 2), '฿/kg', `Material: ${mat?.name ?? '—'}`],
      ['C_proc', 'ค่ากระบวนการเพิ่ม', n(proc?.extraCostPerKg ?? 0, 2), '฿/kg', `Process: ${proc?.name ?? '—'}`],
      ['N_y', 'ผลิตต่อปี', n(annualParts), 'pcs/ปี', 'derived'],
    ]
    eqs = [
      ['Cost_part = m_gross × (C_mat + C_proc)', `= ${n(cur.grossMass)} × (${n(mat?.costPerKg ?? 0, 2)} + ${n(proc?.extraCostPerKg ?? 0, 2)}) = ${n(cur.grossMass * ((mat?.costPerKg ?? 0) + (proc?.extraCostPerKg ?? 0)), 2)} ฿/part`],
      ['Cost_annual = Cost_part × N_y', `= ${n(cur.annualCost, 0)} ฿/yr`],
    ]
  }

  if (focus === 'cbam') {
    rows = [
      ['E_taxable', 'ฐานภาษี (direct-only ถ้า Annex II)', n(taxableT, 3), 'tCO₂/yr', cur.directOnly ? 'Scope1 + transport' : '= E_annual'],
      ['B_CN', `EU Benchmark route L${spec.cnCode ? ` · CN ${spec.cnCode}` : ''}`, n(cur.benchmark, 3), 'tCO₂e/t', 'EU Annex'],
      ['ETS₂₈', 'ราคา ETS ปี 2028', n(ets2028, 0), '€/t', 'CbamRate'],
      ['φ₂₈', 'CBAM factor ปี 2028', n(phi2028, 3), '—', '2.5%→100% by year'],
    ]
    eqs = [
      ['Excess = max(0, E_taxable − B_CN)', `= max(0, ${n(taxableT, 3)} − ${n(cur.benchmark, 3)}) = ${n(Math.max(0, taxableT - cur.benchmark), 3)} t`],
      ['Tax₂₀₂₈ = Excess × ETS₂₈ × φ₂₈', `= ${cur.cbam.find((c) => c.year === 2028)?.taxEur.toFixed(2) ?? '0'} €/yr`],
    ]
    extra = 'cbam'
  }

  if (focus === 'credit') {
    rows = [
      ['E_cur', 'CO₂ ปัจจุบัน', n(cur.annualCo2 / 1000, 3), 'tCO₂/yr', 'computed'],
      ['E_best', 'CO₂ ของ Option ดีที่สุด', bestAnnualCo2 != null ? n(bestAnnualCo2 / 1000, 3) : '—', 'tCO₂/yr', 'engine optimize'],
      ['P_tver', 'ราคาเครดิต T-VER (อ้างอิง)', String(TVER_PRICE_THB), '฿/tCO₂', 'ค่าคงที่'],
    ]
    eqs = [
      ['ΔE = E_cur − E_best', `= ${bestAnnualCo2 != null ? n((cur.annualCo2 - bestAnnualCo2) / 1000, 3) : '—'} tCO₂/yr`],
      ['Revenue = ΔE × P_tver', bestAnnualCo2 != null && cur.annualCo2 > bestAnnualCo2 ? `= ${n(((cur.annualCo2 - bestAnnualCo2) / 1000) * TVER_PRICE_THB, 0)} ฿/yr` : '= — (current already optimal)'],
    ]
  }

  const dump = () =>
    `${TITLE[focus]} — variable sheet\n` +
    rows.map(([s, d, v, u, src]) => `${s} (${d}) = ${v} ${u}  [${src}]`).join('\n') +
    '\n\n' +
    eqs.map(([e, s]) => `${e}\n  ${s}`).join('\n')

  const copy = () => {
    navigator.clipboard.writeText(dump()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="label">{TITLE[focus]} — ตัวแปรเบื้องหลัง</span>
        <button className="ml-auto btn text-[11px]" onClick={copy}>{copied ? '✓ copied' : 'copy'}</button>
      </div>

      <table className="w-full text-[13px]">
        <thead className="text-ink-mute">
          <tr>
            <th className="text-left py-1">สัญลักษณ์</th>
            <th className="text-left">คำอธิบาย</th>
            <th className="text-right">ค่า</th>
            <th className="text-left pl-2">หน่วย</th>
            <th className="text-left pl-2">ที่มา</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([sym, desc, val, unit, src]) => (
            <tr key={sym} className="border-t border-line">
              <td className="py-1 font-mono font-semibold text-accent whitespace-nowrap">{sym}</td>
              <td>{desc}</td>
              <td className="text-right tabular-nums font-semibold whitespace-nowrap">{val}</td>
              <td className="pl-2 text-ink-mute whitespace-nowrap">{unit}</td>
              <td className="pl-2 text-[12px] text-ink-mute">{src}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="w-full text-[13px]">
        <tbody>
          {eqs.map(([eq, sub], i) => (
            <tr key={i} className="border-t border-line align-top">
              <td className="py-1.5 pr-3 font-mono text-accent whitespace-nowrap">{eq}</td>
              <td className="py-1.5 tabular-nums break-all">{sub}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {extra === 'cbam' && (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
            <div><span className="text-ink-mute">De minimis (&lt;50 t/yr)</span><div className={`font-semibold ${cur.deMinimis ? 'text-ok' : ''}`}>{cur.deMinimis ? 'EXEMPT' : 'liable'}</div></div>
            <div><span className="text-ink-mute">DV Thailand fallback</span><div className="tabular-nums font-semibold">{cur.dvTh != null ? `${n(cur.dvTh, 3)} tCO₂e/t` : '—'}</div></div>
          </div>
          <table className="w-full text-[13px]">
            <thead className="text-ink-mute">
              <tr>
                <th className="text-left py-1">ปี</th>
                <th className="text-right">φ_y</th>
                <th className="text-right">ETS €/t</th>
                <th className="text-right">Tax €/yr</th>
              </tr>
            </thead>
            <tbody>
              {cur.cbam.map((c) => (
                <tr key={c.year} className={`border-t border-line ${c.year === 2028 ? 'bg-accent/5 font-semibold' : ''}`}>
                  <td className="py-1">{c.year}{c.year === 2028 && <span className="ml-1 text-[11px] text-accent">← KPI นี้</span>}</td>
                  <td className="text-right tabular-nums">{c.obligation}</td>
                  <td className="text-right tabular-nums">{data.cbamRates.find((r) => r.year === c.year)?.etsPriceEur ?? '—'}</td>
                  <td className={`text-right tabular-nums ${c.taxEur > 0 ? 'text-bad' : 'text-ok'}`}>{c.taxEur.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
