import { useEffect } from 'react'
import { IconBook, IconList, IconX } from './icons'

interface Props {
  open: boolean
  onClose: () => void
}

const STEPS = [
  {
    no: 1,
    title: 'เลือก Part Type',
    detail: 'Bracket / Housing / Shaft / Flange / Mount / Custom — ระบบจะ pre-fill net mass และ CN code ตามประเภท',
  },
  {
    no: 2,
    title: 'เลือกแหล่งข้อมูล (4 ช่องทาง)',
    detail: '① Standard DB (ICE/EcoInvent พร้อมใช้) · ② Manual Input (กรอกเอง) · ③ Factory History (scenario เก่า) · ④ Supplier DB (พร้อม CO₂ certificate)',
  },
  {
    no: 3,
    title: 'กรอกพารามิเตอร์',
    detail: 'Net Mass, % Recycled, Batch (pcs/mo), Transport (km) — แก้ค่าใดค่าหนึ่ง กราฟทุกตัวอัพเดตทันที',
  },
  {
    no: 4,
    title: 'อ่าน 5 KPI หลัก',
    detail: 'Carbon Score, CO₂/ปี, ต้นทุน/ปี, CBAM Tax 2028, T-VER Credit Revenue — คลิกที่การ์ดเพื่อดูตัวแปร + สมการเบื้องหลัง',
  },
  {
    no: 5,
    title: 'เปรียบเทียบ AI A/B/C',
    detail: 'AI เสนอ 3 ทางเลือกพร้อม payback period — เลือกที่เหมาะกับโรงงาน',
  },
  {
    no: 6,
    title: 'Export PDF',
    detail: 'เลือก template (EU CBAM Standard / Executive / Technical / Business) → คลิก Export PDF → ได้เอกสารพร้อมส่ง EU',
  },
]

const CHECKLIST = [
  { tag: 'ชิ้นงาน', items: ['ประเภทชิ้นงาน (Bracket/Housing/...)', 'น้ำหนันสุทธิ์ (Net Mass) ต่อชิ้น — kg', 'จำนวนผลิตต่อเดือน (Batch)'] },
  { tag: 'วัสดุ', items: ['ชื่อวัสดุ + alloy (เช่น Al 6061-T6)', 'Emission factor (kgCO₂/kg) — จากใบรับรอง supplier หรือ ICE Database', '% Recycled content (ถ้ามี)'] },
  { tag: 'กระบวนการผลิต', items: ['ชื่อกระบวนการ (CNC/Gravity Die Casting/...)', 'ค่าคาร์บอนจากเครื่องจักร (energy intensity kWh/kg + Scope 1 direct emission)', 'Scrap rate (%) — ถ้ามี'] },
  { tag: 'โลจิสติกส์', items: ['ระยะขนส่ง (km) จากโรงงานไปท่าเรือ/ลูกค้า EU', 'โหมดขนส่ง (รถบรรทุก/เรือ/รถไฟ)'] },
  { tag: 'บริบท CBAM', items: ['CN code (HS code 8 หลัก) — ใช้ดึง EU benchmark ตาม Guidance No.4', 'ปริมาณนำเข้าต่อปี (t/yr) — ตรวจ de minimis 50 t', 'ชื่อซัพพลายเออร์ + CO₂ certificate (ถ้ามี)'] },
]

