import { InputSource, PartSpec, SeedData } from '../types'
import { IconDatabase, IconPencil, IconFolder, IconHandshake } from './icons'

const SOURCES: { id: InputSource; label: string; icon: typeof IconDatabase; desc: string }[] = [
  { id: 'standard', label: 'ค่ามาตรฐาน', icon: IconDatabase, desc: 'ICE / EcoInvent / Thai Grid' },
  { id: 'manual', label: 'เติมเอง', icon: IconPencil, desc: 'กรอกวัสดุ/ค่าเอง' },
  { id: 'history', label: 'ข้อมูลเก่า', icon: IconFolder, desc: 'ดึงงานครั้งก่อน' },
  { id: 'supplier', label: 'ซัพพลายเออร์', icon: IconHandshake, desc: 'CO₂ certificate' },
]

const PARTS = ['Bracket', 'Housing', 'Shaft', 'Flange', 'Mount', 'Custom']

export default function ProcessBuilder({
  spec, setSpec, data, onAnalyze,
}: {
  spec: PartSpec
  setSpec: (s: PartSpec) => void
  data: SeedData
  onAnalyze: () => void
}) {
  const set = (p: Partial<PartSpec>) => setSpec({ ...spec, ...p })

  return (
    <div className="card space-y-4">
      <div className="label">1. เลือกแหล่งข้อมูล</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {SOURCES.map((s) => {
          const Icon = s.icon
          const active = spec.inputSource === s.id
          return (
            <button
              key={s.id}
              className={`btn flex flex-col items-center gap-1 h-20 ${active ? 'btn-active' : ''}`}
              onClick={() => set({ inputSource: s.id })}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="text-[10px] text-slate-500">{s.desc}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="label">2. ชนิดชิ้นงาน</div>
          <select className="btn w-full" value={spec.partType}
                  onChange={(e) => set({ partType: e.target.value })}>
            {PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <div className="label">3. วัสดุ ({spec.recycledPercent}% recycled)</div>
          <select className="btn w-full" value={spec.materialId}
                  onChange={(e) => set({ materialId: Number(e.target.value) })}>
            {data.materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <input type="range" min={0} max={100} value={spec.recycledPercent}
                 onChange={(e) => set({ recycledPercent: Number(e.target.value) })}
                 className="w-full mt-2 accent-signal-cyan" />
        </div>
        <div>
          <div className="label">4. กระบวนการ</div>
          <select className="btn w-full" value={spec.processId}
                  onChange={(e) => set({ processId: Number(e.target.value) })}>
            {data.processes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="label">Net Mass (kg)</div>
            <input type="number" className="btn w-full" value={spec.netMass}
                   onChange={(e) => set({ netMass: Number(e.target.value) })} />
          </div>
          <div>
            <div className="label">Batch (pcs/mo)</div>
            <input type="number" className="btn w-full" value={spec.batchSize}
                   onChange={(e) => set({ batchSize: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <div className="label">Transport (km)</div>
            <input type="number" className="btn w-full" value={spec.transportDist}
                   onChange={(e) => set({ transportDist: Number(e.target.value) })} />
          </div>
        </div>
      </div>

      <button className="btn btn-primary w-full text-base py-3" onClick={onAnalyze}>
        วิเคราะห์ Carbon Digital Twin
      </button>
    </div>
  )
}
