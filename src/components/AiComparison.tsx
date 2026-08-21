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
    { label: 'ปัจจุบัน', note: `${spec.partType}`, proc: procName(spec.processId), r: cur, base: true },
    ...alts.map((a) => ({
      label: a.label,
      note: a.note,
      proc: procName(a.spec.processId),
      r: a.result,
      best: a.result.annualCo2 === minAltCo2,
      base: false,
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
    ...alts.map((a, i) => ({ key: `Option ${a.label}`, r: a.result, color: ['#0075de', '#dd5b00', '#1aae39'][i % 3] })),
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
      <div className="overflow-x-auto">
        <table className="w-full text-[15px]">
          <thead className="text-ink-mute">
            <tr>
              <th className="text-left">ทางเลือก</th>
              <th>กระบวนการ</th>
              <th>CO₂/ปี</th>
              <th>ลดได้</th>
              <th>Cost/ปี</th>
              <th>CBAM 2028</th>
              <th>Payback</th>
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
                <td className="text-center text-[13px]">{row.proc}</td>
                <td className="text-center tabular-nums">{(row.r.annualCo2 / 1000).toFixed(2)} t</td>
                <td className="text-center tabular-nums text-ok">{co2Cut(row.r)}</td>
                <td className="text-center tabular-nums">฿{(row.r.annualCost / 1000).toFixed(0)}K</td>
                <td className={`text-center tabular-nums ${(row.r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0) > 0 ? 'text-bad' : 'text-ok'}`}>
                  €{row.r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}
                </td>
                <td className="text-center tabular-nums">
                  {row.base ? '—' : paybackLabel(paybackMonths(cur.annualCost, row.r.annualCost, cur.annualCo2 - row.r.annualCo2))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            const pb = paybackMonths(cur.annualCost, a.result.annualCost, cur.annualCo2 - a.result.annualCo2)
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
