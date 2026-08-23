# Overlay Edit Guide — วาง asset ลงคลิป Demo 3 นาที

> ใช้คู่กับ `docs/DEMO_SCRIPT_3MIN.md` · asset จาก https://eco-forge.vercel.app/overlays.html
> ทุก clip ถ่ายแบบ green screen #00b140 → key แล้ววางทับหน้าจอเว็บ

## ⚠️ เช็คก่อนคัตสุดท้าย: ตัวเลขในสคริปต์เก่า

| ตัวเลข | สคริปต์เขียน | เว็บตอนนี้แสดง |
|---|---|---|
| CO₂/ปี | 4.23 t | ✅ 4.23 t ตรง |
| CBAM Tax 2028 | **€124.78** | ❌ **€31/yr** (engine ปรับ formula แล้ว) |
| Option A | 0.88 t · €0 · 7.8 เดือน | ✅ 0.88 t · €0 · 7.8 เดือน ตรง |

→ **ถ้าฟุตเจจที่ถ่ายโชว์ €31 ให้พากย์ว่า "€31" — อย่าพูด €124.78 ตามสคริปต์เก่า** (กรรมการโชว์ตัวเลขไม่ตรงเสียง = จุดหักคะแนน)

## Chroma Key Recipe

| โปรแกรม | วิธี | ค่าแนะนำ |
|---|---|---|
| **CapCut** | คลิป overlay → Cutout → Chroma Key → วงด้วย eyedropper บนพื้นเขียว | Strength ~25-35, Shadow ~10 |
| **Premiere** | Effects → Ultra Key → eyedropper | Setting: Default · Aggressive ถ้าขอบมีเศษเขียว |
| **DaVinci** | Color page → 3D Keyer | ขยับ tolerance จนเขียวหาย + Qualifier spill |

- Key แล้วซูมดูขอบ 100% — ถ้ามี fringe เขียว เพิ่ม Spill Suppression / Edge Feather 1-2px
- อย่า key ที่ความสว่างจอจริงต่างจากตอน record (record กับ key ในแสงเดียวกัน)

## Timeline Map — วาง asset ตาม beat ของสคริปต์

| Time | Beat (สคริปต์) | Asset | ตำแหน่งบนจอ | Hold |
|---|---|---|---|---|
| 0:00–0:04 | เปิดคลิป | **A01 โลโก้** | กลางจอ ใหญ่ | 4s |
| 0:04–0:12 | ปัญหา CBAM | **A15 Counter 1,000+ โรงงาน** | ขวาบน | 6s |
| 0:12–0:20 | ชี้ KPI strip ในเว็บ | **A03 CO₂ Twin** (4.23→0.88) | ซ้ายล่าง (อย่าทับ KPI เว็บ) | 6s |
| 0:22–0:32 | ① Standard DB | *(ไม่ต้องมี overlay — ให้เห็นเว็บ)* | — | — |
| 0:32–0:42 | ② Manual Input | *(เว็บล้วน)* | — | — |
| 0:42–0:50 | ③④ History/Supplier | **A17 Activity Feed** | ขวาล่าง | 5s |
| 0:52–1:08 | Part type + พารามิเตอร์ | **A20 ฟอร์ม Input** (โชว์ช่วงพูด "manual number") | ซ้ายบน | 7s |
| 1:12–1:22 | สูตร CBAM + การ์ดภาษี | **A07 CBAM Trend bars** (€8→€242 โตทุกปี) | ขวาบน | 8s |
| 1:24–1:38 | MRV scopes | **A08 MRV Scopes** | ซ้ายล่าง | 8s |
| 1:40–1:45 | ปิดซีน trend | **A18 Timeline CBAM** (2569 definitive) | กลางล่าง | 5s |
| 1:48–2:00 | AI Compare ตาราง | **A11 ตาราง A/B/C ★Option A** | ขวาล่าง (ตารางเว็บอยู่กลาง) | 8s |
| 2:02–2:10 | Payback | **A13 Payback 7.8 เดือน** | กลางบน | 6s |
| 2:12–2:20 | Radar Option A | **A09 Radar วัสดุ** (mirror กับ radar ในเว็บ) | ซ้ายบน | 6s |
| 2:22–2:30 | Export templates | *(เว็บล้วน)* | — | — |
| 2:30–2:40 | Compliance badge | **A04 Badge PASS €0** | ขวาบน | 5s |
| 2:40–2:50 | PDF + SDG | **A22 SDG strip** | กลางล่าง | 5s |
| 2:50–2:56 | ปิด | **A02 KPI Strip** (สรุป 29→85 · €31→€0) | กลางจอ | 6s |
| 2:56–3:00 | Logo out | **A01 โลโก้** (fade ออกพร้อมมูฟวี่จบ) | กลางจอ | 4s |

### Asset เหลือ (B-roll / ใช้เสริมถ้ามีเวลา)
- **A05 Donut · A06 Hotspot · A10 Strength · A12 Spec Sheet** — เสียบช่วงพูดเรื่อง hotspot/วัสดุศาสตร์ถ้าคัตไหนสั้น
- **A14 ป้ายราคา · A16 AI Bubble · A19 Certs · A21 Tech/Biz Flip** — สำรองไว้ตอบ Q&A หรือตัด trailer สั้น 30 วิ

## กฎการวาง (กันหน้าตามือใหม่)
1. Overlay **ห้ามทับสิ่งที่กำลังชี้** — วางฝั่งตรงข้ามเสมอ
2. Scale คงที่ทั้งคลิป (~85-95% ขนาดที่ record) — อย่าย่อย่อใหญ่เฉพาะบางชิ้น
3. เข้า-ออกของ overlay คือ animation ในตัวแล้ว **ห้ามเพิ่ม transition** ซ้อน (จะดูเละ)
4. ชิ้นไหน loop ไม่จบพอดีคัต — ตัดตอนมัน fade-out เอง (84% ของวงจร)
5. Safe margin 10% รอบจอ — กันโดน UI player ตอนกรรมการกดดู

## Export Settings
- 1080p (หรือตามที่ hackathon กำหนด), 30fps, H.264 high bitrate ~16-20 Mbps
- เสียง: พากย์ −6dB headroom, เพลงพื้นหลัง −20dB ใต้เสียงพูด
- ตั้งชื่อไฟล์: `EcoForge_Demo_3min_TME_KMUTT.mp4`
