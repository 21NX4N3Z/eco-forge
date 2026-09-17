import { useState } from 'react'
import { PartSpec } from './types'
import { useSeed } from './dataLayer'
import UnifiedTwin from './components/UnifiedTwin'
import OfflineToggle from './components/OfflineToggle'
import { LoadingSkeleton, ErrorCard } from './components/StatusCards'
import ViewToggle from './components/ViewToggle'
import SourcesPanel from './components/SourcesPanel'
import { IconTwin, IconDatabase, IconBook } from './components/icons'
import UserGuideModal from './components/UserGuideModal'

const DEFAULT_SPEC: PartSpec = {
  inputSource: 'standard', partType: 'Bracket', netMass: 3.7, materialId: 1,
  recycledPercent: 0, processId: 1, batchSize: 3, transportDist: 120,
}
type Tab = 'twin' | 'sources'

export default function App() {
  const [offline, setOffline] = useState(false)
  const { data, source, loading, error, addMaterial } = useSeed(offline)
  const [spec, setSpec] = useState<PartSpec>(DEFAULT_SPEC)
  const [tab, setTab] = useState<Tab>('twin')
  const [view, setView] = useState<'technical' | 'business'>('technical')
  const [guideOpen, setGuideOpen] = useState(false)
  const [motion, setMotion] = useState(true)
  function openWorkspace() {
    setTab('twin')
    requestAnimationFrame(() => document.getElementById('workspace')?.focus())
  }
  return (
    <div className={`formtrace ${motion ? '' : 'motion-paused'}`}>
      <div className="engineering-backdrop" aria-hidden="true"><div className="trace-orbit trace-orbit-one" /><div className="trace-orbit trace-orbit-two" /><div className="trace-axis" /></div>
      <a className="skip-link" href="#workspace">ข้ามไปพื้นที่คำนวณ</a>
      <div className="app-shell">
        <header className="app-header">
          <a href="#" className="brand-lockup" aria-label="FORMTRACE หน้าแรก">
            <svg className="brand-symbol" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 36V12h25M12 24h19" stroke="currentColor" strokeWidth="4" /><path d="m25 36 11-11M25 36h11V25" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>
            <span><span className="brand-name">FORMTRACE<span className="brand-period">.</span></span><span className="brand-caption">Carbon & Cost Engineering</span></span>
          </a>
          <div className="header-actions">
            <span className="maintainer-label">Independent project / X4N3Z</span>
            <button className="btn inline-flex items-center gap-2" onClick={() => setGuideOpen(true)}><IconBook className="w-4 h-4" />คู่มือเริ่มต้น</button>
            <button className="btn motion-toggle" onClick={() => setMotion(!motion)} aria-pressed={!motion}>{motion ? 'หยุดภาพเคลื่อนไหว' : 'เปิดภาพเคลื่อนไหว'}</button>
          </div>
        </header>

        <section className="workspace-hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> ENGINEERING DECISIONS, TRACED.</div>
            <h1 id="hero-title">ออกแบบการผลิตที่ดีขึ้น<br /><span>เริ่มจากตัวเลขที่เข้าใจได้</span></h1>
            <p>เชื่อมวัสดุ กระบวนการ ต้นทุน และคาร์บอนในพื้นที่เดียว<br className="desktop-break" /> เปรียบเทียบทางเลือกก่อนตัดสินใจ พร้อมย้อนดูตัวแปรที่ใช้คำนวณ</p>
            <div className="hero-actions"><button className="btn btn-primary" onClick={openWorkspace}>เปิดพื้นที่วิเคราะห์ <span aria-hidden="true">↗</span></button><span className="hero-note">คำนวณด้วยสูตร · AI ช่วยอธิบาย</span></div>
          </div>
          <div className="hero-diagram" aria-hidden="true">
            <div className="diagram-topline"><span>PROCESS EXPLORER</span><span>FT / 01</span></div>
            <svg viewBox="0 0 360 230" fill="none" className="part-drawing"><g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path className="part-face" d="m80 150 90-52 110 63-90 52Z"/><path d="M80 150V67l45-26v82l45-25M125 41l110 63v83M80 67l110 63v83M190 130l45-26M170 98v-31l110 63v31M170 67l45-26 110 63-45 26M280 161l45-26v-31"/><ellipse cx="187" cy="161" rx="23" ry="13"/><path strokeDasharray="4 5" d="M47 159 183 238M57 43v124M43 44h28M43 161h28M57 43l23-13M294 175l42-24"/><path className="diagram-trace" d="m80 150 110 63 90-52V130L170 67" strokeWidth="3"/></g><g fill="currentColor"><circle cx="80" cy="150" r="4"/><circle cx="280" cy="130" r="4"/><circle cx="190" cy="213" r="4"/></g></svg>
            <div className="diagram-bottomline"><span>MATERIAL → PROCESS → IMPACT</span><span>Parametric study</span></div>
          </div>
        </section>

        <div className="workflow-strip" aria-label="ขั้นตอนการใช้งาน"><span><b>01</b> กำหนดชิ้นงาน</span><span><b>02</b> ตรวจคาร์บอนและต้นทุน</span><span><b>03</b> เปรียบเทียบและส่งออกรายงาน</span></div>

        <main id="workspace" tabIndex={-1} className="workspace-main">
          <div className="workspace-toolbar">
            <nav className="workspace-nav" aria-label="พื้นที่ทำงาน">
              <button className={`btn inline-flex items-center gap-2 ${tab === 'twin' ? 'btn-active' : ''}`} aria-pressed={tab === 'twin'} onClick={() => setTab('twin')}><IconTwin className="w-4 h-4" />Carbon Twin</button>
              <button className={`btn inline-flex items-center gap-2 ${tab === 'sources' ? 'btn-active' : ''}`} aria-pressed={tab === 'sources'} onClick={() => setTab('sources')}><IconDatabase className="w-4 h-4" />แหล่งอ้างอิง</button>
            </nav>
            <ViewToggle view={view} setView={setView} />
          </div>
          <div className="data-status"><span><span className="status-dot" />{source === 'nocodb' ? 'ข้อมูลจาก NocoDB + ข้อมูลอ้างอิงในเครื่อง' : 'ชุดข้อมูลอ้างอิงในเครื่อง — แทนที่ด้วยข้อมูลโรงงานก่อนใช้ตัดสินใจ'}</span><div className="data-actions"><span>{offline ? 'โหมดออฟไลน์' : 'อนุญาตเชื่อมต่อออนไลน์'}</span><OfflineToggle offline={offline} setOffline={setOffline} /></div></div>
          {loading && <LoadingSkeleton />}
          {error && <ErrorCard message={error} />}
          <div className="workspace-content" key={tab}>
            {tab === 'sources' ? <SourcesPanel /> : !loading && <UnifiedTwin spec={spec} setSpec={setSpec} data={data} addMaterial={addMaterial} view={view} setView={setView} source={source} />}
          </div>
        </main>
        <section className="method-note" aria-label="ข้อจำกัดการใช้งาน"><IconBook className="w-5 h-5 shrink-0" /><p><strong>เครื่องมือช่วยตัดสินใจ ไม่ใช่ใบรับรอง</strong> ผลลัพธ์เป็นการประมาณตามข้อมูลและสมมติฐานที่เลือก ต้องตรวจสอบขอบเขตสินค้า กฎ CBAM และข้อมูลจริงก่อนยื่นรายงานหรือใช้ตัดสินใจทางธุรกิจ</p></section>
        <footer className="app-footer"><div><strong>FORMTRACE</strong><span>Personal continuation · maintained by X4N3Z</span></div><p>ต่อยอดจาก MATEKEYCBAM · ผลงานทีม Sriracha Hackathon 2026<br />เก็บประวัติและเครดิตผลงานเดิมไว้ในเอกสารโครงการ</p></footer>
      </div>
      <UserGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  )
}
