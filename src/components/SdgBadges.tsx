const SDGS = [
  { id: 9, label: 'Industry & Innovation', color: '#fbbf24' },
  { id: 12, label: 'Responsible Consumption', color: '#34d399' },
  { id: 13, label: 'Climate Action', color: '#22d3ee' },
]

export default function SdgBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex gap-2 items-center">
      {SDGS.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold"
          style={{ borderColor: s.color, color: s.color }}
          title={`SDG ${s.id}: ${s.label}`}
        >
          <span className="w-4 h-4 rounded-full grid place-items-center text-[10px]"
                style={{ background: s.color, color: '#070b14' }}>{s.id}</span>
          {!compact && <span>{s.label}</span>}
        </div>
      ))}
    </div>
  )
}
