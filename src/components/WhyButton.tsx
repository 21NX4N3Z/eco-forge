import { useState } from 'react'
import { askWhy, WhyRequest, WhyResponse } from '../api/why'
import { IconHelp, IconAlert, IconCheck } from './icons'

const sevStyle = {
  high: 'border-signal-red/50 text-signal-red',
  med: 'border-signal-amber/50 text-signal-amber',
  low: 'border-signal-cyan/50 text-signal-cyan',
}
const sevIcon = { high: IconAlert, med: IconAlert, low: IconCheck }

/** Embedded AI Assistant — explains a single hotspot; never opens a chat screen. */
export default function WhyButton({ req, label = 'Why this?' }: { req: WhyRequest; label?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState<WhyResponse | null>(null)

  async function onClick() {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (res) return
    setLoading(true)
    const r = await askWhy(req)
    setRes(r)
    setLoading(false)
  }

  const Icon = res ? sevIcon[res.severity] : IconHelp

  return (
    <div className="inline-block">
      <button className="btn text-xs flex items-center gap-1" onClick={onClick}>
        <IconHelp className="w-4 h-4" /> {label}
      </button>
      {open && (
        <div className={`mt-2 card max-w-sm border ${res ? sevStyle[res.severity] : ''}`}>
          <div className="flex items-center gap-2 mb-1 font-semibold text-sm">
            <Icon className="w-4 h-4" /> {loading ? 'Analyzing…' : res?.explanation}
          </div>
          {res && <p className="text-xs text-slate-600">{res.suggestion}</p>}
        </div>
      )}
    </div>
  )
}