export default function UserGuideModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 42, 56, 0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-guide-title"
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-surface-card border border-line shadow-deep rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — mint gradient */}
        <div className="hero-mint px-5 py-4 border-b border-line flex items-center gap-3">
          <IconBook className="w-6 h-6" style={{ color: '#1f6d87' }} />
          <div className="flex-1">
            <h2 id="user-guide-title" className="text-lg font-bold tracking-tight" style={{ color: '#1f6d87' }}>
              คู่มือการใช้ + ข้อมูลที่บริษัทต้องเตรียม
            </h2>
            <div className="text-[12px] text-ink-soft mt-0.5">MATEGAYCBAM — เริ่มคำนวณ CBAM ได้ใน 6 ขั้นตอน</div>
          </div>
          <button
            onClick={onClose}
            className="btn p-2 text-ink-soft hover:text-ink"
            aria-label="ปิด"
            title="ปิด (Esc)"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Section: Quick start */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="num-badge">i</span>
              <h3 className="text-[15px] font-bold text-ink">Quick Start — 6 ขั้นตอน</h3>
            </div>
            <ol className="space-y-2.5">
              {STEPS.map((s) => (
                <li key={s.no} className="card-inset flex gap-3 items-start">
                  <span className="num-badge-mute shrink-0">{s.no}</span>
                  <div>
                    <div className="text-[14px] font-semibold text-ink">{s.title}</div>
                    <div className="text-[12.5px] text-ink-soft leading-relaxed mt-0.5">{s.detail}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Section: Data checklist */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <IconList className="w-4 h-4 text-accent" />
              <h3 className="text-[15px] font-bold text-ink">ข้อมูลที่บริษัทต้องเตรียม</h3>
            </div>
            <p className="text-[12.5px] text-ink-soft mb-3 leading-relaxed">
              ก่อนเริ่มใช้ MATEGAYCBAM รวบรวมข้อมูลเหล่านี้จากฝ่ายผลิต / จัดซื้อ / วิศวกรรม
              (บางข้อไม่มีก็ได้ — ระบบจะใช้ค่า default จาก ICE / EcoInvent)
            </p>
            <div className="space-y-2.5">
              {CHECKLIST.map((c) => (
                <div key={c.tag} className="card-inset">
                  <div className="text-[12.5px] font-bold text-accent mb-1.5">▸ {c.tag}</div>
                  <ul className="space-y-1">
                    {c.items.map((it, i) => (
                      <li key={i} className="text-[12.5px] text-ink-soft flex gap-2">
                        <span className="text-accent shrink-0">·</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Important note about missing data */}
          <section className="card-inset" style={{ background: '#fdf2dc', borderColor: '#d99000' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-warn text-lg">⚠</span>
              <h3 className="text-[14px] font-bold text-warn">ข้อมูลที่ขาดไม่ได้ — ระบบจะหยุดคำนวณ</h3>
            </div>
            <p className="text-[12.5px] text-ink leading-relaxed">
              ถ้าในส่วน <b>พารามิเตอร์การผลิต</b> ไม่มีค่า <b>คาร์บอนระหว่างขนส่ง</b> (ระยะทาง = 0 หรือว่าง)
              หรือไม่มี <b>ข้อมูลคาร์บอนจากเครื่องจักร</b> (energy intensity เป็น 0 และ process ไม่ได้ระบุ)
              ระบบจะ <b>ไม่คำนวณ</b> และแสดงข้อความแจ้งเตือนแทน เพื่อกันตัวเลขคลาดเคลื่อนจนเสียหาย
            </p>
          </section>

          {/* Section: EU CBAM timeline */}
          <section>
            <h3 className="text-[14px] font-bold text-ink mb-2">ไทม์ไลน์ CBAM (ตามกฎจริง EU/TGO)</h3>
            <ul className="space-y-1 text-[12.5px] text-ink-soft">
              <li><b className="text-ink">2023:</b> Transitional Period เริ่ม — รายงาน embedded emissions (ยังไม่เสียค่าธรรมเนียม)</li>
              <li><b className="text-ink">2025 ธ.ค.:</b> Transitional Period สิ้นสุด — เตรียม actual data + เอกสารทวนสอบ</li>
              <li><b className="text-warn">2026 ม.ค.:</b> Definitive Period — <b>เก็บเงินจริงแล้ว</b> ต้องซื้อ CBAM certificates</li>
              <li><b className="text-ink">2034:</b> Phase-in เต็มรูปแบบ (CBAM factor = 100%)</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line flex items-center justify-between gap-2 bg-surface-warm">
          <div className="text-[11px] text-ink-soft">
            กด <kbd className="px-1.5 py-0.5 rounded border border-line-strong bg-white text-ink font-mono text-[10px]">Esc</kbd> เพื่อปิด
          </div>
          <button onClick={onClose} className="btn btn-primary text-xs">
            เข้าใจแล้ว — เริ่มใช้งาน
          </button>
        </div>
      </div>
    </div>
  )
}