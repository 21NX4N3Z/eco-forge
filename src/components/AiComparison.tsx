import { useState } from 'react'
import { Alternative, CalcResult, PartSpec, SeedData } from '../types'
import { generateAlternatives } from '../engine/optimize'
import { paybackMonths, paybackLabel } from '../utils/payback'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, Tooltip } from 'recharts'

/**
 * Brief §3.5 — full AI Comparison A/B/C table:
 * ทางเลือก / กระบวนการ / CO₂/ปี / %ลด / Cost/ปี / CBAM 2028 / Payback
 * + Radar chart. Lowest-CO2 row is highlighted.
 */
export default function AiComparison({
  spec,
  data,
  cur,
}: {
  spec: PartSpec
  data: SeedData
  cur: CalcResult
}) {
  const alts: Alternative[] = generateAlternatives(spec, data)
  const [sel, setSel] = useState<string | null>(null)

  const procName = (id: number) => data.processes.find((p) => p.id === id)?.name ?? `#${id}`

  const minAltCo2 = Math.min(...alts.map((a) => a.result.annualCo2))

  const rows = [
    { label: 'ปัจจุบัน', note: `${spec.partType}`, proc: procName(spec.processId), r: cur, base: true, toolingDeltaThb: 0 },
    ...alts.map((a) => ({
      label: a.label,
      note: a.note,
      proc: procName(a.spec.processId),
      r: a.result,
      best: a.result.annualCo2 === minAltCo2,
      base: false,
      toolingDeltaThb: a.toolingDeltaThb ?? 0,
    })),
  ]

  const co2Cut = (r: CalcResult) => {
    const pct = ((cur.annualCo2 - r.annualCo2) / cur.annualCo2) * 100
    return pct > 0.05 ? `−${pct.toFixed(0)}%` : '—'
  }

  // Radar across options: normalized (lower CO2/cost/CBAM = better = larger shape)
  const maxCo2 = Math.max(cur.annualCo2, ...alts.map((a) => a.result.annualCo2), 1)
  const maxCost = Math.max(cur.annualCost, ...alts.map((a) => a.result.annualCost), 1)
  const maxCbam = Math.max(
    cur.cbam.find((c) => c.year === 2028)?.taxEur ?? 0,
    ...alts.map((a) => a.result.cbam.find((c) => c.year === 2028)?.taxEur ?? 0),
    1,
  )
  const radarRows = [
    { key: 'Current', r: cur, color: '#a39e98' },
    ...alts.map((a, i) => ({ key: `Option ${a.label}`, r: a.result, color: ['#2e8aa8', '#dd5b00', '#1aae39'][i % 3] })),
  ]
  const radarFull = ['CO₂', 'Cost', 'CBAM'].map((m) => {
    const point: Record<string, number | string> = { metric: m }
    for (const row of radarRows) {
      let v = 0
      if (m === 'CO₂') v = 100 - (row.r.annualCo2 / maxCo2) * 100
      else if (m === 'Cost') v = 100 - (row.r.annualCost / maxCost) * 100
      else v = 100 - ((row.r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0) / maxCbam) * 100
      point[row.key] = Math.round(v)
    }
    return point
  })

  return (
      <div className="card">
        <div className="label mb-3">AI Recommendation — เปรียบเทียบทางเลือก A / B / C</div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto -mx-5 px-5 pb-2" style={{minWidth: '720px'}}>
          <table className="w-full text-[15px]">
            <thead className="text-ink-mute">
              <tr>
                <th className="text-left min-w-[140px]">ทางเลือก</th>
                <th className="min-w-[120px]">กระบวนการ</th>
                <th className="min-w-[80px]">CO₂/ปี</th>
                <th className="min-w-[70px]">ลดได้</th>
                <th className="min-w-[90px]">Cost/ปี</th>
                <th className="min-w-[100px]">CBAM 2028</th>
                <th className="min-w-[100px]">Payback</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  onClick={() => setSel(sel === row.label ? null : row.label)}
                  className={`cursor-pointer transition-colors ${'best' in row && row.best ? 'bg-surface-warm ring-1 ring-ok' : ''} ${sel === row.label ? 'bg-surface-warm' : 'hover:bg-surface-warm/60'} ${row.base ? 'text-ink-mute' : 'text-ink'}`}
                  title={'best' in row && row.best ? 'CO₂ ต่ำสุด — ทางเลือกที่ดีที่สุด' : 'คลิกเพื่อเน้นเส้นในกราฟเรดาร์'}
                >
                  <td className="py-1.5 whitespace-nowrap">
                    <span className={`font-semibold ${'best' in row && row.best ? 'text-ok' : ''}`}>
                      {row.label}{'best' in row && row.best ? ' ★' : ''}
                    </span>
                    <span className="block text-[11px] text-ink-mute font-normal">{row.note}</span>
                  </td>
                  <td className="text-center text-[13px] whitespace-nowrap">{row.proc}</td>
                  <td className="text-center tabular-nums whitespace-nowrap">{(row.r.annualCo2 / 1000).toFixed(2)} t</td>
                  <td className="text-center tabular-nums whitespace-nowrap text-ok">{co2Cut(row.r)}</td>
                  <td className="text-center tabular-nums whitespace-nowrap">฿{(row.r.annualCost / 1000).toFixed(0)}K</td>
                  <td className={`text-center tabular-nums whitespace-nowrap ${(row.r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0) > 0 ? 'text-bad' : 'text-ok'}`}>
                    €{row.r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}
                  </td>
                  <td className="text-center tabular-nums whitespace-nowrap">
                    {row.base ? '—' : paybackLabel(paybackMonths(cur.annualCost, row.r.annualCost, cur.annualCo2 - row.r.annualCo2, row.toolingDeltaThb))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card stack */}
        <div className="md:hidden space-y-2">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      onClick={() => setSel(sel === row.label ? null : row.label)}
                      className={`card cursor-pointer ${'best' in row && row.best ? 'border-ok' : ''} ${sel === row.label ? 'bg-surface-warm' : ''}`}
                      title={'best' in row && row.best ? 'CO₂ ต่ำสุด' : 'แตะเพื่อเน้นในเรดาร์'}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`font-semibold ${'best' in row && row.best ? 'text-ok' : ''}`}>
                            {row.label}{'best' in row && row.best ? ' ★' : ''}
                          </span>
                          <span className="block text-[12px] text-ink-mute">{row.note}</span>
                        </div>
                        <span className={`pill ${'best' in row && row.best ? 'pill-ok' : 'pill-accent'}`}>
                          {row.proc}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-[13px]">
                        <div className="text-center"><div className="text-ink-mute">CO₂/ปี</div><div className="tabular-nums font-medium">{(row.r.annualCo2 / 1000).toFixed(2)} t</div></div>
                        <div className="text-center"><div className="text-ink-mute">Cost/ปี</div><div className="tabular-nums font-medium">฿{(row.r.annualCost / 1000).toFixed(0)}K</div></div>
                        <div className="text-center"><div className="text-ink-mute">CBAM 2028</div><div className={`tabular-nums font-medium ${(row.r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0) > 0 ? 'text-bad' : 'text-ok'}`}>€{row.r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}</div></div>
                      </div>
                      <div className="mt-2 text-center text-[13px]">
                        {row.base ? <span className="text-ink-mute">—</span> : <span className="pill pill-accent">{paybackLabel(paybackMonths(cur.annualCost, row.r.annualCost, cur.annualCo2 - row.r.annualCo2, row.toolingDeltaThb))}</span>}
                      </div>
                      <div className="text-center text-ok text-[12px] mt-1">{co2Cut(row.r)} ลด</div>
                    </div>
                  ))}
                </div>

      {/* Multi-dimension radar (brief: Comparison Table + Radar Chart) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-ink-mute font-semibold mb-1">Radar — ยิ่งกางออก = ยิ่งดี</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarFull} outerRadius="72%">
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              {radarRows.map((row) => (
                <Radar
                  key={row.key}
                  name={row.key}
                  dataKey={row.key}
                  stroke={row.color}
                  fill={row.color}
                  fillOpacity={sel === null ? 0.15 : sel === row.key.replace('Option ', '') || row.key === 'Current' ? 0.35 : 0.04}
                  strokeWidth={sel === null ? 1.5 : 2.5}
                />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {alts.map((a) => {
            const pb = paybackMonths(cur.annualCost, a.result.annualCost, cur.annualCo2 - a.result.annualCo2, a.toolingDeltaThb)
            const best = a.result.annualCo2 === minAltCo2
            return (
              <div key={a.label} className={`card-inset ${best ? 'border-ok' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[14px]">Option {a.label}{best ? ' · CO₂ ต่ำสุด' : ''}</span>
                  <span className="pill pill-accent">{paybackLabel(pb)}</span>
                </div>
                <div className="text-xs text-ink-mute mt-1">{a.note}</div>
                <div className="text-xs mt-1 tabular-nums">
                  ลด {((cur.annualCo2 - a.result.annualCo2) / 1000).toFixed(2)} tCO₂/ปี ·
                  ต่างต้นทุน {a.result.annualCost - cur.annualCost >= 0 ? '+' : '−'}฿{Math.abs(Math.round(a.result.annualCost - cur.annualCost)).toLocaleString()}/ปี
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
