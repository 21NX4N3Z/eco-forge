# EcoForge — สคริปต์คลิป Demo 3 นาที (Sriracha Hackathon 2026)

> Flow: Input 4 ทาง → Part type → CBAM Tax + Trend → AI Compare A/B/C + Payback → Template Picker + Export PDF
> ตัวเลข verified ที่ต้องโชว์: **4.23 tCO₂/ปี · €124.78 · payback ~7.8 เดือน**
> URL demo: https://eco-forge.vercel.app · ถ่ายที่ viewport ≥1280px, zoom 100%

---

## [0:00–0:20] Hook + ปัญหา

**กล้อง:** หน้าจอเต็ม, อยู่แท็บ Carbon Twin

พูด:
"โรงงาน SME ไทยที่ส่งของไป EU กำลังจะเจอ CBAM — ภาษีคาร์บอนที่เริ่มเก็บจริงปี 2027
EcoForge คือเครื่องมือที่บอกโรงงานภายในไม่กี่วินาทีว่า จะโดนภาษีเท่าไหร่ และลดมันลงยังไง"

**คลิก:** ชี้ KPI strip บนซ้าย → ให้กล้องเห็น 4 การ์ด: Carbon Score / CO₂ / ต้นทุน / CBAM 2028
**จุดโชว์:** การ์ด CBAM 2028 = **€124.78/yr สีแดง** ("ต้องจ่ายภาษี")

## [0:20–0:50] Input Layer — 4 ช่องทาง (brief §1)

**คลิก:** การ์ด Controls → แถว "แหล่งข้อมูลนำเข้า"

1. **① Standard DB** — พูด: "ค่ามาตรฐาน ICE/EcoInvent พร้อมใช้ ไม่ต้องกรอก"
2. **② Manual Input** — คลิก → ฟอร์มเพิ่มวัสดุใหม่ (กรอกชื่อ + emission factor สั้นๆ) → Add → dropdown วัสดุมีตัวใหม่ขึ้นทันที
3. **③ Factory History** — คลิก → โชว์ตาราง scenario เดิม → กด "เรียกใช้" 1 รายการ (spec เปลี่ยนตามจริง)
4. **④ Supplier DB** — คลิก → badge "Local seed"/"NocoDB live" มุมขวา → คลิกวัสดุซัพพลายเออร์ 1 ตัว

พูด: "ข้อมูลเข้าได้ 4 ทาง — มาตรฐาน กรอกเอง ประวัติโรงงาน และซัพพลายเออร์ที่มีใบรับรอง CO₂"

## [0:50–1:10] Process Builder — Part Type + พารามิเตอร์

**คลิก:** แถว Step 1 ชนิดชิ้นงาน → สลับ Bracket → Housing (netMass/process เปลี่ยนตาม) → กลับ **Bracket**

**คลิก:** ช่องตัวเลข Net Mass 3.7 kg, Batch 3 pcs/mo — พูด: "ทุก input เป็น manual number ปรับ real-time"

**จุดโชว์:** กราฟทุกตัวอัพเดตทันทีที่แก้ค่า (ห้ามตัดต่อข้าม — ให้เห็นว่า live)

## [1:10–1:45] Simulation Engine — CBAM Tax + Trend + MRV

**ชี้:** การ์ด CBAM 2028 อีกครั้ง → พูดสูตร:
"CBAM Tax = (Embodied CO₂ − EU Benchmark) × ETS Price × Obligation%
Bracket นี้ปี 2028 โดน **€124.78/ปี**"

**คลิก:** กราฟ "CBAM Obligation Trend 2026→2033" (คลิกที่ชื่อกราฟ = สลับ bar→line→area)
พูด: "ถ้าไม่ปรับปรุง ภาษีโตทุกปีตาม obligation — ปี 2031 ขึ้นไปเต็ม 100%"

**คลิก:** กราฟ MRV — พูด: "รายงานแยก 3 scopes ตามที่ EU กำหนด: direct, electricity, embedded"

## [1:45–2:20] AI Comparison A/B/C + Payback

**Scroll ไป:** การ์ด "AI Recommendation — เปรียบเทียบทางเลือก A/B/C"

**ชี้ตาราง:** ปัจจุบัน 4.23t → Option A **0.88t (−79%)**, CBAM €0, **payback ~7.8 เดือน** (แถว highlight ★)

พูด: "AI เสนอ 3 ทางเลือก — Option A เปลี่ยนเป็น Gravity Die Casting + 50% recycled
ลดคาร์บอน 79% ภาษี CBAM เป็นศูนย์ และลงทุนคืนตัวใน 8 เดือน"

**คลิก:** แถว Option A → radar chart เน้นเส้น Option A (ยิ่งกาง = ยิ่งดี)

## [2:20–2:50] Export — Template Picker + Compliance Badge

**คลิก:** แท็บ Export (บนขวา)

1. Template Picker 4 ปุ่ม — คลิกสลับ EU CBAM Standard ↔ Executive Summary ↔ Technical ↔ Business (พูด: "เอกสาร 4 รูปแบบ ตามผู้อ่าน")
2. **CBAM Compliance Badge** — เขียว "PASS below benchmark" หรือแดง + Porosity ASTM E155 note
3. **คลิก Export PDF** → PDF โหลด → เปิดโชว์หน้าเดียว: score, ตาราง options, compliance, SDG logos

## [2:50–3:00] ปิด

พูด: "EcoForge — จากข้อมูลโรงงาน สู่การตัดสินใจลดคาร์บอน และเอกสาร CBAM พร้อมส่ง EU ในคลิกเดียว
ทีม TME มจธ. Sriracha Hackathon 2026"

---

## Checklist ก่อนถ่าย
- [ ] `npm run dev` สด หรือใช้ vercel.app (แนะนำ prod — เสถียรกว่า)
- [ ] Factory History มีอย่างน้อย 1 scenario ฝั่ง localStorage ไว้โชว์ข้อ ③
- [ ] ตัวเลข anchor: **4.23 t · €124.78 · 0.88 t · €0 · 7.8 เดือน** — ถ้าไม่ตรง = engine เปลี่ยน ห้ามถ่าย
- [ ] NOUS_API_KEY บน Vercel ยังไม่หมดอายุ (ถ้าจะโชว์ Why button) — ไม่งั้นข้ามจุดนี้ได้
- [ ] ปิด notification/แชททุกอย่าง, browser profile สะอาด, dark cursor ใหญ่ๆ
