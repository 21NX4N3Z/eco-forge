import { PartSpec, SeedData } from '../types'
import { evaluate } from '../engine/cbam'

/** What-If Simulator — sliders update CO2 / Cost / CBAM in real time. */
export default function WhatIf({
  spec, setSpec, data,
}: {
  spec: PartSpec
  setSpec: (s: PartSpec) => void
  data: SeedData
}) {
  const set = (p: Partial<PartSpec>) => setSpec({ ...spec, ...p })
  const r = evaluate(spec, data)
  const cbam2028 = r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0

  return (
    <div className="card space-y-4">
      <div className="label">What-If Simulator</div>
      <div>
        <div className="flex justify-between text-sm"><span>% Recycled</span><span>{spec.recycledPercent}%</span></div>
        <input type="range" min={0} max={100} value={spec.recycledPercent}
               onChange={(e) => set({ recycledPercent: Number(e.target.value) })}
               className="w-full accent-signal-cyan" />
      </div>
      <div>
        <div className="label">กระบวนการ</div>
        <select className="btn w-full" value={spec.processId}
                onChange={(e) => set({ processId: Number(e.target.value) })}>
          {data.processes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <div className="flex justify-between text-sm"><span>Batch (pcs/mo)</span><span>{spec.batchSize}</span></div>
        <input type="range" min={100} max={5000} step={100} value={spec.batchSize}
               onChange={(e) => set({ batchSize: Number(e.target.value) })}
               className="w-full accent-signal-cyan" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="CO₂/ปี" value={`${(r.annualCo2 / 1000).toFixed(2)} t`} tone="cyan" />
        <Stat label="Cost/ปี" value={`฿${(r.annualCost / 1000).toFixed(0)}K`} tone="green" />
        <Stat label="CBAM 2028" value={`€${cbam2028}`} tone={cbam2028 > 0 ? 'red' : 'green'} />
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'green' | 'red' }) {
  const c = { cyan: 'text-signal-cyan', green: 'text-signal-green', red: 'text-signal-red' }[tone]
  return (
    <div className="p-card text-center">
      <div className="label">{label}</div>
      <div className={`stat ${c}`}>{value}</div>
    </div>
  )
}
