import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PartSpec, SeedData } from '../types'
import { evaluate } from '../engine/cbam'
import { generateAlternatives } from '../engine/optimize'
import { paybackMonths, paybackLabel } from '../utils/payback'
import SdgBadges from './SdgBadges'
import TemplatePicker, { TemplateId } from './TemplatePicker'
import ReportBody from './ReportBody'
import { complianceItems, BadgeList } from './ComplianceBadge'
import { IconExport } from './icons'

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
  const bestPb = best ? paybackMonths(cur.annualCost, best.result.annualCost, cur.annualCo2 - best.result.annualCo2, best.toolingDeltaThb) : null

  const TPL_TITLE: Record<TemplateId, string> = {
    cbam: 'EU CBAM Carbon Report',
    exec: 'Executive Summary',
    tech: 'Technical Report',
    biz: 'Business Report',
    all: 'All-in-One Report',
  }

  /** Slice a tall canvas into A4-ratio pages so text never falls off the sheet. */
  async function exportPdf() {
    if (!ref.current) return
    setBusy(true)
    try {
      const canvas = await html2canvas(ref.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = 210
      const pageH = 297 // full A4, no margins lost
      const pxPerMm = canvas.width / pageW
      const pageHpx = Math.floor(pageH * pxPerMm)
      const totalPages = Math.max(1, Math.ceil(canvas.height / pageHpx))
      for (let p = 0; p < totalPages; p++) {
        const sliceH = Math.min(pageHpx, canvas.height - p * pageHpx)
        const slice = document.createElement('canvas')
        slice.width = canvas.width
        slice.height = sliceH
        const ctx = slice.getContext('2d')!
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, slice.width, slice.height)
        ctx.drawImage(canvas, 0, -p * pageHpx)
        if (p > 0) pdf.addPage()
        pdf.addImage(slice.toDataURL('image/png'), 'PNG', 0, 0, pageW, (sliceH / pxPerMm))
      }
      pdf.save(`MATEGAYCBAM_${TPL_TITLE[tpl].replace(/ /g, '_')}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="card">
        <TemplatePicker value={tpl} onChange={setTpl} />
      </div>

      <div className="card">
        <div className="label mb-2">CBAM Compliance Badge</div>
        <BadgeList items={complianceItems(spec, cur)} />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button className="btn btn-primary flex items-center gap-2" onClick={exportPdf} disabled={busy}>
          <IconExport className="w-4 h-4" /> {busy ? 'Generating…' : `Export PDF (${TPL_TITLE[tpl]})`}
        </button>
        <button className="btn flex items-center gap-2" onClick={() => setPreviewOpen(true)}>
          👁 Preview
        </button>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-auto p-4" onClick={() => setPreviewOpen(false)}>
          <div className="max-w-[820px] mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2 sticky top-0">
              <span className="text-sm font-bold text-white drop-shadow">Preview — {TPL_TITLE[tpl]}</span>
              <button className="btn btn-primary" onClick={() => setPreviewOpen(false)}>✕ ปิด</button>
            </div>
            <div className="bg-white rounded shadow-2xl">
              {/* same content as print div — reuse via clone of the report markup */}
              <div className="print-report" style={{ width: '100%' }}>
                <ReportBody spec={spec} data={data} cur={cur} alts={alts} best={best} bestPb={bestPb} cbam2028={cbam2028} tpl={tpl} TPL_TITLE={TPL_TITLE} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Off-screen printable report */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={ref} className="print-report">
          <ReportBody
            spec={spec}
            data={data}
            cur={cur}
            alts={alts}
            best={best}
            bestPb={bestPb}
            cbam2028={cbam2028}
            tpl={tpl}
            TPL_TITLE={TPL_TITLE}
          />
        </div>
      </div>
    </div>
  )
}

