import { IconDatabase, IconPencil, IconFactory, IconHandshake, IconLayers } from './icons'

export type TemplateId = 'cbam' | 'exec' | 'tech' | 'biz' | 'all'

const TEMPLATES: { id: TemplateId; label: string; note: string; icon: typeof IconDatabase }[] = [
  { id: 'all', label: 'All-in-One', note: 'รวมทุกส่วนครบ — ส่งครั้งเดียวจบ', icon: IconLayers },
  { id: 'cbam', label: 'EU CBAM Standard', note: 'โครงสร้างตามที่ EU กำหนด + MRV scopes', icon: IconDatabase },
  { id: 'exec', label: 'Executive Summary', note: 'สรุปตัวเลขสำหรับผู้บริหาร 1 หน้า', icon: IconFactory },
  { id: 'tech', label: 'Technical Report', note: 'สมการ, porosity, มาตรฐาน ASTM/ISO', icon: IconPencil },
  { id: 'biz', label: 'Business Report', note: 'ต้นทุน, ประหยัด, Payback, CBAM Tax', icon: IconHandshake },
]

/** Brief หน้า 4 Export & Compliance — template picker before PDF export. */
export default function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateId
  onChange: (t: TemplateId) => void
}) {
  return (
    <div>
      <div className="label mb-2">เลือก Template</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {TEMPLATES.map((t) => {
          const Ic = t.icon
          const active = value === t.id
          return (
            <button key={t.id} onClick={() => onChange(t.id)} className={`btn text-left py-2.5 ${active ? 'btn-active' : ''}`}>
              <span className="flex items-center gap-2 font-semibold text-[14px]">
                <Ic className="w-4 h-4 shrink-0" /> {t.label}
              </span>
              <span className={`block text-[11px] mt-0.5 font-normal ${active ? 'text-white/80' : 'text-ink-mute'}`}>{t.note}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
