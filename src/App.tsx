import { useState } from 'react'
import { PartSpec, SeedData } from './types'
import { useSeed } from './dataLayer'
import UnifiedTwin from './components/UnifiedTwin'
import OfflineToggle from './components/OfflineToggle'
import { LoadingSkeleton, ErrorCard } from './components/StatusCards'
import SdgBadges from './components/SdgBadges'
import ActivityFeed from './components/ActivityFeed'
import Milestones from './components/Milestones'
import ViewToggle from './components/ViewToggle'
import SourcesPanel from './components/SourcesPanel'
import { badgeLine } from './data/certs'
import { IconTwin, IconSpark, IconDatabase, IconBook, IconList } from './components/icons'
import UserGuideModal from './components/UserGuideModal'

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

type Tab = 'twin' | 'sources'

const TABS: { id: Tab; label: string; icon: typeof IconTwin }[] = [
  { id: 'twin', label: 'Carbon Twin', icon: IconTwin },
  { id: 'sources', label: 'แหล่งอ้างอิง', icon: IconDatabase },
]

export default function App() {
  const [offline, setOffline] = useState(false)
  const { data, source, loading, error, addMaterial } = useSeed(offline)
  const [spec, setSpec] = useState<PartSpec>(DEFAULT_SPEC)
  const [tab, setTab] = useState<Tab>('twin')
  const [view, setView] = useState<'technical' | 'business'>('technical')
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 lg:p-6 space-y-4 text-[16px]">
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 pt-2 px-1 hero-mint rounded-2xl border border-line shadow-card">
        <div className="flex items-center gap-3 pl-1">
          <div className="w-11 h-11 rounded-xl grid place-items-center text-white font-bold text-lg shadow-glow" style={{ background: 'linear-gradient(135deg, #2e8aa8 0%, #3da9c9 100%)' }}>M</div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-display leading-none" style={{ color: '#1f6d87' }}>MATEGAYCBAM</h1>
            <div className="text-[11px] text-ink-soft mt-1 font-medium">Carbon Engineering for Thai SMEs · EU CBAM · Sriracha Hackathon 2026</div>
          </div>
        </div>
        <div className="flex items-center gap-2 pr-1">
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="btn text-xs flex items-center gap-1.5"
            aria-label="เปิดคู่มือการใช้และข้อมูลที่บริษัทต้องเตรียม"
            title="คู่มือการใช้ + ข้อมูลที่ต้องเตรียม"
          >
            <IconBook className="w-4 h-4" />
            <span className="hidden sm:inline">คู่มือ & ข้อมูลที่ต้องเตรียม</span>
            <span className="sm:hidden">คู่มือ</span>
          </button>
          <span className={`pill ${offline ? 'pill-warn' : 'pill-ok'}`}>
            <IconSpark className="w-3.5 h-3.5" /> {offline ? 'AI Offline' : 'AI Live'}
          </span>
          <SdgBadges compact />
          <OfflineToggle offline={offline} setOffline={setOffline} />
        </div>
      </header>

      {source === 'local' && (
        <div className="text-xs text-accent flex items-center gap-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Local seed (offline-safe) — demo source of truth
        </div>
      )}
      {source === 'nocodb' && (
        <div className="text-xs text-ok flex items-center gap-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-ok" /> NocoDB live — materials/processes pulled from cloud DB
        </div>
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
        <div className="ml-auto flex items-center gap-2">
          <ViewToggle view={view} setView={setView} />
        </div>
      </nav>

      {loading && <LoadingSkeleton />}
      {error && <ErrorCard message={error} />}

      {tab === 'sources' ? (
        <SourcesPanel />
      ) : (
        <>
          {/* Body: main + right rail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {!loading && tab === 'twin' && <UnifiedTwin spec={spec} setSpec={setSpec} data={data} addMaterial={addMaterial} view={view} setView={setView} source={source} />}
            </div>
            <aside className="space-y-4">
              <ActivityFeed />
              <Milestones />
            </aside>
          </div>
        </>
      )}

      <footer className="text-center text-[11px] text-ink-mute pt-3 pb-4 border-t border-line">
        MATEGAYCBAM · Carbon Engineering for Thai SMEs · EU CBAM methodology · {badgeLine()}
      </footer>

      <UserGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  )
}