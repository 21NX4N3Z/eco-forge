# MATEGAYCBAM — งานตัดสินช่วงสุดท้าย: ใครทำอะไร

> Deadline: คลิป 3 นาที · 25 ส.ค. 2026
> เลข anchor ทุกอย่าง (engine verified): **4.23 tCO₂/ปี · CBAM €31/ปี (2028) · Option A 0.88 t · €0 · payback 7.8 เดือน**

## 🤖 OWL/AI ทำแล้ว (ไม่ต้องแตะ)

| งาน | สถานะ |
|---|---|
| Overlay asset 22 ชิ้น green screen | ✅ mategaycbam.vercel.app/overlays.html |
| คู่มือตัดต่อ + timeline map ราย beat | ✅ docs/OVERLAY_EDIT_GUIDE.md |
| สคริปต์พากย์ 3 นาที (เลขถูกแล้ว) | ✅ docs/DEMO_SCRIPT_3MIN.md |
| Anchor sheet จอที่สอง (เลขถูกแล้ว) | ✅ /anchor-sheet.html |
| Sync ตัวเลข €124.78→€31 ทุกไฟล์ | ✅ เรียบร้อย |

## 👤 คนทำ (AI ทำไม่ได้)

### A. พากย์เสียง — ~30 นาที
- อ่านสคริปต์ docs/DEMO_SCRIPT_3MIN.md ตาม timestamp (คำเดิมทุกอย่าง แค่เปลี่ยนเลขเป็น "สามสิบเอ็ดยูโร")
- Record mic เงียบๆ, ระยะห่างไม้เปลี่ยนคงที่, export WAV

### B. ตัดต่อ — ~2-3 ชม.
1. Key เขียว overlay ทุก clip (recipe ใน guide)
2. V1: ฟุตเจจ + เสียงพากย์ sync ตามสคริปต์
3. V2: วาง overlay 22 ชิ้นตาม timeline map (หน้า 2 ของ guide)
4. Export 1080p H.264 → `MATEGAYCBAM_Demo_3min_TME_KMUTT.mp4`
5. **ส่งกลับมาให้ OWL review ก่อนอัปโหลด**

## 🔁 กระบวนการรีวิว (สำคัญ)
- ตัดเสร็จ → ทิ้งไฟล์ .mp4 ไว้ที่ `D:\hermes-workspace\mategaycbam\tmp\review\` แล้วบอก OWL
- OWL fable-judge: เช็คเลขบนจอ vs เสียง vs engine, ซูมดู fringe เขียว, เช็ค safe margin, ความยาว 3:00 ±5s
- ผ่าน → อนุญาตอัปโหลด → submit ภายใน 24 ส.

## ⏱ Timeline แนะนำ (เหลือ ~24 ชม.)
| เวลา | งาน |
|---|---|
| T-24h | พากย์ + key เขียว |
| T-18h | V1 คอกเสียง |
| T-12h | V2 วาง overlay |
| T-8h | ส่งรีวิว OWL |
| T-6h | แก้ note ที่ OWL flag |
| T-4h | Upload + submit ✓ (เผื่อ net ล่ม) |
