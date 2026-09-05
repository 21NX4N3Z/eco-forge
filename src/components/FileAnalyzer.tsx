import { useRef, useState } from 'react'
import { PartSpec, SeedData } from '../types'

interface ExtractResult {
  ok: boolean
  summary?: string
  fields?: Partial<PartSpec> & { materialName?: string; co2PerKg?: number }
  insights?: string[]
  error?: string
}

/**
 * Drag & drop file (CSV / XLSX / PDF / TXT) → parse client-side →
 * send extracted text to /api/why (AI) → AI maps it to PartSpec fields
 * and returns insights. Falls back to manual mapping hints on error.
 */
export default function FileAnalyzer({ data, onApply }: { data: SeedData; onApply: (patch: Partial<PartSpec>) => void }) {
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<ExtractResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    const f = files?.[0]
    if (!f || busy) return
    setBusy(true)
    setRes(null)
    try {
      let text = ''
      if (/\.(csv|txt|json)$/i.test(f.name)) {
        text = await f.text()
      } else if (/\.xlsx$/i.test(f.name)) {
        // XLSX: read via SheetJS if available; else instruct CSV
        try {
          const XLSX = await import('xlsx')
          const wb = XLSX.read(await f.arrayBuffer())
          text = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])
        } catch {
          throw new Error('อ่าน XLSX ไม่ได้ — กรุณา export เป็น CSV แล้วลองใหม่')
        }
      } else if (/\.pdf$/i.test(f.name)) {
        // PDF: extract text via pdfjs dynamic import (bundled by vite)
        try {
          const pdfjs = await import('pdfjs-dist')
          pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
          const doc = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise
          const parts: string[] = []
          for (let i = 0; i < Math.min(doc.numPages, 10); i++) {
            const page = await doc.getPage(i + 1)
            const c = await page.getTextContent()
            parts.push(c.items.map((it: any) => ('str' in it ? it.str : '')).join(' '))
          }
          text = parts.join('\n')
        } catch {
          throw new Error('อ่าน PDF ไม่ได้ — ลองไฟล์ CSV/TXT')
        }
      } else {
        throw new Error('รองรับ .csv .txt .json .xlsx .pdf เท่านั้น')
      }

      // truncate to keep payload small
      const snippet = text.slice(0, 6000)
      const res2 = await fetch('/api/why', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: 'extract',
          filename: f.name,
          text: snippet,
          hint: 'Extract part spec from this factory document. Reply ONLY with strict JSON: {"summary": string, "fields": {"partType": "Bracket|Housing|Shaft|Flange|Mount|Custom", "netMass": number(kg), "materialName": string, "co2PerKg": number, "recycledPercent": number, "batchSize": number(per month), "transportDist": number(km)}, "insights": [string]}. Omit unknown fields. Insights = max 3 short Thai sentences.',
        }),
      })
      if (!res2.ok) throw new Error(`AI endpoint ${res2.status}`)
      const j = await res2.json()
      // api may wrap content in choices[].message.content or return parsed JSON directly
      const raw = typeof j === 'object' && 'explanation' in j && !('summary' in j) ? null : j
      let parsed: any = raw
      if (!parsed && j?.choices?.[0]?.message?.content) {
        parsed = JSON.parse(j.choices[0].message.content.replace(/```json|```/g, '').trim())
      } else if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed.replace(/```json|```/g, '').trim())
      }
      setRes(parsed as ExtractResult)
    } catch (e: any) {
      setRes({ ok: false, error: e?.message ?? 'อ่านไฟล์ไม่สำเร็จ' })
    } finally {
      setBusy(false)
    }
  }

  function apply() {
    if (!res?.ok || !res.fields) return
    const patch: Partial<PartSpec> = {}
    const F = res.fields
    if (F.partType) patch.partType = F.partType
    if (typeof F.netMass === 'number' && F.netMass > 0) patch.netMass = F.netMass
    if (typeof F.recycledPercent === 'number') patch.recycledPercent = Math.min(100, Math.max(0, F.recycledPercent))
    if (typeof F.batchSize === 'number' && F.batchSize > 0) patch.batchSize = F.batchSize
    if (typeof F.transportDist === 'number' && F.transportDist >= 0) patch.transportDist = F.transportDist

    // material: match by name, or add via addMaterial-like flow handled in parent
    if (F.materialName) {
      const m = data.materials.find((m) => m.name.toLowerCase().includes(F.materialName!.toLowerCase().slice(0, 8)))
      if (m) patch.materialId = m.id
    }
    onApply(patch)
  }

  return (
    <div className="card lg:col-span-4">
      <div className="label mb-2">📎 ยัดไฟล์ — AI วิเคราะห์และกรอกค่าให้อัตโนมัติ</div>
      <div
        className={`card-inset border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${drag ? 'border-accent bg-[#d4eef4]' : 'border-line'}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (
          <div className="text-sm text-accent font-semibold">AI กำลังวิเคราะห์ไฟล์…</div>
        ) : (
          <>
            <div className="text-sm text-ink">ลากไฟล์มาวางที่นี่ หรือ<span className="text-accent underline">คลิกเลือกไฟล์</span></div>
            <div className="text-xs text-ink-mute mt-1">รองรับ .csv · .xlsx · .pdf · .txt — เช่น production log, utility bill, supplier CO₂ certificate</div>
          </>
        )}
        <input ref={inputRef} type="file" accept=".csv,.txt,.json,.xlsx,.pdf" className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {res && (
        <div className={`mt-3 card-inset ${res.ok ? '' : 'text-bad'}`}>
          {!res.ok ? (
            <div className="text-sm">⚠ {res.error}</div>
          ) : (
            <>
              <div className="text-[13px] font-semibold text-ink mb-1">{res.summary}</div>
              {res.insights && res.insights.length > 0 && (
                <ul className="text-xs text-ink-mute list-disc pl-4 space-y-0.5">
                  {res.insights.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              )}
              {res.fields && Object.keys(res.fields).length > 0 && (
                <button className="btn btn-active mt-2" onClick={apply}>
                  ✓ ใช้ค่าจากไฟล์ ({Object.keys(res.fields).filter((k) => (res.fields as any)[k] != null).length} ฟิลด์)
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
