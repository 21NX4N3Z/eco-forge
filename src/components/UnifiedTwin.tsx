import { useState } from 'react'
import { PartSpec, SeedData } from '../types'
import { evaluate } from '../engine/cbam'
import { generateAlternatives } from '../engine/optimize'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import WhyButton from './WhyButton'
import SdgBadges from './SdgBadges'
import { IconCheck, IconAlert } from './icons'

const COLORS = ['#0075de', '#dd5b00', '#1aae39', '#a39e98']

type ChartKey = 'donut' | 'trend' | 'mrv' | 'radar' | 'strength'

export default function UnifiedTwin({ spec, setSpec, data }: { spec: PartSpec; setSpec: (s: PartSpec) => void; data: SeedData }) {
  const set = (p: Partial<PartSpec>) => setSpec({ ...spec, ...p })
  const [charts, setCharts] = useState<Record<ChartKey, boolean>>({
    donut: true, trend: true, mrv: true, radar: true, strength: true,
  })
  const toggle = (k: ChartKey) => setCharts((c) => ({ ...c, [k]: !c[k] }))
  const [types, setTypes] = useState<{ breakdown: 'pie' | 'bar' | 'line'; trend: 'bar' | 'line'; mrv: 'h' | 'v'; radar: 'radar' | 'bar'; strength: 'bar' | 'line' }>({
    breakdown: 'pie', trend: 'bar', mrv: 'h', radar: 'radar', strength: 'bar',
  })
  const setType = (k: keyof typeof types, v: any) => setTypes((t) => ({ ...t, [k]: v }))
  const [curSym, setCurSym] = useState<'THB' | 'EUR' | 'USD' | 'JPY' | 'CNY' | 'GBP' | 'SGD'>('THB')
  const RATES: Record<string, number> = { THB: 1, EUR: 0.026, USD: 0.028, JPY: 4.3, CNY: 0.20, GBP: 0.022, SGD: 0.038 }
  const SYM: Record<string, string> = { THB: '฿', EUR: '€', USD: '$', JPY: '¥', CNY: '¥', GBP: '£', SGD: 'S$' }
  const conv = (thb: number) => thb * (RATES[curSym] ?? 1)
  const money = (thb: number) => `${SYM[curSym]}${conv(thb).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  const cur = evaluate(spec, data)
  const best = generateAlternatives(spec, data)[0]
  const bestRes = best?.result
  const cbam2028 = cur.cbam.find((c) => c.year === 2028)?.taxEur ?? 0
  const mat = data.materials.find((m) => m.id === spec.materialId)
  const mats = data.materials

  const norm = (v: number, key: 'tensileStrength' | 'yieldStrength' | 'hardness' | 'thermalCond' | 'electricalCond' | 'corrosion') => {
    const vals = mats.map((m) => m[key] as number); const max = Math.max(...vals, 1); return Math.round((v / max) * 100)
  }
  const recycledAlt = mats.find((m) => m.id === 2)
  const radarData = [
    { metric: 'Strength', cur: norm(mat?.tensileStrength ?? 0, 'tensileStrength'), alt: norm(recycledAlt?.tensileStrength ?? 0, 'tensileStrength') },
    { metric: 'Yield', cur: norm(mat?.yieldStrength ?? 0, 'yieldStrength'), alt: norm(recycledAlt?.yieldStrength ?? 0, 'yieldStrength') },
    { metric: 'Hardness', cur: norm(mat?.hardness ?? 0, 'hardness'), alt: norm(recycledAlt?.hardness ?? 0, 'hardness') },
    { metric: 'Thermal', cur: norm(mat?.thermalCond ?? 0, 'thermalCond'), alt: norm(recycledAlt?.thermalCond ?? 0, 'thermalCond') },
    { metric: 'Electric', cur: norm(mat?.electricalCond ?? 0, 'electricalCond'), alt: norm(recycledAlt?.electricalCond ?? 0, 'electricalCond') },
    { metric: 'Corrosion', cur: norm(mat?.corrosion ?? 0, 'corrosion'), alt: norm(recycledAlt?.corrosion ?? 0, 'corrosion') },
  ]
  const strengthData = mats.map((m) => ({ name: m.name.replace(/ \(.*\)/, ''), uts: m.tensileStrength, ys: m.yieldStrength, hb: m.hardness }))
  const trend = cur.cbam.map((c) => ({ year: c.year, tax: c.taxEur }))
  const mrv = [
    { scope: 'Scope 1', co2: Math.round(cur.mrv.scope1) },
    { scope: 'Scope 2', co2: Math.round(cur.mrv.scope2) },
    { scope: 'Scope 3', co2: Math.round(cur.mrv.scope3) },
  ]
  const beforeData = [
    { name: 'Material', value: Math.round(cur.materialCo2 * 12 * spec.batchSize) },
    { name: 'Process', value: Math.round((cur.procCo2 + cur.energyCo2) * 12 * spec.batchSize) },
    { name: 'Transport', value: Math.round(cur.transportCo2 * 12 * spec.batchSize) },
  ]
  const afterData = bestRes ? [
    { name: 'Material', value: Math.round(bestRes.materialCo2 * 12 * spec.batchSize) },
    { name: 'Process', value: Math.round((bestRes.procCo2 + bestRes.energyCo2) * 12 * spec.batchSize) },
    { name: 'Transport', value: Math.round(bestRes.transportCo2 * 12 * spec.batchSize) },
  ] : beforeData
  const saved = bestRes ? (cur.annualCo2 - bestRes.annualCo2) / 1000 : 0
  const savedCost = bestRes ? (cur.annualCost - bestRes.annualCost) / 1000 : 0

  const Toggle = ({ k, label }: { k: ChartKey; label: string }) => (
    <button onClick={() => toggle(k)} className={`btn text-xs py-1.5 ${charts[k] ? 'btn-active' : ''}`}>{charts[k] ? '✓ ' : '○ '}{label}</button>
  )

  const NumField = ({ label, value, step, min, max, onChange }: { label: string; value: number; step: number; min?: number; max?: number; onChange: (v: number) => void }) => (
    <label className="block">
      <div className="flex justify-between text-sm mb-0.5"><span className="text-ink-mute">{label}</span></div>
      <input type="number" value={value} step={step} min={min} max={max}
        onChange={(e) => { const v = Number(e.target.value); if (!Number.isNaN(v)) onChange(v) }}
        className="w-full card-inset tabular-nums text-[15px] font-medium" />
    </label>
  )

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card"><div className="label">Carbon Score</div><div className="text-[34px] leading-none font-bold text-accent tabular-nums">{cur.score}<span className="text-ink-mute text-xl">/100</span></div></div>
        <div className="card"><div className="label">CO₂ / ปี</div><div className="text-[34px] leading-none font-bold text-ink tabular-nums">{(cur.annualCo2/1000).toFixed(2)}<span className="text-ink-mute text-xl"> t</span></div></div>
        <div className="card"><div className="label">ต้นทุน / ปี</div><div className="text-[34px] leading-none font-bold text-ink tabular-nums">{money(cur.annualCost/1000)}<span className="text-ink-mute text-xl">K</span></div>
          <select className="mt-1 card-inset py-0.5 text-xs" value={curSym} onChange={(e) => setCurSym(e.target.value as any)}>
            {Object.keys(RATES).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="card"><div className="label">CBAM 2028</div><div className={`text-[34px] leading-none font-bold tabular-nums ${cbam2028 > 0 ? 'text-bad' : 'text-ok'}`}>€{cbam2028}<span className="text-ink-mute text-xl">/yr</span></div></div>
      </div>

      {/* Controls — Process + WhatIf together, realtime */}
      <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="label mb-1">วัสดุ</div>
          <select className="w-full card-inset" value={spec.materialId} onChange={(e) => set({ materialId: Number(e.target.value) })}>
            {data.materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div className="label mt-3 mb-1">กระบวนการ</div>
          <select className="w-full card-inset" value={spec.processId} onChange={(e) => set({ processId: Number(e.target.value) })}>
            {data.processes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <NumField label="Net Mass (kg)" value={spec.netMass} step={0.1} min={0.1} onChange={(v) => set({ netMass: v })} />
          <NumField label="% Recycled" value={spec.recycledPercent} step={1} min={0} max={100} onChange={(v) => set({ recycledPercent: v })} />
        </div>
        <div className="space-y-3">
          <NumField label="Batch (pcs/mo)" value={spec.batchSize} step={100} min={1} onChange={(v) => set({ batchSize: v })} />
          <NumField label="Transport (km)" value={spec.transportDist} step={10} min={0} onChange={(v) => set({ transportDist: v })} />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <div className="label mb-1">Hotspot</div>
            <div className="text-sm">Material {((beforeData[0].value / beforeData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}% · Process {((beforeData[1].value / beforeData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</div>
          </div>
          <WhyButton req={{ hotspot: 'material', part: spec.partType, co2: cur.annualCo2, score: cur.score, cbam2028 }} />
        </div>
      </div>

      {/* Chart visibility toggles (type switched by clicking the chart itself) */}
      <div className="card flex flex-wrap items-center gap-3">
        <span className="label">กราฟ (คลิกที่กราฟเพื่อเปลี่ยนรูปแบบ):</span>
        <label className="flex items-center gap-1.5 text-sm">Carbon <input type="checkbox" checked={charts.donut} onChange={() => toggle('donut')} className="accent-accent" /></label>
        <label className="flex items-center gap-1.5 text-sm">Trend <input type="checkbox" checked={charts.trend} onChange={() => toggle('trend')} className="accent-accent" /></label>
        <label className="flex items-center gap-1.5 text-sm">MRV <input type="checkbox" checked={charts.mrv} onChange={() => toggle('mrv')} className="accent-accent" /></label>
        <label className="flex items-center gap-1.5 text-sm">Radar <input type="checkbox" checked={charts.radar} onChange={() => toggle('radar')} className="accent-accent" /></label>
        <label className="flex items-center gap-1.5 text-sm">Strength <input type="checkbox" checked={charts.strength} onChange={() => toggle('strength')} className="accent-accent" /></label>
        <span className="ml-auto"><SdgBadges /></span>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {charts.donut && (
          <div className="card md:col-span-2 cursor-pointer" onClick={() => setType('breakdown', types.breakdown === 'pie' ? 'bar' : types.breakdown === 'bar' ? 'line' : 'pie')} title="คลิกเพื่อเปลี่ยน โดนัด/แท่ง/เส้น">
            <div className="label mb-2">Carbon Breakdown — Before vs After ({types.breakdown === 'pie' ? 'โดนัด' : types.breakdown === 'bar' ? 'แท่ง' : 'เส้น'} · คลิกเปลี่ยน)</div>
            <ResponsiveContainer width="100%" height={240}>
              {types.breakdown === 'pie' ? (
                <PieChart>
                  <Pie data={beforeData} dataKey="value" nameKey="name" outerRadius={85} label>{beforeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>
                  <Pie data={afterData} dataKey="value" nameKey="name" innerRadius={95} outerRadius={120} label>{afterData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>
                  <Tooltip /><Legend />
                </PieChart>
              ) : types.breakdown === 'bar' ? (
                <BarChart data={[...beforeData.map((d) => ({ ...d, grp: 'Before' })), ...afterData.map((d) => ({ ...d, grp: 'After' }))]}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                  <Bar dataKey="value" name="Before" fill="#0075de" radius={[4,4,0,0]} /><Bar dataKey="value" name="After" fill="#1aae39" radius={[4,4,0,0]} />
                </BarChart>
              ) : (
                <LineChart data={[
                  { name: 'Material', Before: beforeData[0].value, After: afterData[0].value },
                  { name: 'Process', Before: beforeData[1].value, After: afterData[1].value },
                  { name: 'Transport', Before: beforeData[2].value, After: afterData[2].value },
                ]}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                  <Line dataKey="Before" stroke="#0075de" strokeWidth={2} dot={{ r: 3 }} />
                  <Line dataKey="After" stroke="#1aae39" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
        {charts.trend && (
          <div className="card cursor-pointer" onClick={() => setType('trend', types.trend === 'bar' ? 'line' : 'bar')} title="คลิกเพื่อเปลี่ยน แท่ง/เส้น">
            <div className="label mb-2">CBAM Obligation Trend ({types.trend === 'bar' ? 'แท่ง' : 'เส้น'} · คลิกเปลี่ยน)</div>
            <ResponsiveContainer width="100%" height={220}>
              {types.trend === 'bar' ? (
                <BarChart data={trend}><XAxis dataKey="year" tick={{ fontSize: 13 }} /><YAxis tick={{ fontSize: 13 }} /><Tooltip /><Bar dataKey="tax" fill="#0075de" radius={[4,4,0,0]} /><Legend /></BarChart>
              ) : (
                <LineChart data={trend}><XAxis dataKey="year" tick={{ fontSize: 13 }} /><YAxis tick={{ fontSize: 13 }} /><Tooltip /><Line dataKey="tax" stroke="#0075de" strokeWidth={2} dot={{ r: 3 }} /><Legend /></LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
        {charts.mrv && (
          <div className="card cursor-pointer" onClick={() => setType('mrv', types.mrv === 'h' ? 'v' : 'h')} title="คลิกเพื่อเปลี่ยน แนวนอน/แนวตั้ง">
            <div className="label mb-2">MRV (EU CBAM scopes) — {types.mrv === 'h' ? 'แนวนอน' : 'แนวตั้ง'} · คลิกเปลี่ยน</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mrv} layout={types.mrv === 'h' ? 'vertical' : 'horizontal'}>
                <XAxis type={types.mrv === 'h' ? 'number' : 'category'} dataKey={types.mrv === 'h' ? undefined : 'scope'} tick={{ fontSize: 12 }} />
                <YAxis type={types.mrv === 'h' ? 'category' : 'number'} dataKey={types.mrv === 'h' ? 'scope' : undefined} width={types.mrv === 'h' ? 110 : 40} tick={{ fontSize: 12 }} />
                <Tooltip /><Bar dataKey="co2" fill="#1aae39" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {charts.radar && (
          <div className="card cursor-pointer" onClick={() => setType('radar', types.radar === 'radar' ? 'bar' : 'radar')} title="คลิกเพื่อเปลี่ยน Radar/แท่ง">
            <div className="label mb-2">วัสดุศาสตร์ — Mechanical Profile ({types.radar === 'radar' ? 'Radar' : 'แท่ง'} · คลิกเปลี่ยน)</div>
            <ResponsiveContainer width="100%" height={220}>
              {types.radar === 'radar' ? (
                <RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} /><Radar name="Current" dataKey="cur" stroke="#0075de" fill="#0075de" fillOpacity={0.35} /><Radar name="Recycled Alt" dataKey="alt" stroke="#1aae39" fill="#1aae39" fillOpacity={0.25} /><Legend /></RadarChart>
              ) : (
                <BarChart data={radarData}><XAxis dataKey="metric" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="cur" name="Current" fill="#0075de" radius={[4,4,0,0]} /><Bar dataKey="alt" name="Recycled" fill="#1aae39" radius={[4,4,0,0]} /></BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
        {charts.strength && (
          <div className="card cursor-pointer" onClick={() => setType('strength', types.strength === 'bar' ? 'line' : 'bar')} title="คลิกเพื่อเปลี่ยน แท่ง/เส้น">
            <div className="label mb-2">Strength &amp; Hardness Comparison ({types.strength === 'bar' ? 'แท่ง' : 'เส้น'} · คลิกเปลี่ยน)</div>
            <ResponsiveContainer width="100%" height={220}>
              {types.strength === 'bar' ? (
                <BarChart data={strengthData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="uts" name="Ultimate (MPa)" fill="#0075de" radius={[4,4,0,0]} /><Bar dataKey="ys" name="Yield (MPa)" fill="#dd5b00" radius={[4,4,0,0]} /><Bar dataKey="hb" name="Hardness (HB)" fill="#1aae39" radius={[4,4,0,0]} /></BarChart>
              ) : (
                <LineChart data={strengthData.map((d) => ({ name: d.name, Ultimate: d.uts, Yield: d.ys, Hardness: d.hb }))}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line dataKey="Ultimate" stroke="#0075de" strokeWidth={2} dot={{ r: 3 }} /><Line dataKey="Yield" stroke="#dd5b00" strokeWidth={2} dot={{ r: 3 }} /><Line dataKey="Hardness" stroke="#1aae39" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Material science detail */}
      <div className="card">
        <div className="label mb-3">วัสดุศาสตร์ — {mat?.name}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
          <Prop label="Alloy" value={mat?.alloy ?? '—'} />
          <Prop label="Density" value={`${mat?.density} kg/m³`} />
          <Prop label="Emission Factor" value={`${mat?.emissionFactor} kgCO₂/kg`} accent />
          <Prop label="Cost" value={`฿${mat?.costPerKg}/kg`} />
          <Prop label="Ultimate Strength" value={`${mat?.tensileStrength} MPa`} />
          <Prop label="Yield Strength" value={`${mat?.yieldStrength} MPa`} />
          <Prop label="Hardness" value={`${mat?.hardness} HB`} />
          <Prop label="Elongation" value={`${mat?.elongation} %`} />
          <Prop label="Thermal Cond." value={`${mat?.thermalCond} W/m·K`} />
          <Prop label="Electrical Cond." value={`${mat?.electricalCond} %IACS`} />
          <Prop label="Corrosion" value={`${'★'.repeat(mat?.corrosion ?? 0)}${'☆'.repeat(5 - (mat?.corrosion ?? 0))}`} />
          <Prop label="Recycle Grade" value={mat?.recycleGrade ?? '—'} badge={mat?.recycleGrade} />
          <Prop label="Porosity" value={mat?.porosityClass ?? '—'} />
          <Prop label="RoHS" value={mat?.rohs ? '✓ Compliant' : '✗'} />
        </div>
        {bestRes && (
          <div className="mt-3 text-sm text-ok">
            Best: Option {best?.label} → ลด CO₂ {saved.toFixed(2)} t/yr, ประหยัด ฿{savedCost.toFixed(0)}K/yr, CBAM 2028 €{bestRes.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}
          </div>
        )}
      </div>
    </div>
  )
}

function Prop({ label, value, accent, badge }: { label: string; value: string; accent?: boolean; badge?: string }) {
  const badgeCls: Record<string, string> = { A: 'pill-accent', B: 'pill-warn', C: 'pill-warn', D: 'pill-bad' }
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-ink-mute font-semibold">{label}</div>
      {badge ? <span className={`pill ${badgeCls[badge] ?? 'pill-accent'}`}>{value}</span>
        : <div className={`text-[15px] font-medium ${accent ? 'text-accent' : 'text-ink'}`}>{value}</div>}
    </div>
  )
}
