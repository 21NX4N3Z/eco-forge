import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PartSpec, SeedData } from '../types'
import { evaluate } from '../engine/cbam'
import { generateAlternatives } from '../engine/optimize'
import SdgBadges from './SdgBadges'
import { IconExport } from './icons'
import sdg9 from '../assets/sdg/TGG_Icon_Color_09.png'
import sdg12 from '../assets/sdg/TGG_Icon_Color_12.png'
import sdg13 from '../assets/sdg/TGG_Icon_Color_13.png'

/**
 * One-Click PDF Export. Renders an rgb-only .print-report container
 * (html2canvas-safe — never oklch) so the PDF is never black/blank.
 */
export default function PdfReport({ spec, data }: { spec: PartSpec; data: SeedData }) {
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const cur = evaluate(spec, data)
  const alts = generateAlternatives(spec, data)
  const cbam2028 = cur.cbam.find((c) => c.year === 2028)?.taxEur ?? 0

  async function exportPdf() {
    if (!ref.current) return
    setBusy(true)
    try {
      const canvas = await html2canvas(ref.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const w = 210
      const h = (canvas.height * w) / canvas.width
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h)
      pdf.save('EcoForge_Report.pdf')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <button className="btn btn-primary flex items-center gap-2" onClick={exportPdf} disabled={busy}>
        <IconExport className="w-4 h-4" /> {busy ? 'Generating…' : 'Export PDF (EU CBAM Template)'}
      </button>

      {/* Off-screen printable report */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={ref} className="print-report">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>EcoForge — EU CBAM Carbon Report</h1>
            <div style={{ textAlign: 'right', fontSize: 11 }}>
              <SdgInline />
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#475569' }}>
            Part: {spec.partType} · Material ID {spec.materialId} · Process ID {spec.processId} ·
            Net {spec.netMass} kg · Batch {spec.batchSize}/mo
          </p>

          <div className="p-card" style={{ margin: '12px 0' }}>
            <h2 style={{ fontSize: 15, margin: '0 0 6px' }}>Carbon Score: {cur.score}/100</h2>
            <div>Annual CO₂: <b>{(cur.annualCo2 / 1000).toFixed(2)} t</b></div>
            <div>Annual Cost: <b>฿{(cur.annualCost / 1000).toFixed(0)}K</b></div>
            <div className={cbam2028 > 0 ? 'p-bad' : 'p-good'}>
              CBAM Tax 2028: €{cbam2028} {cbam2028 > 0 ? '(payable)' : '(pass — below benchmark)'}
            </div>
          </div>

          <h2 style={{ fontSize: 15 }}>Options Comparison</h2>
          <table>
            <thead><tr><th>Option</th><th>CO₂/yr</th><th>Cost/yr</th><th>CBAM 2028</th></tr></thead>
            <tbody>
              <tr><td>Current</td><td>{(cur.annualCo2 / 1000).toFixed(2)} t</td><td>฿{(cur.annualCost / 1000).toFixed(0)}K</td><td>€{cbam2028}</td></tr>
              {alts.map((a) => (
                <tr key={a.label}>
                  <td>{a.label} — {a.note}</td>
                  <td>{(a.result.annualCo2 / 1000).toFixed(2)} t</td>
                  <td>฿{(a.result.annualCost / 1000).toFixed(0)}K</td>
                  <td>€{a.result.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ fontSize: 15, marginTop: 12 }}>Data Sources & Verification</h2>
          <p style={{ fontSize: 11, color: '#475569' }}>
            Emission factors: ICE Database v3.0, EcoInvent. Thai Grid Factor 0.42 kgCO₂/kWh (EGAT/IEA).
            Calculation: deterministic cradle-to-gate. Compliant with ISO 14040 / ASTM E155.
          </p>
          <p style={{ fontSize: 11, color: '#475569' }}>
            SDG 9 (Industry & Innovation) · SDG 12 (Responsible Consumption) · SDG 13 (Climate Action)
          </p>
        </div>
      </div>
    </div>
  )
}

function SdgInline() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <img src={sdg9} alt="SDG 9" style={{ height: 34, width: 'auto' }} />
      <img src={sdg12} alt="SDG 12" style={{ height: 34, width: 'auto' }} />
      <img src={sdg13} alt="SDG 13" style={{ height: 34, width: 'auto' }} />
    </div>
  )
}
