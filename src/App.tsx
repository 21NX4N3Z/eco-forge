import { useState } from 'react'
import { PartSpec, SeedData } from './types'
import { useSeed } from './dataLayer'
import ProcessBuilder from './components/ProcessBuilder'
import Dashboard from './components/Dashboard'
import WhatIf from './components/WhatIf'
import PdfReport from './components/PdfReport'
import OfflineToggle from './components/OfflineToggle'
import { LoadingSkeleton, ErrorCard } from './components/StatusCards'
import SdgBadges from './components/SdgBadges'

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

type Tab = 'builder' | 'dashboard' | 'whatif' | 'export'

export default function App() {
  const [offline, setOffline] = useState(false)
  const { data, source, loading, error } = useSeed(offline)
  const [spec, setSpec] = useState<PartSpec>(DEFAULT_SPEC)
  const [tab, setTab] = useState<Tab>('builder')
  const [view, setView] = useState<'technical' | 'business'>('business')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'builder', label: 'Process Builder' },
    { id: 'dashboard', label: 'Carbon Twin' },
    { id: 'whatif', label: 'What-If' },
    { id: 'export', label: 'Export' },
  ]

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 lg:p-6 space-y-4 text-[16px]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <h1 className="text-3xl font-bold text-accent tracking-display">EcoForge</h1>
          <div className="text-xs text-ink-mute">Carbon Engineering for SME · EU CBAM · Sriracha Hackathon 2026</div>
        </div>
        <div className="flex items-center gap-2">
          <SdgBadges compact />
          <OfflineToggle offline={offline} setOffline={setOffline} />
        </div>
      </header>

      {source === 'local' && (
        <div className="text-xs text-accent">● Local seed (offline-safe) — demo source of truth</div>
      )}

      <nav className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} className={`btn py-2.5 ${tab === t.id ? 'btn-active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <button className={`btn py-2.5 ml-auto ${view === 'technical' ? 'btn-active' : ''}`}
                onClick={() => setView(view === 'technical' ? 'business' : 'technical')}>
          {view === 'technical' ? 'Technical' : 'Business'} View
        </button>
      </nav>

      {loading && <LoadingSkeleton />}
      {error && <ErrorCard message={error} />}

      {!loading && tab === 'builder' && (
        <ProcessBuilder spec={spec} setSpec={setSpec} data={data} onAnalyze={() => setTab('dashboard')} />
      )}
      {!loading && tab === 'dashboard' && <Dashboard spec={spec} data={data} view={view} />}
      {!loading && tab === 'whatif' && <WhatIf spec={spec} setSpec={setSpec} data={data} />}
      {!loading && tab === 'export' && <PdfReport spec={spec} data={data} />}
    </div>
  )
}
