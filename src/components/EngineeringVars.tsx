import { useState } from 'react'
import { CalcResult, PartSpec, SeedData } from '../types'

/**
 * Engineering variable sheet — every input, constant, and intermediate result
 * the engine uses, with live substituted equations. For engineer users who
 * need to audit numbers, not just see charts.
 */

const n = (v: number, d = 4): string => {
  if (!Number.isFinite(v)) return '—'
  const s = Number.isInteger(v) ? String(v) : v.toFixed(d).replace(/\.?0+$/, '')
  return s.includes('.') && s.split('.')[1]?.length > 6 ? v.toPrecision(8) : s
}

type SheetKey = 'vars' | 'eq' | 'cbam' | 'mrv'

export default function EngineeringVars({ spec, data, cur }: { spec: PartSpec; data: SeedData; cur: CalcResult }) {
  const [sheet, setSheet] = useState<SheetKey>('vars')
  const [copied, setCopied] = useState(false)

  const mat = data.materials.find((m) => m.id === spec.materialId)
  const proc = data.processes.find((p) => p.id === spec.processId)
  const recMat = mat ? data.materials.find((m) => m.id === mat.id + 1 && /recycled/i.test(m.name)) : undefined
  const xRec = Math.max(0, Math.min(100, spec.recycledPercent)) / 100
  const TRANSPORT_FACTOR = 0.0001
  const SCORE_MAX = 6000
  const annualParts = spec.batchSize * 12

  const efMix = cur.mixCo2
  const eMat = cur.materialCo2
  const eEnergy = cur.energyCo2
  const eProc = cur.procCo2
  const eTrans = cur.transportCo2
  const taxableT = (cur.directOnly ? cur.mrv.scope1 + eTrans * annualParts : cur.annualCo2) / 1000

  const VARS_ROWS: [string, string, string, string, string][] = [
    ['m_net', 'Net mass — มวลสุทธิชิ้นงาน', n(spec.netMass), 'kg', 'ผู้ใช้ป้อน'],
    ['r_scrap', 'Scrap rate ของกระบวนการ', n(proc?.scrapRate ?? 0, 4), '—', `Process: ${proc?.name ?? '—'}`],
    ['m_gross', 'Gross mass = มวลก่อนขึ้นรูป', n(cur.grossMass), 'kg', 'derived'],
    ['m_scrap', 'Scrap mass', n(cur.scrapMass), 'kg', 'derived'],
    ['EF_mat', 'Emission factor วัสดุหลัก (virgin)', n(mat?.emissionFactor ?? 0), 'kgCO₂/kg', `Material: ${mat?.name ?? '—'}`],
    ...(recMat ? ([['EF_rec', 'Emission factor วัสดุรีไซเคิล', n(recMat.emissionFactor), 'kgCO₂/kg', `Material: ${recMat.name}`]] as [string, string, string, string, string][]) : []),
    ['x_rec', 'สัดส่วน recycled content', n(spec.recycledPercent / 100, 2), '—', 'ผู้ใช้ป้อน'],
    ['EF_mix', 'Emission factor เฉลี่ยของ blend', n(efMix), 'kgCO₂/kg', 'computed'],
    ['E_int', 'Energy intensity กระบวนการ', n(proc?.energyIntensity ?? 0), 'kWh/kg', `Process: ${proc?.name ?? '—'}`],
    ['G_grid', 'Grid emission factor (ไฟฟ้าไทย)', n(data.gridFactor, 3), 'kgCO₂/kWh', 'Grid DB'],
    ['e_proc', 'Direct process emission (Scope 1)', n(proc?.procEmission ?? 0), 'kgCO₂/kg', `Process: ${proc?.name ?? '—'}`],
    ['d_tr', 'ระยะทางขนส่ง', n(spec.transportDist), 'km', 'ผู้ใช้ป้อน'],
    ['f_tr', 'Road freight factor (conservative)', String(TRANSPORT_FACTOR), 'kgCO₂/kg·km', 'ค่าคงที่'],
    ['N_b', 'Batch size', n(spec.batchSize), 'pcs/เดือน', 'ผู้ใช้ป้อน'],
    ['N_y', 'ผลิตต่อปี = N_b × 12', n(annualParts), 'pcs/ปี', 'derived'],
    ['C_mat', 'ต้นทุนวัสดุ', n(mat?.costPerKg ?? 0, 2), '฿/kg', `Material: ${mat?.name ?? '—'}`],
    ['C_proc', 'ต้นทุนกระบวนการเพิ่ม', n(proc?.extraCostPerKg ?? 0, 2), '฿/kg', `Process: ${proc?.name ?? '—'}`],
    ['B_CN', `EU Benchmark (route L) ${spec.cnCode ? `CN ${spec.cnCode}` : '(default fallback)'}`, n(cur.benchmark, 3), 'tCO₂e/t', 'EU Annex II'],
    ['DV_TH', 'Thailand Default Value fallback', cur.dvTh != null ? n(cur.dvTh, 3) : '— (ไม่มีในตาราง)', 'tCO₂e/t', 'TGO/DV'],
  ]

  const EQ_ROWS: [string, string][] = [
    ['m_gross = m_net / (1 − r_scrap)', `= ${n(spec.netMass)} / (1 − ${n(proc?.scrapRate ?? 0, 4)}) = ${n(cur.grossMass)} kg`],
    [
      recMat && xRec > 0
        ? 'EF_mix = x_rec·EF_rec + (1−x_rec)·EF_mat'
        : 'EF_mix = EF_mat',
      recMat && xRec > 0
        ? `= ${n(xRec, 2)}·${n(recMat.emissionFactor)} + ${n(1 - xRec, 2)}·${n(mat?.emissionFactor ?? 0)} = ${n(efMix)} kgCO₂/kg`
        : `= ${n(efMix)} kgCO₂/kg`,
    ],
    ['E_material = m_gross × EF_mix', `= ${n(cur.grossMass)} × ${n(efMix)} = ${n(eMat)} kgCO₂/part`],
    ['E_energy = m_gross × E_int × G_grid', `= ${n(cur.grossMass)} × ${n(proc?.energyIntensity ?? 0)} × ${n(data.gridFactor, 3)} = ${n(eEnergy)} kgCO₂/part`],
    ['E_process = m_gross × e_proc', `= ${n(cur.grossMass)} × ${n(proc?.procEmission ?? 0)} = ${n(eProc)} kgCO₂/part`],
    ['E_transport = m_gross × d_tr × f_tr', `= ${n(cur.grossMass)} × ${n(spec.transportDist)} × ${TRANSPORT_FACTOR} = ${n(eTrans)} kgCO₂/part`],
    ['E_part = Σ(E_material…E_transport)', `= ${n(eMat)} + ${n(eEnergy)} + ${n(eProc)} + ${n(eTrans)} = ${n(cur.perPartCo2)} kgCO₂/part`],
    ['E_annual = E_part × N_y', `= ${n(cur.perPartCo2)} × ${n(annualParts)} = ${n(cur.annualCo2, 2)} kgCO₂/yr (${n(cur.annualCo2 / 1000, 3)} t)`],
    ['Cost_annual = m_gross × (C_mat + C_proc) × N_y', `= ${n(cur.grossMass)} × (${n(mat?.costPerKg ?? 0, 2)} + ${n(proc?.extraCostPerKg ?? 0, 2)}) × ${n(annualParts)} = ${n(cur.annualCost, 0)} ฿/yr`],
    ['Score = clamp(100 × (1 − E_annual / 6000))', `= 100 × (1 − ${n(cur.annualCo2, 0)}/6000) = ${cur.score} /100`],
  ]

  const MRV_ROWS: [string, string, string, string][] = [
    ['Scope 1 — Direct process', 'e_proc × N_y', `${n(eProc)} × ${n(annualParts)}`, `${n(cur.mrv.scope1, 1)} kgCO₂/yr`],
    ['Scope 2 — Purchased electricity', 'm_gross × E_int × G_grid × N_y', `${n(eEnergy)} × ${n(annualParts)}`, `${n(cur.mrv.scope2, 1)} kgCO₂/yr`],
    ['Scope 3 — Material + transport', '(E_mat + E_tr) × N_y', `(${n(eMat)} + ${n(eTrans)}) × ${n(annualParts)}`, `${n(cur.mrv.scope3, 1)} kgCO₂/yr`],
  ]

  const dumpText = (): string => {
    if (sheet === 'vars') return VARS_ROWS.map(([s, nm, v, u, src]) => `${s} (${nm}) = ${v} ${u}   [${src}]`).join('\n')
    if (sheet === 'eq') return EQ_ROWS.map(([eq, sub]) => `${eq}\n  ${sub}`).join('\n\n')
    if (sheet === 'mrv') return MRV_ROWS.map(([a, b, c, d]) => `${a}: ${b} = ${c} = ${d}`).join('\n')
    return cur.cbam.map((c) => `${c.year}: φ=${c.obligation} ETS=${data.cbamRates.find((r) => r.year === c.year)?.etsPriceEur ?? '—'} €/t → €${c.taxEur}/yr${c.pass ? ' PASS' : ''}`).join('\n')
  }

  const copy = () => {
    navigator.clipboard.writeText(dumpText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  const SHEETS: { k: SheetKey; label: string }[] = [
    { k: 'vars', label: 'ตัวแปรนำเข้า' },
    { k: 'eq', label: 'สมการแทนค่า' },
    { k: 'cbam', label: 'CBAM 2026–2034' },
    { k: 'mrv', label: 'MRV Scopes' },
  ]

  return (
    <div className="card">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="label">Engineering Variable Sheet</span>
        <span className="text-xs text-ink-mute">ทุกตัวเลขบนจอ trace กลับมาที่นี่ได้</span>
        <button className="ml-auto btn text-[11px]" onClick={copy}>{copied ? '✓ copied' : 'copy sheet'}</button>
      </div>

      <div className="flex gap-1 mb-3">
        {SHEETS.map((s) => (
          <button key={s.k} className={`btn text-[12px] px-2 py-1 ${sheet === s.k ? 'btn-active' : ''}`} onClick={() => setSheet(s.k)}>
            {s.label}
          </button>
        ))}
      </div>

      {sheet === 'vars' && (
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
            {VARS_ROWS.map(([sym, name, val, unit, src]) => (
              <tr key={sym} className="border-t border-line">
                <td className="py-1 font-mono font-semibold text-accent whitespace-nowrap">{sym}</td>
                <td>{name}</td>
                <td className="text-right tabular-nums font-semibold whitespace-nowrap">{val}</td>
                <td className="pl-2 text-ink-mute whitespace-nowrap">{unit}</td>
                <td className="pl-2 text-[12px] text-ink-mute">{src}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {sheet === 'eq' && (
        <table className="w-full text-[13px]">
          <tbody>
            {EQ_ROWS.map(([eq, sub], i) => (
              <tr key={i} className="border-t border-line align-top">
                <td className="py-1.5 pr-3 font-mono text-accent whitespace-nowrap">{eq}</td>
                <td className="py-1.5 tabular-nums break-all">{sub}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {sheet === 'cbam' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[13px] mb-3">
            <div><span className="text-ink-mute">Taxable base</span><div className="tabular-nums font-semibold">{n(taxableT, 3)} tCO₂/yr{cur.directOnly && ' (direct only)'}</div></div>
            <div><span className="text-ink-mute">Benchmark B (route L)</span><div className="tabular-nums font-semibold">{n(cur.benchmark, 3)} tCO₂e/t</div></div>
            <div><span className="text-ink-mute">Excess = max(0, E_t − B)</span><div className={`tabular-nums font-semibold ${taxableT > cur.benchmark ? 'text-bad' : 'text-ok'}`}>{n(Math.max(0, taxableT - cur.benchmark), 3)} t</div></div>
            <div><span className="text-ink-mute">De minimis (&lt;50 t/yr)</span><div className={`font-semibold ${cur.deMinimis ? 'text-ok' : ''}`}>{cur.deMinimis ? 'EXEMPT' : 'liable'}</div></div>
          </div>
          <table className="w-full text-[13px]">
            <thead className="text-ink-mute">
              <tr>
                <th className="text-left py-1">ปี</th>
                <th className="text-right">Factor φ_y</th>
                <th className="text-right">ETS €/t</th>
                <th className="text-right">Tax €/yr</th>
                <th className="text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {cur.cbam.map((c) => (
                <tr key={c.year} className="border-t border-line">
                  <td className="py-1 font-semibold">{c.year}</td>
                  <td className="text-right tabular-nums">{c.obligation}</td>
                  <td className="text-right tabular-nums">{data.cbamRates.find((r) => r.year === c.year)?.etsPriceEur ?? '—'}</td>
                  <td className={`text-right tabular-nums font-semibold ${c.taxEur > 0 ? 'text-bad' : 'text-ok'}`}>{c.taxEur.toFixed(2)}</td>
                  <td className={`text-center text-[12px] font-semibold ${c.pass ? 'text-ok' : 'text-bad'}`}>{c.pass ? 'PASS' : 'TAXABLE'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[12px] text-ink-mute font-mono">Tax_y = max(0, E_taxable − B_CN) × ETS_y × φ_y · φ: 2.5% (2026) → 100% (2034)</div>
        </>
      )}

      {sheet === 'mrv' && (
        <table className="w-full text-[13px]">
          <thead className="text-ink-mute">
            <tr>
              <th className="text-left py-1">ขอบเขต</th>
              <th className="text-left">สมการ</th>
              <th className="text-right">แทนค่า</th>
              <th className="text-right">ผลลัพธ์</th>
            </tr>
          </thead>
          <tbody>
            {MRV_ROWS.map(([scope, eq, sub, res]) => (
              <tr key={scope} className="border-t border-line">
                <td className="py-1.5 pr-2 font-semibold whitespace-nowrap">{scope}</td>
                <td className="pr-3 font-mono text-[12px] text-accent whitespace-nowrap">{eq}</td>
                <td className="text-right tabular-nums whitespace-nowrap">{sub}</td>
                <td className="text-right tabular-nums font-semibold whitespace-nowrap">{res}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
