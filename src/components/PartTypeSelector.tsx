import { PartSpec } from '../types'
import { IconLayers } from './icons'

/**
 * Process Builder Step 1 — part type selector.
 * Brief: Bracket, Housing, Shaft, Flange, Mount, Custom (was hardcoded 'Bracket').
 * Each type carries a geometry preset (netMass + suggested process) so the
 * whole simulation re-calibrates when the type changes — not just a label.
 */
export const PART_TYPES: { id: string; note: string; preset: { netMass: number; processId?: number } }[] = [
  { id: 'Bracket', note: 'ตัวยึด / แขนรับแรง', preset: { netMass: 3.7 } },
  { id: 'Housing', note: 'กล่องเครื่อง / ฝาครอบ', preset: { netMass: 8.5, processId: 2 } },
  { id: 'Shaft', note: 'เพลาส่งกำลัง', preset: { netMass: 2.1, processId: 3 } },
  { id: 'Flange', note: 'ข้อต่อผนึก / วงแหวน', preset: { netMass: 1.4 } },
  { id: 'Mount', note: 'ฐานยึด / หมอนรอง', preset: { netMass: 0.9, processId: 2 } },
  { id: 'Custom', note: 'กำหนดเอง', preset: { netMass: 3.7 } },
]

export default function PartTypeSelector({
  spec,
  setSpec,
}: {
  spec: PartSpec
  setSpec: (s: PartSpec) => void
}) {
  return (
    <div>
      <div className="label mb-2">Step 1 — ชนิดชิ้นงาน (Part Type)</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PART_TYPES.map((t) => {
          const active = spec.partType === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSpec({ ...spec, partType: t.id, ...t.preset })}
              className={`btn py-2 text-left ${active ? 'btn-active' : ''}`}
              title={t.note}
            >
              <span className="flex items-center gap-1.5 text-[14px] font-semibold">
                <IconLayers className="w-3.5 h-3.5 shrink-0" /> {t.id}
              </span>
              <span className={`block text-[11px] mt-0.5 font-normal ${active ? 'text-white/80' : 'text-ink-mute'}`}>
                {t.note} · {t.preset.netMass} kg
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
