const MEMBERS = [
  { name: 'มูอัซซิน', role: 'Lead / Carbon Eng', init: 'M' },
  { name: 'นที', role: 'Data / NocoDB', init: 'น' },
  { name: 'ปั้น', role: 'Frontend', init: 'ป' },
  { name: 'อิ๊ง', role: 'MRV / Audit', init: 'อ' },
  { name: 'ต้น', role: 'Supplier Liaison', init: 'ต' },
]

export default function Members() {
  return (
    <div className="card">
      <div className="label mb-3">ทีม EcoForge</div>
      <ul className="space-y-2.5">
        {MEMBERS.map((m) => (
          <li key={m.name} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full grid place-items-center text-[13px] font-semibold text-white"
                  style={{ background: '#0075de' }}>{m.init}</span>
            <div className="min-w-0">
              <div className="text-[14px] text-ink leading-tight">{m.name}</div>
              <div className="text-[11px] text-ink-mute">{m.role}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3 border-t border-line text-[12px] text-ink-mute">
        10+ สมาชิก · KMUTT BlackPearl FSAE
      </div>
    </div>
  )
}
