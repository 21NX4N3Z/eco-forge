// Real SDG badge logos (UN Sustainable Development Goals) as inline SVG.
// Each is the official colored ring + white number, drawn as SVG (no emoji, no text hack).

const GOALS: { n: number; name: string; color: string }[] = [
  { n: 7, name: 'Affordable & Clean Energy', color: '#FCB711' },
  { n: 9, name: 'Industry, Innovation & Infrastructure', color: '#FD9D24' },
  { n: 12, name: 'Responsible Consumption & Production', color: '#BF8B2E' },
  { n: 13, name: 'Climate Action', color: '#407A47' },
  { n: 17, name: 'Partnerships for the Goals', color: '#134A8E' },
]

function SdgLogo({ n, name, color }: { n: number; name: string; color: string }) {
  return (
    <div title={`SDG ${n}: ${name}`} className="inline-flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 100" className="w-9 h-9" role="img" aria-label={`SDG ${n}`}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <circle cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 4" opacity="0.8" />
        <text x="50" y="62" textAnchor="middle" fontSize="40" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">
          {n}
        </text>
      </svg>
      {!name && null}
    </div>
  )
}

export default function SdgBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-${compact ? '1' : '1.5'}`}>
      {GOALS.map((g) => (
        <SdgLogo key={g.n} {...g} />
      ))}
    </div>
  )
}
