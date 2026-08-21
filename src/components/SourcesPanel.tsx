import { SOURCES } from '../data/sources'

export default function SourcesPanel() {
  const entries = Object.values(SOURCES)
  return (
    <div className="space-y-4">
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
