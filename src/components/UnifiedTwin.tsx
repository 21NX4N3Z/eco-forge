import { useState } from 'react'
import { PartSpec, SeedData } from '../types'
import { evaluate } from '../engine/cbam'
import { generateAlternatives } from '../engine/optimize'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import WhyButton from './WhyButton'
import SdgBadges from './SdgBadges'
import { ManualMaterialForm, HistoryPanel, SupplierPanel } from './InputSources'

const COLORS = ['#0075de', '#dd5b00', '#1aae39', '#a39e98']

type ChartKey = 'breakdown' | 'trend' | 'mrv' | 'radar' | 'strength'
type Viz = 'pie' | 'donut' | 'bar' | 'line' | 'area' | 'radial' | 'hbar' | 'vbar' | 'radar'

const CYCLE: Record<ChartKey, Viz[]> = {
  breakdown: ['pie', 'donut', 'bar', 'line', 'area', 'radial'],
  trend: ['bar', 'line', 'area'],
  mrv: ['hbar', 'vbar', 'pie'],
  radar: ['radar', 'bar'],
  strength: ['bar', 'line', 'area'],
}
const VIZ_LABEL: Record<Viz, string> = {
  pie: 'โดนัด', donut: 'โดนัทรู', bar: 'แท่ง', line: 'เส้น', area: 'พื้นที่',
  radial: 'วงแหวน', hbar: 'แท่งนอน', vbar: 'แท่งตั้ง', radar: 'เรดาร์',
}

