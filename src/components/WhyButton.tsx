import { useState } from 'react'
import { askWhy, WhyRequest, WhyResponse } from '../api/why'
import { IconHelp, IconAlert, IconCheck, IconSpark } from './icons'

const sevStyle = {
  high: 'border-bad/50 text-bad',
  med: 'border-warn/50 text-warn',
  low: 'border-accent/50 text-accent',
}
const sevIcon = { high: IconAlert, med: IconAlert, low: IconCheck }

/** Embedded AI Assistant — explains a single hotspot; never opens a chat screen. */
export default function WhyButton({ req, label = 'วิเคราะห์ด้วย AI' }: { req: WhyRequest; label?: string }) {
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

  const Icon = res ? sevIcon[res.severity] : IconSpark

  return (
    <div className="inline-block">
      <button className="btn text-xs flex items-center gap-1" onClick={onClick}>
        <IconSpark className="w-4 h-4" /> {label}
      </button>
      {open && (
        <div className={`mt-2 card max-w-sm border ${res ? sevStyle[res.severity] : ''}`}>
          <div className="flex items-center gap-2 mb-1 font-semibold text-sm">
            <Icon className="w-4 h-4" /> {loading ? 'AI กำลังวิเคราะห์…' : res?.explanation}
          </div>
          {res && <p className="text-xs text-ink-soft">{res.suggestion}</p>}
          {res && (
            <div className={`mt-2 text-[10px] font-semibold uppercase tracking-wide ${res.source === 'ai' ? 'text-accent' : 'text-ink-mute'}`}>
              {res.source === 'ai' ? '● Powered by Nous AI (live)' : '○ Offline rule-based (no network)'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
