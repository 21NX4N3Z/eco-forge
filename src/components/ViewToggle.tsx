import { IconChart, IconBolt } from './icons'

/**
 * Brief §4.2/4.3 — Technical (engineer) vs Business (owner) view toggle.
 * Controls which detail cards the dashboard shows.
 */
export default function ViewToggle({
  view,
  setView,
}: {
  view: 'technical' | 'business'
  setView: (v: 'technical' | 'business') => void
}) {
  return (
    <div className="inline-flex border border-line rounded-md overflow-hidden bg-surface-warm">
      <button
        onClick={() => setView('technical')}
        className={`px-3 py-1.5 text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors ${view === 'technical' ? 'bg-[#2e8aa8] text-white' : 'text-ink hover:bg-white'}`}
      >
        <IconChart className="w-3.5 h-3.5" /> Technical
      </button>
      <button
        onClick={() => setView('business')}
        className={`px-3 py-1.5 text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors ${view === 'business' ? 'bg-[#2e8aa8] text-white' : 'text-ink hover:bg-white'}`}
      >
        <IconBolt className="w-3.5 h-3.5" /> Business
      </button>
    </div>
  )
}
