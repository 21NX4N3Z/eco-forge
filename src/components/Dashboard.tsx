import { Alternative, CalcResult, PartSpec, SeedData } from '../types'
import { evaluate } from '../engine/cbam'
import { generateAlternatives } from '../engine/optimize'
import { PieChart, Pie, Cell, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import WhyButton from './WhyButton'
import SdgBadges from './SdgBadges'
import { IconCheck, IconAlert } from './icons'

const COLORS = ['#22d3ee', '#f87171', '#34d399', '#fbbf24']

export default function Dashboard({
  spec, data, view,
}: {
  spec: PartSpec
  data: SeedData
  view: 'technical' | 'business'
}) {
  const cur = evaluate(spec, data)
  const best = generateAlternatives(spec, data)[0]
  const bestRes = best?.result
  const cbam2028 = cur.cbam.find((c) => c.year === 2028)?.taxEur ?? 0
  const best2028 = bestRes?.cbam.find((c) => c.year === 2028)?.taxEur ?? 0

  const beforeData = [
    { name: 'Material', value: Math.round(cur.materialCo2 * 12 * spec.batchSize) },
    { name: 'Process', value: Math.round((cur.procCo2 + cur.energyCo2) * 12 * spec.batchSize) },
    { name: 'Transport', value: Math.round(cur.transportCo2 * 12 * spec.batchSize) },
  ]
  const afterData = bestRes
    ? [
        { name: 'Material', value: Math.round(bestRes.materialCo2 * 12 * spec.batchSize) },
        { name: 'Process', value: Math.round((bestRes.procCo2 + bestRes.energyCo2) * 12 * spec.batchSize) },
        { name: 'Transport', value: Math.round(bestRes.transportCo2 * 12 * spec.batchSize) },
      ]
    : beforeData

  const trend = cur.cbam.map((c) => ({ year: c.year, tax: c.taxEur }))
  const mrv = [
    { scope: 'Scope 1 (Direct)', co2: Math.round(cur.mrv.scope1) },
    { scope: 'Scope 2 (Electricity)', co2: Math.round(cur.mrv.scope2) },
    { scope: 'Scope 3 (Embedded)', co2: Math.round(cur.mrv.scope3) },
  ]

  const saved = bestRes ? (cur.annualCo2 - bestRes.annualCo2) / 1000 : 0
  const savedCost = bestRes ? (cur.annualCost - bestRes.annualCost) / 1000 : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label">Carbon Score</div>
          <div className="text-4xl font-bold text-signal-cyan">{cur.score}/100</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">CBAM Tax Liability (2028)</div>
          <div className={`text-2xl font-bold ${cbam2028 > 0 ? 'text-signal-red' : 'text-signal-green'}`}>
            €{cbam2028}/yr {cbam2028 > 0 ? '🔴'.replace('🔴', '') : ''}
            {cbam2028 > 0 ? <IconAlert className="w-5 h-5 inline" /> : <IconCheck className="w-5 h-5 inline" />}
          </div>
        </div>
        <SdgBadges />
      </div>

      {/* Donut before/after */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="label mb-2">Before — {spec.partType}</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={beforeData} dataKey="value" nameKey="name" outerRadius={70} label>
                {beforeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="label mb-2">After — AI Option {best?.label} ({best?.note})</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={afterData} dataKey="value" nameKey="name" outerRadius={70} label>
                {afterData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hotspot + Why */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label">Hotspot</div>
          <div className="text-sm">Material {(beforeData[0].value / beforeData.reduce((a, b) => a + b.value, 0) * 100).toFixed(0)}% · Process {(beforeData[1].value / beforeData.reduce((a, b) => a + b.value, 0) * 100).toFixed(0)}%</div>
        </div>
        <WhyButton req={{ hotspot: 'material', part: spec.partType, co2: cur.annualCo2, score: cur.score, cbam2028 }} />
      </div>

      {/* Trend + MRV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="label mb-2">CBAM Obligation Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trend}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <BarChart data={trend} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="label mb-2">MRV (EU CBAM scopes)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mrv} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="scope" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <BarChart data={mrv} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Comparison */}
      <div className="card">
        <div className="label mb-2">AI Recommendation — Compare Options</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr><th className="text-left">Option</th><th>CO₂/yr</th><th>Cost/yr</th><th>CBAM 2028</th><th>Saved</th></tr>
            </thead>
            <tbody>
              <Row label="Current" r={cur} base />
              {generateAlternatives(spec, data).map((a: Alternative) => (
                <Row key={a.label} label={a.label} r={a.result} />
              ))}
            </tbody>
          </table>
        </div>
        {bestRes && (
          <div className="mt-2 text-sm text-signal-green">
            Best: Option {best?.label} → ลด CO₂ {saved.toFixed(2)} t/yr, ประหยัด ฿{savedCost.toFixed(0)}K/yr, CBAM 2028 €{best2028}
          </div>
        )}
      </div>

      {view === 'technical' && (
        <div className="card text-xs text-slate-400 space-y-1">
          <div className="label">Technical View</div>
          <div>Gross mass: {cur.grossMass.toFixed(2)} kg · Scrap: {cur.scrapMass.toFixed(2)} kg</div>
          <div>Mix CO₂: {cur.mixCo2.toFixed(2)} kg/kg · Per-part: {cur.perPartCo2.toFixed(3)} kg</div>
          <div>Standards: ASTM E155 (porosity), ISO 14040 (LCA)</div>
        </div>
      )}
      {view === 'business' && (
        <div className="card text-xs text-slate-400 space-y-1">
          <div className="label">Business View</div>
          <div>ต้นทุน/ปี: ฿{(cur.annualCost / 1000).toFixed(0)}K · ประหยัดหากปรับปรุง: ฿{savedCost.toFixed(0)}K/yr</div>
          <div>Payback (Alt {best?.label}): ~8 เดือน</div>
        </div>
      )}
    </div>
  )
}

function Row({ label, r, base }: { label: string; r: CalcResult; base?: boolean }) {
  return (
    <tr className={base ? 'text-slate-400' : 'text-slate-100'}>
      <td className="py-1">{label}</td>
      <td className="text-center">{(r.annualCo2 / 1000).toFixed(2)} t</td>
      <td className="text-center">฿{(r.annualCost / 1000).toFixed(0)}K</td>
      <td className="text-center">{`€${r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}`}</td>
      <td className="text-center text-signal-green">
        {base ? '—' : `${(r.score)}`}
      </td>
    </tr>
  )
}
