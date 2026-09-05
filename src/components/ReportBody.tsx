import { PartSpec, SeedData, CalcResult, Alternative } from '../types'
import SdgInline from './SdgInline'
import { TemplateId } from './TemplatePicker'
import { paybackMonths, paybackLabel } from '../utils/payback'
import { complianceItems } from './ComplianceBadge'

/**
 * Full report body — shared between the off-screen print container
 * and the on-screen preview modal. Renders sections conditionally
 * by template; 'all' renders everything.
 */

interface Props {
  spec: PartSpec
  data: SeedData
  cur: CalcResult
  alts: Alternative[]
  best: Alternative | null
  bestPb: number | null
  cbam2028: number
  tpl: TemplateId
  TPL_TITLE: Record<TemplateId, string>
}

export default function ReportBody({ spec, data, cur, alts, best, bestPb, cbam2028, tpl, TPL_TITLE }: Props) {
  const show = (...sections: string[]) => tpl === 'all' || sections.includes(tpl)

  const m = data.materials.find((x) => x.id === spec.materialId)
  const creditRevenue = best ? Math.max(0, (cur.annualCo2 - best.result.annualCo2) / 1000) * 220 : 0

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>MATEGAYCBAM — {TPL_TITLE[tpl]}</h1>
        <div style={{ textAlign: 'right', fontSize: 11 }}>
          <SdgInline />
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#475569' }}>
        Part: {spec.partType} · CN {spec.cnCode ?? '—'} · Material: {m?.name} · Process ID {spec.processId} ·
        Net {spec.netMass} kg · Batch {spec.batchSize}/mo · Transport {spec.transportDist} km · Date {new Date().toLocaleDateString('th-TH')}
      </p>

      {/* Compliance badge — all templates */}
      <div style={{
        margin: '10px 0', padding: '8px 12px', borderRadius: 6,
        backgroundColor: cbam2028 === 0 ? '#e7f5ea' : '#fdeaea',
        border: `1px solid ${cbam2028 === 0 ? '#1aae39' : '#c44a6b'}`,
        color: cbam2028 === 0 ? '#16a085' : '#b02a2a', fontSize: 13, fontWeight: 700,
      }}>
        {cbam2028 === 0
          ? '✓ CBAM Compliance: PASS — below EU benchmark (ผ่านเกณฑ์)'
          : `✗ CBAM Compliance: WARNING — €${cbam2028}/yr payable · Porosity check required (ASTM E155)`}
      </div>

      {/* KPI block — all templates */}
      <div className="p-card" style={{ margin: '12px 0' }}>
        <h2 style={{ fontSize: 15, margin: '0 0 6px' }}>Carbon Score: {cur.score}/100</h2>
        <div>Annual CO₂: <b>{(cur.annualCo2 / 1000).toFixed(2)} t</b></div>
        <div>Annual Cost: <b>฿{(cur.annualCost / 1000).toFixed(0)}K</b></div>
        <div className={cbam2028 > 0 ? 'p-bad' : 'p-good'}>
          CBAM Tax 2028: €{cbam2028} {cbam2028 > 0 ? '(payable)' : '(pass — below benchmark)'}
        </div>
        {creditRevenue > 0 && <div className="p-good">Carbon Credit revenue potential: +฿{Math.round(creditRevenue).toLocaleString()}/yr (T-VER)</div>}
        {best && (
          <div className="p-cyan">
            Best option {best.label}: −{((cur.annualCo2 - best.result.annualCo2) / 1000).toFixed(2)} tCO₂/yr ·
            Payback {bestPb != null ? paybackLabel(bestPb) : '—'}
          </div>
        )}
      </div>

      {/* ── Options Comparison: exec / cbam / tech / all ── */}
      {(tpl === 'all' || tpl === 'exec' || tpl === 'cbam' || tpl === 'tech') && (
        <>
          <h2 style={{ fontSize: 15 }}>{tpl === 'exec' ? 'Options Comparison' : 'Options Comparison & AI Recommendation'}</h2>
          <table>
            <thead><tr><th>Option</th><th>CO₂/yr</th><th>Cost/yr</th><th>CBAM 2028</th>{tpl !== 'exec' && <th>Payback</th>}</tr></thead>
            <tbody>
              <tr><td>Current</td><td>{(cur.annualCo2 / 1000).toFixed(2)} t</td><td>฿{(cur.annualCost / 1000).toFixed(0)}K</td><td>€{cbam2028}</td>{tpl !== 'exec' && <td>—</td>}</tr>
              {alts.map((a) => {
                const pb = paybackMonths(cur.annualCost, a.result.annualCost, cur.annualCo2 - a.result.annualCo2, a.toolingDeltaThb)
                return (
                  <tr key={a.label}>
                    <td>{a.label} — {a.note}</td>
                    <td>{(a.result.annualCo2 / 1000).toFixed(2)} t</td>
                    <td>฿{(a.result.annualCost / 1000).toFixed(0)}K</td>
                    <td>€{a.result.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}</td>
                    {tpl !== 'exec' && <td>{paybackLabel(pb)}</td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {cbam2028 > 0 && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, backgroundColor: '#fdeaea', border: '1px solid #c44a6b', color: '#b02a2a', fontSize: 12, fontWeight: 700 }}>
              ⚠ Lost Profit Warning: ไม่ปรับปรุง = เสียภาษี CBAM €{cbam2028}/yr (เพิ่มขึ้นทุกปีตาม CBAM factor schedule)
            </div>
          )}
        </>
      )}

      {/* ── Business: cost/payback focus ── */}
      {(tpl === 'biz') && (
        <>
          <h2 style={{ fontSize: 15 }}>Cost & Payback</h2>
          <table>
            <thead><tr><th>Option</th><th>ต้นทุน/ปี</th><th>ประหยัด/ปี</th><th>ลงทุนเพิ่ม (tooling)</th><th>Payback</th></tr></thead>
            <tbody>
              <tr><td>ปัจจุบัน</td><td>฿{(cur.annualCost / 1000).toFixed(0)}K</td><td>—</td><td>—</td><td>—</td></tr>
              {alts.map((a) => {
                const pb = paybackMonths(cur.annualCost, a.result.annualCost, cur.annualCo2 - a.result.annualCo2, a.toolingDeltaThb)
                const saveK = Math.max(0, cur.annualCost - a.result.annualCost) / 1000
                return (
                  <tr key={a.label}>
                    <td>{a.label}</td>
                    <td>฿{(a.result.annualCost / 1000).toFixed(0)}K</td>
                    <td>{saveK > 0 ? `${saveK.toFixed(0)}K` : '—'}</td>
                    <td>฿{(a.toolingDeltaThb ?? 0).toLocaleString()}</td>
                    <td>{paybackLabel(pb)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {/* ── Technical detail: tech / all ── */}
      {(tpl === 'tech' || tpl === 'all') && m && (
        <>
          <h2 style={{ fontSize: 15, marginTop: 14 }}>Engineering Detail</h2>
          <table>
            <tbody>
              <tr><th>Gross mass</th><td>{cur.grossMass.toFixed(2)} kg (scrap {cur.scrapMass.toFixed(2)} kg)</td></tr>
              <tr><th>Mix CO₂</th><td>{cur.mixCo2.toFixed(2)} kgCO₂/kg</td></tr>
              <tr><th>Per-part embodied</th><td>{cur.perPartCo2.toFixed(3)} kgCO₂</td></tr>
              <tr><th>Benchmark used (CN route L)</th><td>{cur.benchmark} tCO₂e/t{cur.dvTh ? ` · DV Thailand fallback ${cur.dvTh}` : ''}</td></tr>
              <tr><th>Direct-only (Annex II)</th><td>{cur.directOnly ? 'YES — Scope 2 excluded from taxable base' : 'No — all scopes counted'}</td></tr>
              <tr><th>MRV Scope 1 / 2 / 3</th><td>{Math.round(cur.mrv.scope1)} / {Math.round(cur.mrv.scope2)} / {Math.round(cur.mrv.scope3)} kgCO₂/yr</td></tr>
            </tbody>
          </table>
          <h2 style={{ fontSize: 15, marginTop: 12 }}>Material Science — {m.name}</h2>
          <table>
            <tbody>
              <tr><th>Alloy</th><td>{m.alloy}</td></tr>
              <tr><th>Density</th><td>{m.density} kg/m³</td></tr>
              <tr><th>Emission factor</th><td>{m.emissionFactor} kgCO₂/kg</td></tr>
              <tr><th>Tensile / Yield</th><td>{m.tensileStrength} / {m.yieldStrength} MPa</td></tr>
              <tr><th>Hardness</th><td>{m.hardness} HB · Elongation {m.elongation}%</td></tr>
              <tr><th>Thermal / Electrical</th><td>{m.thermalCond} W/m·K · {m.electricalCond} %IACS</td></tr>
              <tr><th>Porosity class</th><td>{m.porosityClass} (ASTM E155)</td></tr>
              <tr><th>Recycle grade</th><td>{m.recycleGrade}{m.rohs ? ' · RoHS compliant' : ''}</td></tr>
            </tbody>
          </table>
        </>
      )}

      {/* ── Compliance: always ── */}
      <h2 style={{ fontSize: 15, marginTop: 14 }}>Compliance</h2>
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

      {/* ── SDG: exec / all inline; others footer text ── */}
      {(tpl === 'all' || tpl === 'exec') && (
        <>
          <h2 style={{ fontSize: 15, marginTop: 12 }}>Sustainable Development Goals</h2>
          <SdgInline />
        </>
      )}

      <h2 style={{ fontSize: 15, marginTop: 12 }}>Data Sources & Verification</h2>
      <p style={{ fontSize: 11, color: '#475569' }}>
        Emission factors: ICE Database v3.0, EcoInvent. Thai Grid Factor 0.42 kgCO₂/kWh (EGAT/TGO).
        Benchmarks &amp; Default Values: European Commission (Feb/Aug 2026). Methodology: EU CBAM Guidance No.1–5e.
        Calculation: deterministic cradle-to-gate per ISO 14040:2006 / ISO 14044:2006 / ISO 14067:2018 · ASTM E155.
      </p>
    </div>
  )
}

