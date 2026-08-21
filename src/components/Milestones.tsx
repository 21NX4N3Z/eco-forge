const MS = [
  { year: 2026, label: 'เริ่มรายงาน CBAM', note: 'Transitional period — ส่งรายงานembedding quota', done: true },
  { year: 2027, label: 'ขยายขอบเขต', note: 'เพิ่ม indirect emissions (electricity)', done: true },
  { year: 2028, label: 'เริ่มจ่ายภาษี', note: 'Financial obligation เต็มรูปแบบ', done: false, active: true },
  { year: 2030, label: 'ลด free allocation', note: 'ETS แจกฟรีลดลง 50%', done: false },
  { year: 2033, label: 'เต็มร้อย', note: 'No free allocation — ภาษีเต็ม', done: false },
]

export default function Milestones() {
  return (
    <div className="card">
      <div className="label mb-4">ไทม์ไลน์ CBAM → 2033</div>
      <ol className="relative border-l border-line ml-2 space-y-4">
        {MS.map((m) => (
          <li key={m.year} className="ml-4">
            <span className={`absolute -left-[7px] w-3 h-3 rounded-full border-2 ${
              m.done ? 'bg-ok border-ok' : m.active ? 'bg-accent border-accent' : 'bg-surface-card border-line'
            }`} />
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold text-ink">{m.year}</span>
              <span className="text-[13px] text-ink-soft">{m.label}</span>
              {m.active && <span className="pill pill-accent">ปัจจุบัน</span>}
            </div>
            <div className="text-[12px] text-ink-mute">{m.note}</div>
          </li>
        ))}
      </ol>
    </div>
  )
}