export default function UnifiedTwin({ spec, setSpec, data, addMaterial }: { spec: PartSpec; setSpec: (s: PartSpec) => void; data: SeedData; addMaterial: (m: any) => void }) {
  const set = (p: Partial<PartSpec>) => setSpec({ ...spec, ...p })
  const [srcPanel, setSrcPanel] = useState<'standard' | 'manual' | 'history' | 'supplier'>('standard')
  const [show, setShow] = useState<Record<ChartKey, boolean>>({
    breakdown: true, trend: true, mrv: true, radar: true, strength: true,
  })
  const [types, setTypes] = useState<Record<ChartKey, Viz>>({
    breakdown: 'pie', trend: 'bar', mrv: 'hbar', radar: 'radar', strength: 'bar',
  })
  const cycle = (k: ChartKey) => setTypes((t) => {
    const list = CYCLE[k]
    return { ...t, [k]: list[(list.indexOf(t[k]) + 1) % list.length] }
  })
  const toggleShow = (k: ChartKey) => setShow((s) => ({ ...s, [k]: !s[k] }))
  const [full, setFull] = useState<ChartKey | null>(null)

  const cur = evaluate(spec, data)
  const best = generateAlternatives(spec, data)[0]
  const bestRes = best?.result
  const cbam2028 = cur.cbam.find((c) => c.year === 2028)?.taxEur ?? 0
  const mat = data.materials.find((m) => m.id === spec.materialId)
  const mats = data.materials

  // currency
  const [curSym, setCurSym] = useState<'THB' | 'EUR' | 'USD' | 'JPY' | 'CNY' | 'GBP' | 'SGD'>('THB')
  const RATES: Record<string, number> = { THB: 1, EUR: 0.026, USD: 0.028, JPY: 4.3, CNY: 0.20, GBP: 0.022, SGD: 0.038 }
  const SYM: Record<string, string> = { THB: '฿', EUR: '€', USD: '$', JPY: '¥', CNY: '¥', GBP: '£', SGD: 'S$' }
  const money = (thb: number) => `${SYM[curSym]}${(thb * (RATES[curSym] ?? 1)).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

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
  const strengthData = mats.map((m) => ({ name: m.name.replace(/ \(.*\)/, ''), Ultimate: m.tensileStrength, Yield: m.yieldStrength, Hardness: m.hardness }))
  const trend = cur.cbam.map((c) => ({ year: String(c.year), tax: c.taxEur }))
  const mrv = [
    { scope: 'Scope 1', co2: Math.round(cur.mrv.scope1) },
    { scope: 'Scope 2', co2: Math.round(cur.mrv.scope2) },
    { scope: 'Scope 3', co2: Math.round(cur.mrv.scope3) },
  ]
  const annualParts = spec.batchSize * 12
  const beforeData = [
    { name: 'Material', value: Math.round(cur.materialCo2 * annualParts) },
    { name: 'Process', value: Math.round((cur.procCo2 + cur.energyCo2) * annualParts) },
    { name: 'Transport', value: Math.round(cur.transportCo2 * annualParts) },
  ]
  const afterData = bestRes ? [
    { name: 'Material', value: Math.round(bestRes.materialCo2 * annualParts) },
    { name: 'Process', value: Math.round((bestRes.procCo2 + bestRes.energyCo2) * annualParts) },
    { name: 'Transport', value: Math.round(bestRes.transportCo2 * annualParts) },
  ] : beforeData

  const NumField = ({ label, value, step, min, max, onChange }: { label: string; value: number; step: number; min?: number; max?: number; onChange: (v: number) => void }) => (
    <label className="block">
      <div className="text-sm text-ink-mute mb-0.5">{label}</div>
      <input type="number" value={value} step={step} min={min} max={max}
        onChange={(e) => { const v = Number(e.target.value); if (!Number.isNaN(v)) onChange(v) }}
        className="w-full card-inset tabular-nums text-[15px] font-medium" />
    </label>
  )

  /** Chart card: click body cycles viz type; header has expand button. */
  const ChartCard = ({ k, title, height, children }: { k: ChartKey; title: string; height: number; children: React.ReactNode }) => (
    <div className={`card ${full === k ? 'fixed inset-3 z-50 overflow-auto' : ''} ${k === 'breakdown' && full !== k ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <button className="text-left flex-1" onClick={() => cycle(k)} title="คลิกเพื่อเปลี่ยนรูปแบบกราฟ">
          <span className="label">{title}</span>
          <span className="ml-2 text-[11px] text-accent font-semibold">[{VIZ_LABEL[types[k]]}]</span>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button className="btn text-[11px] px-1.5 py-0.5" title="ซ่อน/แสดง" onClick={() => toggleShow(k)}>{show[k] ? '–' : '+'}</button>
          <button className="btn text-[11px] px-1.5 py-0.5" title="ขยายเต็มจอ / ย่อ" onClick={() => setFull(full === k ? null : k)}>{full === k ? '✕' : '⤢'}</button>
        </div>
      </div>
      {show[k] ? children : <div className="text-xs text-ink-mute py-6 text-center">(ซ่อนอยู่ — กด + เพื่อแสดง)</div>}
      {/* height wrapper keeps layout stable */}
      {null}
      <style>{``}</style>
      {height ? null : null}
      {/* ResponsiveContainer uses `height` prop from caller */}
    </div>
  )

  const H = full ? 480 : 240 // taller when expanded

  const renderBreakdown = () => {
    const t = types.breakdown
    if (t === 'pie') return (
      <PieChart><Pie data={beforeData} dataKey="value" nameKey="name" outerRadius={H * 0.36} label>{beforeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
    )
    if (t === 'donut') return (
      <PieChart><Pie data={afterData} dataKey="value" nameKey="name" innerRadius={H * 0.18} outerRadius={H * 0.34}>{afterData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
    )
    if (t === 'radial') return (
      <RadialBarChart data={[...beforeData.map((d, i) => ({ name: d.name, v: d.value, fill: COLORS[i % COLORS.length] }))]} innerRadius="25%" outerRadius="95%">
        <RadialBar dataKey="v" background cornerRadius={6} /><Tooltip /><Legend />
      </RadialBarChart>
    )
    if (t === 'bar') return (
      <BarChart data={[
        { name: 'Material', Before: beforeData[0].value, After: afterData[0].value },
        { name: 'Process', Before: beforeData[1].value, After: afterData[1].value },
        { name: 'Transport', Before: beforeData[2].value, After: afterData[2].value },
      ]}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend />
        <Bar dataKey="Before" fill="#0075de" radius={[4,4,0,0]} /><Bar dataKey="After" fill="#1aae39" radius={[4,4,0,0]} />
      </BarChart>
    )
    if (t === 'line') return (
      <LineChart data={[
        { name: 'Material', Before: beforeData[0].value, After: afterData[0].value },
        { name: 'Process', Before: beforeData[1].value, After: afterData[1].value },
        { name: 'Transport', Before: beforeData[2].value, After: afterData[2].value },
      ]}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend />
        <Line dataKey="Before" stroke="#0075de" strokeWidth={2} dot={{ r: 3 }} /><Line dataKey="After" stroke="#1aae39" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    )
    return (
      <AreaChart data={[
        { name: 'Material', Before: beforeData[0].value, After: afterData[0].value },
        { name: 'Process', Before: beforeData[1].value, After: afterData[1].value },
        { name: 'Transport', Before: beforeData[2].value, After: afterData[2].value },
      ]}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend />
        <Area dataKey="Before" stroke="#0075de" fill="#0075de" fillOpacity={0.25} strokeWidth={2} />
        <Area dataKey="After" stroke="#1aae39" fill="#1aae39" fillOpacity={0.25} strokeWidth={2} />
      </AreaChart>
    )
  }

  const renderTrend = () => {
    const t = types.trend
    if (t === 'line') return <LineChart data={trend}><XAxis dataKey="year" tick={{ fontSize: 13 }} /><YAxis tick={{ fontSize: 13 }} /><Tooltip /><Legend /><Line dataKey="tax" name="CBAM €" stroke="#0075de" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
    if (t === 'area') return <AreaChart data={trend}><XAxis dataKey="year" tick={{ fontSize: 13 }} /><YAxis tick={{ fontSize: 13 }} /><Tooltip /><Legend /><Area dataKey="tax" name="CBAM €" stroke="#0075de" fill="#0075de" fillOpacity={0.25} strokeWidth={2} /></AreaChart>
    return <BarChart data={trend}><XAxis dataKey="year" tick={{ fontSize: 13 }} /><YAxis tick={{ fontSize: 13 }} /><Tooltip /><Legend /><Bar dataKey="tax" name="CBAM €" fill="#0075de" radius={[4,4,0,0]} /></BarChart>
  }

  const renderMrv = () => {
    const t = types.mrv
    if (t === 'vbar') return <BarChart data={mrv}><XAxis dataKey="scope" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="co2" name="kgCO₂/yr" fill="#1aae39" radius={[4,4,0,0]} /></BarChart>
    if (t === 'pie') return <PieChart><Pie data={mrv} dataKey="co2" nameKey="scope" outerRadius={H * 0.36} label>{mrv.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
    return <BarChart data={mrv} layout="vertical"><XAxis type="number" tick={{ fontSize: 12 }} /><YAxis type="category" dataKey="scope" width={110} tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="co2" name="kgCO₂/yr" fill="#1aae39" radius={[0,4,4,0]} /></BarChart>
  }

  const renderRadar = () => {
    if (types.radar === 'bar') return <BarChart data={radarData}><XAxis dataKey="metric" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="cur" name="Current" fill="#0075de" radius={[4,4,0,0]} /><Bar dataKey="alt" name="Recycled" fill="#1aae39" radius={[4,4,0,0]} /></BarChart>
    return <RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} /><Radar name="Current" dataKey="cur" stroke="#0075de" fill="#0075de" fillOpacity={0.35} /><Radar name="Recycled Alt" dataKey="alt" stroke="#1aae39" fill="#1aae39" fillOpacity={0.25} /><Legend /></RadarChart>
  }

  const renderStrength = () => {
    const t = types.strength
    if (t === 'line') return <LineChart data={strengthData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line dataKey="Ultimate" stroke="#0075de" strokeWidth={2} dot={{ r: 3 }} /><Line dataKey="Yield" stroke="#dd5b00" strokeWidth={2} dot={{ r: 3 }} /><Line dataKey="Hardness" stroke="#1aae39" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
    if (t === 'area') return <AreaChart data={strengthData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Area dataKey="Ultimate" stroke="#0075de" fill="#0075de" fillOpacity={0.2} strokeWidth={2} /><Area dataKey="Yield" stroke="#dd5b00" fill="#dd5b00" fillOpacity={0.2} strokeWidth={2} /><Area dataKey="Hardness" stroke="#1aae39" fill="#1aae39" fillOpacity={0.2} strokeWidth={2} /></AreaChart>
    return <BarChart data={strengthData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="Ultimate" name="UTS MPa" fill="#0075de" radius={[4,4,0,0]} /><Bar dataKey="Yield" name="YS MPa" fill="#dd5b00" radius={[4,4,0,0]} /><Bar dataKey="Hardness" name="HB" fill="#1aae39" radius={[4,4,0,0]} /></BarChart>
  }

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card"><div className="label">Carbon Score</div><div className="text-[34px] leading-none font-bold text-accent tabular-nums">{cur.score}<span className="text-ink-mute text-xl">/100</span></div></div>
        <div className="card"><div className="label">CO₂ / ปี</div><div className="text-[34px] leading-none font-bold text-ink tabular-nums">{(cur.annualCo2/1000).toFixed(2)}<span className="text-ink-mute text-xl"> t</span></div></div>
        <div className="card"><div className="label">ต้นทุน / ปี</div><div className="text-[30px] leading-none font-bold text-ink tabular-nums">{money(cur.annualCost)}</div>
          <select className="mt-1 card-inset py-0.5 text-xs" value={curSym} onChange={(e) => setCurSym(e.target.value as any)}>
            {Object.keys(RATES).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="card"><div className="label">CBAM 2028</div><div className={`text-[34px] leading-none font-bold tabular-nums ${cbam2028 > 0 ? 'text-bad' : 'text-ok'}`}>€{cbam2028}<span className="text-ink-mute text-xl">/yr</span></div></div>
      </div>

      {/* Controls */}
      <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-4 mb-1">
          <div className="label mb-2">แหล่งข้อมูลนำเข้า (Input Source)</div>
          <div className="flex flex-wrap gap-2">
            {(['standard', 'manual', 'history', 'supplier'] as const).map((s) => (
              <button key={s} onClick={() => { set({ inputSource: s }); setSrcPanel(s) }}
                className={`btn text-xs py-1.5 ${spec.inputSource === s ? 'btn-active' : ''}`}>
                {s === 'standard' ? '① Standard DB' : s === 'manual' ? '② Manual Input' : s === 'history' ? '③ Factory History' : '④ Supplier DB'}
              </button>
            ))}
          </div>
          {srcPanel === 'manual' && (
            <ManualMaterialForm nextId={Math.max(...data.materials.map((m) => m.id)) + 1}
              onAdd={(m) => { addMaterial(m); set({ materialId: m.id }) }} />
          )}
          {srcPanel === 'history' && (
            <HistoryPanel spec={spec} onRestore={(s) => setSpec(s)} />
          )}
          {srcPanel === 'supplier' && (
            <SupplierPanel data={data} onPick={(mid) => set({ materialId: mid, inputSource: 'supplier' })} />
          )}
        </div>
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

      {/* Legend for chart interactions */}
      <div className="card flex flex-wrap items-center gap-3 text-xs text-ink-mute">
        <span>💡 คลิกชื่อกราฟ = เปลี่ยนรูปแบบ · ⤢ = ขยายเต็มจอ · – = ย่อ/ซ่อน</span>
        <span className="ml-auto"><SdgBadges /></span>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard k="breakdown" title="Carbon Breakdown (Before vs After)" height={H}>
          <ResponsiveContainer width="99%" height={H}>{renderBreakdown()}</ResponsiveContainer>
        </ChartCard>

        <ChartCard k="trend" title="CBAM Obligation Trend 2026→2033" height={H}>
          <ResponsiveContainer width="99%" height={H}>{renderTrend()}</ResponsiveContainer>
        </ChartCard>

        <ChartCard k="mrv" title="MRV — EU CBAM Scopes" height={H}>
          <ResponsiveContainer width="99%" height={H}>{renderMrv()}</ResponsiveContainer>
        </ChartCard>

        <ChartCard k="radar" title="วัสดุศาสตร์ — Mechanical Profile" height={H}>
          <ResponsiveContainer width="99%" height={H}>{renderRadar()}</ResponsiveContainer>
        </ChartCard>

        <ChartCard k="strength" title="วัสดุศาสตร์ — Strength & Hardness Compare" height={H}>
          <ResponsiveContainer width="99%" height={H}>{renderStrength()}</ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Material science detail grid */}
      <div className="card">
        <div className="label mb-3">วัสดุศาสตร์ — {mat?.name}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
          {([
            ['Alloy', mat?.alloy], ['Density', `${mat?.density} kg/m³`],
            ['Emission Factor', `${mat?.emissionFactor} kgCO₂/kg`], ['Cost', `฿${mat?.costPerKg}/kg`],
            ['Ultimate Strength', `${mat?.tensileStrength} MPa`], ['Yield Strength', `${mat?.yieldStrength} MPa`],
            ['Hardness', `${mat?.hardness} HB`], ['Elongation', `${mat?.elongation} %`],
            ['Thermal Cond.', `${mat?.thermalCond} W/m·K`], ['Electrical Cond.', `${mat?.electricalCond} %IACS`],
            ['Corrosion', `${'★'.repeat(mat?.corrosion ?? 0)}${'☆'.repeat(5 - (mat?.corrosion ?? 0))}`],
            ['Porosity', mat?.porosityClass], ['RoHS', mat?.rohs ? '✓ Compliant' : '✗'],
          ] as [string, string | undefined][]).map(([l, v]) => (
            <div key={l}>
              <div className="text-[11px] uppercase tracking-wide text-ink-mute font-semibold">{l}</div>
              <div className="text-[15px] font-medium text-ink">{v ?? '—'}</div>
            </div>
          ))}
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-mute font-semibold">Recycle Grade</div>
            <span className={`pill ${mat?.recycleGrade === 'A' ? 'pill-ok' : mat?.recycleGrade === 'D' ? 'pill-bad' : 'pill-warn'}`}>{mat?.recycleGrade ?? '—'}</span>
          </div>
        </div>
        {bestRes && (
          <div className="mt-3 text-sm text-ok">
            Best: Option {best?.label} → ลด CO₂ {((cur.annualCo2 - bestRes.annualCo2)/1000).toFixed(2)} t/yr · ประหยัด {money(cur.annualCost - bestRes.annualCost)}/yr · CBAM 2028 €{bestRes.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}
          </div>
        )}
      </div>
    </div>
  )
}
