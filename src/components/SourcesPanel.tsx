import { SOURCES } from '../data/sources'
import { CERTS } from '../data/certs'

const STATUS_STYLE: Record<string, string> = {
  achieved: 'pill-ok',
  'in-progress': 'pill-warn',
  planned: 'pill-accent',
  target: 'pill-warn',
}
const STATUS_LABEL: Record<string, string> = {
  achieved: '✓ ตามมาตรฐานแล้ว', 'in-progress': '◐ กำลังดำเนินการ', planned: '◉ dSURE roadmap', target: '○ เป้าหมายระยะถัดไป',
}

export default function SourcesPanel() {
  const entries = Object.values(SOURCES)
  return (
    <div className="space-y-4">
      {/* Certification & compliance roadmap */}
      <div className="card">
        <div className="label mb-3">การรับรอง &amp; มาตรฐาน — สถานะ EcoForge</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CERTS.map((c) => (
            <div key={c.id} className="card-inset">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[15px] font-semibold text-ink">{c.name}</span>
                <span className={`pill ${STATUS_STYLE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
              </div>
              <div className="text-[13px] text-accent">{c.org}</div>
              <div className="text-xs text-ink-mute mt-1">{c.scope}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-ink-mute">
          💡 dSURE = ตรารับรองผลิตภัณฑ์ดิจิทัลของ depa (Security/Safety/Functionality) — EcoForge วางแผนสมัครเพื่อสร้างความเชื่อมั่นให้ SME ที่ส่งข้อมูลโรงงาน
        </div>
      </div>

      <div className="card">
        <div className="label mb-1">แหล่งอ้างอิงทั้งหมด — ทุกตัวเลขใน EcoForge ย้อนกลับถึงเอกสารทางการ</div>
        <div className="text-xs text-ink-mute">
          EU CBAM Guidance (No.1–5f) · Default Values & Benchmarks Acts · ISO 14040/14044/14067 · ASTM E155 · TGO manuals · ICE/Ecoinvent/Grid factors
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {entries.map((s) => (
          <div key={s.id} className="card">
            <div className="text-[15px] font-semibold text-ink">{s.title}</div>
            <div className="text-[13px] text-accent">{s.publisher} · {s.year}</div>
            {s.detail && <div className="text-xs text-ink-mute mt-1">{s.detail}</div>}
          </div>
        ))}
      </div>
      <div className="card text-xs text-ink-mute space-y-1">
        <div className="label">Traceability map — ตัวเลขไหนมาจากไหน</div>
        <div>Benchmark per CN code → <b>SOURCES.benchmark</b> (Column L, route-specific)</div>
        <div>Default Value Thailand → <b>SOURCES.dv</b> (fallback when factory lacks actual data)</div>
        <div>CBAM factor 2.5→100% → <b>SOURCES.g4</b> (free allocation phase-out schedule)</div>
        <div>Direct-only rule for Al products → <b>SOURCES.g5e §2.2</b> (Annex II)</div>
        <div>De minimis 50 t/yr → <b>SOURCES.g1</b></div>
        <div>Emission factors (materials) → <b>SOURCES.ice / ecoinvent</b></div>
        <div>Grid factor 0.42 → <b>SOURCES.grid</b></div>
        <div>Payback carbon price 3,500 ฿/t → <b>SOURCES.carbonprice</b></div>
        <div>Methodology & formulas → <b>SOURCES.g3 + tgo</b></div>
      </div>
    </div>
  )
}
