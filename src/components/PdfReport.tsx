import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PartSpec, SeedData } from '../types'
import { evaluate } from '../engine/cbam'
import { generateAlternatives } from '../engine/optimize'
import { paybackPeriod, paybackLabel } from '../engine/payback'
import SdgBadges from './SdgBadges'
import TemplatePicker, { TemplateId } from './TemplatePicker'
import { complianceItems, BadgeList } from './ComplianceBadge'
import { IconExport } from './icons'
import sdg9 from '../assets/sdg/TGG_Icon_Color_09.png'
import sdg12 from '../assets/sdg/TGG_Icon_Color_12.png'
import sdg13 from '../assets/sdg/TGG_Icon_Color_13.png'

/**
 * One-Click PDF Export with Template Picker (brief หน้า 4):
 *   EU CBAM Standard / Executive Summary / Technical Report / Business Report
 * Renders an rgb-only .print-report container (html2canvas-safe — never oklch)
 * so the PDF is never black/blank.
 */
export default function PdfReport({ spec, data }: { spec: PartSpec; data: SeedData }) {
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [tpl, setTpl] = useState<TemplateId>('cbam')
  const cur = evaluate(spec, data)
  const alts = generateAlternatives(spec, data)
  const cbam2028 = cur.cbam.find((c) => c.year === 2028)?.taxEur ?? 0
  const best = alts.length
    ? alts.reduce((a, b) => (b.result.annualCo2 < a.result.annualCo2 ? b : a))
    : null
  const bestPb = best ? paybackPeriod({ spec, result: cur }, { spec: best.spec, result: best.result }) : null

  const TPL_TITLE: Record<TemplateId, string> = {
    cbam: 'EU CBAM Carbon Report',
    exec: 'Executive Summary',
    tech: 'Technical Report',
    biz: 'Business Report',
  }

  async function exportPdf() {
    if (!ref.current) return
    setBusy(true)
    try {
      const canvas = await html2canvas(ref.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const w = 210
      const h = (canvas.height * w) / canvas.width
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h)
      pdf.save(`EcoForge_${TPL_TITLE[tpl].replace(/ /g, '_')}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="card">
        <TemplatePicker value={tpl} onChange={setTpl} />
      </div>

      <div className="card">
        <div className="label mb-2">CBAM Compliance Badge</div>
        <BadgeList items={complianceItems(spec, cur)} />
      </div>

      <button className="btn btn-primary flex items-center gap-2" onClick={exportPdf} disabled={busy}>
        <IconExport className="w-4 h-4" /> {busy ? 'Generating…' : `Export PDF (${TPL_TITLE[tpl]})`}
      </button>

      {/* Off-screen printable report */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={ref} className="print-report">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>EcoForge — {TPL_TITLE[tpl]}</h1>
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
            {best && (
              <div className="p-cyan">
                Best option {best.label}: −{((cur.annualCo2 - best.result.annualCo2) / 1000).toFixed(2)} tCO₂/yr ·
                Payback {bestPb ? paybackLabel(bestPb) : '—'}
              </div>
            )}
          </div>

          {/* Executive Summary: KPI-first, no deep tables */}
          {tpl === 'exec' && (
            <>
              <h2 style={{ fontSize: 15 }}>Key Numbers</h2>
              <table>
                <tbody>
                  <tr><th>Carbon Score</th><td>{cur.score}/100</td></tr>
                  <tr><th>CO₂/ปี</th><td>{(cur.annualCo2 / 1000).toFixed(2)} t</td></tr>
                  <tr><th>ต้นทุน/ปี</th><td>฿{(cur.annualCost / 1000).toFixed(0)}K</td></tr>
                  <tr><th>CBAM Tax 2028</th><td>€{cbam2028}</td></tr>
                  {best && <tr><th>แนะนำ (Option {best.label})</th><td>{best.note}</td></tr>}
                </tbody>
              </table>
            </>
          )}

          {/* Business Report: cost/payback focus */}
          {tpl === 'biz' && (
            <>
              <h2 style={{ fontSize: 15 }}>Cost & Payback</h2>
              <table>
                <thead><tr><th>Option</th><th>ต้นทุน/ปี</th><th>ประหยัด/ปี</th><th>ลงทุนเพิ่ม</th><th>Payback</th></tr></thead>
                <tbody>
                  <tr><td>ปัจจุบัน</td><td>฿{(cur.annualCost / 1000).toFixed(0)}K</td><td>—</td><td>—</td><td>—</td></tr>
                  {alts.map((a) => {
                    const pb = paybackPeriod({ spec, result: cur }, { spec: a.spec, result: a.result })
                    return (
                      <tr key={a.label}>
                        <td>{a.label}</td>
                        <td>฿{(a.result.annualCost / 1000).toFixed(0)}K</td>
                        <td>฿{Math.max(0, cur.annualCost - a.result.annualCost) / 1000 > 0 ? ((cur.annualCost - a.result.annualCost) / 1000).toFixed(0) + 'K' : '—'}</td>
                        <td>{pb.investmentThb > 0 ? `฿${pb.investmentThb.toLocaleString()}` : '—'}</td>
                        <td>{paybackLabel(pb)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}

          {/* Options comparison — full table for CBAM & Tech templates */}
          {(tpl === 'cbam' || tpl === 'tech') && (
            <>
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
            </>
          )}

          {/* Technical Report: engineering detail */}
          {tpl === 'tech' && (
            <>
              <h2 style={{ fontSize: 15, marginTop: 12 }}>Engineering Detail</h2>
              <table>
                <tbody>
                  <tr><th>Gross mass</th><td>{cur.grossMass.toFixed(2)} kg (scrap {cur.scrapMass.toFixed(2)} kg)</td></tr>
                  <tr><th>Mix CO₂</th><td>{cur.mixCo2.toFixed(2)} kgCO₂/kg</td></tr>
                  <tr><th>Per-part embodied</th><td>{cur.perPartCo2.toFixed(3)} kgCO₂</td></tr>
                  <tr><th>MRV Scope 1 / 2 / 3</th><td>{Math.round(cur.mrv.scope1)} / {Math.round(cur.mrv.scope2)} / {Math.round(cur.mrv.scope3)} kgCO₂/yr</td></tr>
                  <tr><th>Standards</th><td>ASTM E155 (porosity), ISO 14040 (LCA)</td></tr>
                </tbody>
              </table>
            </>
          )}

          {/* Compliance badges inside the PDF */}
          <h2 style={{ fontSize: 15, marginTop: 12 }}>Compliance</h2>
          <table>
            <tbody>
              {complianceItems(spec, cur).map((it, i) => (
                <tr key={i}>
                  <th style={{ width: 24 }}>{it.ok ? '✓' : '!'}</th>
                  <td className={it.ok ? 'p-good' : 'p-bad'}>{it.text}</td>
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
