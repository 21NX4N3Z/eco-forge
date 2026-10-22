# FORMTRACE

**Carbon & Cost Engineering** — เปรียบเทียบวัสดุ กระบวนการ ต้นทุน และคาร์บอนในพื้นที่เดียว พร้อมประมาณการภาษี EU CBAM รายปี (2026–2034)

Personal continuation maintained by **X4N3Z**.
Origin: **MATEKEYCBAM** — team prototype, Sriracha Hackathon 2026 finalist (ทีม TME KMUTT). ผลงานทีมเดิมเก็บครบใน git history และเครดิตด้านล่าง

## What it does
- **4 แหล่งข้อมูล** — Standard DB / Manual / Factory History / Supplier (เลือกก่อนเข้า wizard)
- **Process Builder 4 ขั้น** — ชิ้นงาน → วัสดุ + %Recycled/Mix → กระบวนการ → Batch/Transport
- **เอนจิน deterministic** — material mix, energy, transport, MRV (Scope 1/2/3), CBAM obligation ตามปี (factor 2.5% 2026 → 100% 2034)
- **Carbon Twin dashboard** — KPI ที่คลิกแล้วเปิดชีตตัวแปร + สมการแทนค่าของตัวเลขนั้น, กราฟสลับชนิดได้ที่ตัวกราฟ, fullscreen
- **AI alternatives A/B/C** — เปรียบเทียบ CO₂/ต้นทุน/ภาษี CBAM/payback + คำอธิบาย "why" ผ่าน `/api/why` (AI ใช้เฉพาะอธิบาย ไม่ใช่คำนวณ)
- **PDF 4 เทมเพลต** — EU CBAM / Executive / Technical / Business + compliance badge + SDG

## Stack
Vite + React 18 + TypeScript + Tailwind **v3** (oklch-free เพื่อ html2canvas) · Recharts · jsPDF + html2canvas · Vercel Functions (`/api/why` AI proxy, `/api/noco` optional NocoDB proxy)

## Run
```bash
npm install
npm run dev        # พัฒนา
npm run typecheck  # tsc --noEmit
npm run build      # สร้าง dist/
```

## Data honesty (อ่านก่อนใช้จริง)
- ตัวเลขอ้างอิงจากเอกสารทางการที่ระบุในหน้า "แหล่งอ้างอิง" (EU CBAM Guidance No.1–5f, Benchmarks/Default Values, ISO 14040/14044/14067, TGO, ICE/EcoInvent) — ดู traceability map ในแอป
- ผลลัพธ์เป็น**การประมาณเพื่อช่วยตัดสินใจ ไม่ใช่ใบรับรอง** — ตรวจขอบเขตสินค้า/กฎปัจจุบัน/ข้อมูลโรงงานจริงก่อนยื่นรายงาน
- Local `seed.json` คือข้อมูลอ้างอิงตั้งต้น (offline-safe) — แทนที่ด้วยข้อมูลโรงงานจริงก่อนใช้ตัดสินใจ, NocoDB เป็นทางเลือกเมื่อมี credentials

## Status (2026-10-22)
- ✅ `tsc --noEmit` and `tsc -b` clean, `vite build` green
- ✅ Single source of truth for the AI model: `src/config/model.ts` → `AI_MODEL`,
  imported by both the Vercel proxy (`api/why.ts`, production) and the client
  direct-key path (`src/api/why.ts`, dev/demo). They no longer drift apart.
- ✅ Brand consolidated: the UI surface, `package.json` name and the deployed
  bundle all read FORMTRACE. Team credit for MATEKEYCBAM is kept in Credits only.
- ⚠️ `/api/why` on `eco-forge.vercel.app` is currently returning a provider 404
  (`Function '...': Not found for account '...'`) — the deployed serverless
  function is gone while the site still serves. The UI falls back to the
  offline rule-based answer, which is labelled `source: 'local'` so it is never
  presented as AI output. Fix = redeploy `api/why.ts` to the Vercel project.
- ℹ️ The `eco-forge` repo name and the `eco-forge.vercel.app` alias are kept
  deliberately: the domain and repo slug are the stable external identifiers,
  only the product brand changed.

## Credits
- **ทีม MATEKEYCBAM** (Sriracha Hackathon 2026) — คอนเซปต์, สถาปัตยกรรมเอนจิน, เอกสารและข้อมูลอ้างอิง
- **X4N3Z** — FORMTRACE: การพัฒนาต่อ, UI/UX, โครงสร้างพื้นฐาน
