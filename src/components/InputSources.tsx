import { useState } from 'react'
import { Material, PartSpec, SeedData } from '../types'

const HKEY = 'ecoforge_history'

function Num({ label, v, on, step = 1, min = 0 }: { label: string; v: number; on: (n: number) => void; step?: number; min?: number }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wide text-ink-mute font-semibold mb-0.5">{label}</div>
      <input type="number" value={v} step={step} min={min}
        onChange={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n)) on(n) }}
        className="w-full card-inset tabular-nums text-[15px]" />
    </label>
  )
}

/** ② Manual Input — real form: adds a working Material into the engine. */
export function ManualMaterialForm({ nextId, onAdd }: { nextId: number; onAdd: (m: Material) => void }) {
  const [f, setF] = useState({
    name: '', density: 2700, emissionFactor: 5, costPerKg: 200,
    tensileStrength: 300, yieldStrength: 250, hardness: 90,
  })
  const up = (k: keyof typeof f, v: number | string) => setF((s) => ({ ...s, [k]: v }))
  const valid = f.name.trim().length > 1

  function submit() {
    if (!valid) return
    const m: Material = {
      id: nextId,
      name: f.name.trim(),
      alloy: `${f.name.trim()} (custom entry)`,
      density: f.density,
      emissionFactor: f.emissionFactor,
      costPerKg: f.costPerKg,
      recyclable: true,
      tensileStrength: f.tensileStrength,
      yieldStrength: f.yieldStrength,
      hardness: f.hardness,
      elongation: 8,
      corrosion: 3,
      thermalCond: 150,
      electricalCond: 35,
      recycleGrade: 'B',
      porosityClass: 'N/A (custom)',
      rohs: true,
      source: 'Manual Input',
    }
    onAdd(m)
    setF((s) => ({ ...s, name: '' }))
  }

  return (
    <div className="card lg:col-span-4">
      <div className="label mb-2">② Manual Input — กรอกวัสดุใหม่ (เข้า engine ทันที)</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="block col-span-2 md:col-span-1">
          <div className="text-[11px] uppercase tracking-wide text-ink-mute font-semibold mb-0.5">ชื่อวัสดุ *</div>
          <input value={f.name} onChange={(e) => up('name', e.target.value)} placeholder="เช่น Ti-6Al-4V"
            className="w-full card-inset text-[15px]" />
        </label>
        <Num label="Density (kg/m³)" v={f.density} on={(n) => up('density', n)} step={10} />
        <Num label="Embodied CO₂ (kg/kg)" v={f.emissionFactor} on={(n) => up('emissionFactor', n)} step={0.1} />
        <Num label="ราคา (฿/kg)" v={f.costPerKg} on={(n) => up('costPerKg', n)} step={10} />
        <Num label="UTS (MPa)" v={f.tensileStrength} on={(n) => up('tensileStrength', n)} step={10} />
        <Num label="Yield (MPa)" v={f.yieldStrength} on={(n) => up('yieldStrength', n)} step={10} />
        <Num label="Hardness (HB)" v={f.hardness} on={(n) => up('hardness', n)} step={5} />
      </div>
      <button disabled={!valid} onClick={submit}
        className={`btn mt-3 ${valid ? 'btn-active' : 'opacity-40 cursor-not-allowed'}`}>
        + เพิ่มวัสดุและเลือกใช้ (ID {nextId})
      </button>
    </div>
  )
}

/** ③ Factory History — save/restore scenarios (localStorage-backed). */
export function HistoryPanel({ spec, onRestore }: { spec: PartSpec; onRestore: (s: PartSpec) => void }) {
  const [items, setItems] = useState<{ date: string; spec: PartSpec }[]>(() => {
    try { return JSON.parse(typeof localStorage !== 'undefined' ? localStorage.getItem(HKEY) || '[]' : '[]') } catch { return [] }
  })
  const save = () => {
    const e = [...items, { date: new Date().toISOString(), spec }]
    try { localStorage.setItem(HKEY, JSON.stringify(e)) } catch { /* ignore */ }
    setItems(e)
  }
  const del = (i: number) => {
    const e = items.filter((_, j) => j !== i)
    try { localStorage.setItem(HKEY, JSON.stringify(e)) } catch { /* ignore */ }
    setItems(e)
  }
  return (
    <div className="card lg:col-span-4">
      <div className="flex items-center justify-between mb-2">
        <div className="label">③ Factory History — บันทึก/เรียกซีนาริโอเดิม</div>
        <button className="btn text-xs py-1 btn-active" onClick={save}>💾 บันทึกซีนาริโอปัจจุบัน</button>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-ink-mute py-2">ยังไม่มีประวัติ — ตั้งค่าชิ้นงานแล้วกด "บันทึกซีนาริโอปัจจุบัน"</div>
      ) : (
        <table className="w-full text-[14px]">
          <thead className="text-ink-mute"><tr><th className="text-left">วันที่</th><th className="text-left">ชิ้นงาน</th><th>วัสดุ ID</th><th>กระบวนการ</th><th>Mass</th><th></th></tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-1">{new Date(it.date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{it.spec.partType}</td>
                <td className="text-center">{it.spec.materialId}</td>
                <td className="text-center">{it.spec.processId}</td>
                <td className="text-center tabular-nums">{it.spec.netMass} kg</td>
                <td className="text-right space-x-1">
                  <button className="btn text-xs px-2 py-0.5 btn-active" onClick={() => onRestore(it.spec)}>เรียกใช้</button>
                  <button className="btn text-xs px-2 py-0.5" onClick={() => del(i)}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

/** ④ Supplier DB — pick certified materials from partner suppliers. */
export function SupplierPanel({ data, onPick, source }: { data: SeedData; onPick: (materialId: number) => void; source?: 'local' | 'nocodb' }) {
  return (
    <div className="card lg:col-span-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="label">④ Supplier DB — วัสดุจากพาร์ทเนอร์ (พร้อมใบรับรอง CO₂)</div>
        <span className={`pill ${source === 'nocodb' ? 'pill-ok' : 'pill-accent'}`}>
          {source === 'nocodb' ? 'NocoDB live' : 'Local seed'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.suppliers.map((s) => (
          <div key={s.id} className="card-inset">
            <div className="font-semibold text-[15px]">{s.name}</div>
            <div className="text-xs text-ink-mute mb-2">Certificate: {s.co2Certificate} · {s.contact}</div>
            <div className="flex flex-wrap gap-1.5">
              {s.materialIds.map((mid) => {
                const m = data.materials.find((x) => x.id === mid)
                if (!m) return null
                return (
                  <button key={mid} className="btn text-xs px-2 py-1" onClick={() => onPick(mid)}
                    title={`${m.name} · ${m.emissionFactor} kgCO₂/kg`}>
                    {m.name} <span className="text-accent">· {m.emissionFactor} kgCO₂/kg</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
