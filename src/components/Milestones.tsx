// Real CBAM timeline per TGO CBAM Aluminium Manual (Aug 2024) + EU regulation.
const MS = [
  { date: 'ต.ค. 2566 (2023)', label: 'Transitional Period เริ่ม', note: 'ผู้นำเข้ารายงาน embedded emissions — ยังไม่เสียค่าธรรมเนียม · ไม่บังคับทวนสอบ', state: 'done' },
  { date: 'ธ.ค. 2568 (2025)', label: 'Transitional Period สิ้นสุด', note: 'เตรียมข้อมูล actual emissions + เอกสารทวนสอบให้พร้อม', state: 'active' },
  { date: 'ม.ค. 2569 (2026)', label: 'Definitive Period เริ่ม', note: 'ซื้อ CBAM certificates ตามปริมาณคาร์บอนจริง — obligation ไล่ขึ้นถึง 100% ปี 2034', state: 'upcoming' },
  { date: '2034', label: 'Phase-in เต็มรูปแบบ', note: 'CBAM แทนที่ใบอนุญาต ETS ฟรีโดยสมบูรณ์', state: 'upcoming' },
]

export default function Milestones() {
  return (
    <div className="card">
      <div className="label mb-3">ไทม์ไลน์ CBAM (ตามกฎจริง EU/TGO)</div>
      <div className="space-y-3">
        {MS.map((m) => (
          <div key={m.label} className="flex gap-2.5">
            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${m.state === 'done' ? 'bg-ok' : m.state === 'active' ? 'bg-warn animate-pulse' : 'bg-line'}`} />
            <div>
              <div className="text-[13px] font-semibold text-ink">{m.date} — {m.label}</div>
              <div className="text-xs text-ink-mute">{m.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
