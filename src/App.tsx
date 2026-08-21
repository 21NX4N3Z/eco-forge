import { useState } from 'react'
import { PartSpec, SeedData } from './types'
import { useSeed } from './dataLayer'
import UnifiedTwin from './components/UnifiedTwin'
import PdfReport from './components/PdfReport'
import OfflineToggle from './components/OfflineToggle'
import { LoadingSkeleton, ErrorCard } from './components/StatusCards'
import SdgBadges from './components/SdgBadges'
import ActivityFeed from './components/ActivityFeed'
import Milestones from './components/Milestones'
import ViewToggle from './components/ViewToggle'
import { IconTwin, IconDownload, IconSpark } from './components/icons'

const DEFAULT_SPEC: PartSpec = {
  inputSource: 'standard',
  partType: 'Bracket',
  netMass: 3.7,
  materialId: 1,
  recycledPercent: 0,
  processId: 1,
  batchSize: 3,
  transportDist: 120,
}

type Tab = 'twin' | 'export'

const TABS: { id: Tab; label: string; icon: typeof IconTwin }[] = [
  { id: 'twin', label: 'Carbon Twin', icon: IconTwin },
  { id: 'export', label: 'Export', icon: IconDownload },
]

export default function App() {
  const [offline, setOffline] = useState(false)
  const { data, source, loading, error, addMaterial } = useSeed(offline)
  const [spec, setSpec] = useState<PartSpec>(DEFAULT_SPEC)
  const [tab, setTab] = useState<Tab>('twin')
  const [view, setView] = useState<'technical' | 'business'>('technical')

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 lg:p-6 space-y-4 text-[16px]">
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg grid place-items-center text-white font-bold" style={{ background: '#0075de' }}>E</span>
          <div>
            <h1 className="text-3xl font-bold text-accent tracking-display leading-none">EcoForge</h1>
            <div className="text-xs text-ink-mute">Carbon Engineering for SME · EU CBAM · Sriracha Hackathon 2026</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`pill ${offline ? 'pill-warn' : 'pill-ok'}`}>
            <IconSpark className="w-3.5 h-3.5" /> {offline ? 'AI Offline' : 'AI Live'}
          </span>
          <SdgBadges compact />
          <OfflineToggle offline={offline} setOffline={setOffline} />
        </div>
      </header>

      {source === 'local' && (
        <div className="text-xs text-accent">● Local seed (offline-safe) — demo source of truth</div>
      )}

      {/* Tabs */}
      <nav className="flex gap-2 flex-wrap items-center">
        {TABS.map((t) => {
          const Ic = t.icon
          return (
            <button key={t.id} className={`btn py-2.5 inline-flex items-center gap-1.5 ${tab === t.id ? 'btn-active' : ''}`} onClick={() => setTab(t.id)}>
              <Ic className="w-4 h-4" /> {t.label}
            </button>
          )
        })}
        <div className="ml-auto">
          <ViewToggle view={view} setView={setView} />
        </div>
      </nav>

      {loading && <LoadingSkeleton />}
      {error && <ErrorCard message={error} />}

      {/* Body: main + right rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {!loading && tab === 'twin' && <UnifiedTwin spec={spec} setSpec={setSpec} data={data} addMaterial={addMaterial} view={view} setView={setView} />}
          {!loading && tab === 'export' && <PdfReport spec={spec} data={data} />}
        </div>
        <aside className="space-y-4">
          <ActivityFeed />
          <Milestones />
        </aside>
      </div>
    </div>
  )
}
