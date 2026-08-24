# EcoForge Pro v2 — สรุปการประชุมทีม
## Sriracha Hackathon 2026 | ทีม TME มจธ. | 20 ส.ค. 2569

---

## สถาปัตยกรรมระบบ (ปรับปรุงหลังประชุม)

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT LAYER (4 ช่องทาง)                                    │
│  ├── 1. ค่ามาตรฐาน (Standard DB)                            │
│  ├── 2. เติมเอง (Manual Input)                               │
│  ├── 3. ดึงข้อมูลเก่า (Factory History)                      │
│  └── 4. พาร์ทเนอร์ซัพพลายเออร์ (Supplier DB)               │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  PROCESS BUILDER (Wizard)                                   │
│  Step 1: เลือกชนิดชิ้นงาน                                   │
│  Step 2: เลือกวัสดุ + ผสม (ถ้ามี)                           │
│  Step 3: เลือกกระบวนการ                                     │
│  Step 4: ใส่พารามิเตอร์ (Batch, Transport)                  │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  SIMULATION ENGINE                                          │
│  ├── สมการคำนวณผสมวัสดุ (Material Mix / Alloy)             │
│  ├── แสดงแนวโน้ม + ผลลัพธ์ EU CBAM ตามปี                   │
│  ├── คำนวณค่าเสียหาย / ภาษี CBAM หากส่งออก                 │
│  ├── กราฟแสดงสิ่งที่ EU CBAM ต้องการ (MRV)                 │
│  └── เปรียบเทียบ AI แนะนำหลายทางเลือก                      │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  OUTPUT LAYER                                               │
│  ├── เอกสารตาม Template EU CBAM + SDGs                     │
│  ├── ข้อมูลสำหรับวิศวกร (Technical View)                    │
│  └── ข้อมูลสำหรับผู้ประกอบการ (Business View)              │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  EXPORT                                                     │
│  ├── PDF Report (Template EU CBAM / Executive Summary)     │
│  └── Dashboard View (Technical / Business)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. INPUT LAYER — 4 ช่องทาง

### 1.1 ค่ามาตรฐาน (Standard DB)
- ดึงจากฐานข้อมูลที่รวบรวมไว้ใน NocoDB
- แหล่งที่มา: ICE Database, EcoInvent, ค่า Grid Factor ไทย
- ใช้ได้ทันที ไม่ต้องกรอก

### 1.2 เติมเอง (Manual Input)
- วิศวกรกรอกค่าเอง เมื่อมีวัสดุใหม่หรือค่าพิเศษที่ยังไม่มีใน DB
- ฟอร์มกรอก: ชื่อวัสดุ, Density, Embodied CO₂/kg, ราคา, แหล่งที่มา

### 1.3 ดึงข้อมูลเก่า (Factory History)
- ดึงจากงานคำนวณครั้งก่อนของโรงงาน (table `factory_history`)
- ใช้ซ้ำ ปรับแก้ หรือเปรียบเทียบกับงานปัจจุบัน
- ประหยัดเวลาไม่ต้องกรอกใหม่ทั้งหมด

### 1.4 พาร์ทเนอร์ซัพพลายเออร์ (Supplier Data)
- ดึงข้อมูลวัสดุจากซัพพลายเออร์ที่เป็น Partner
- มีใบรับรอง CO₂ (Certificate) จากซัพพลายเออร์โดยตรง
- อัปเดตราคา/ค่า Carbon แบบ Real-time (ถ้ามี API)

---

## 2. PROCESS BUILDER (Wizard) — 4 ขั้นตอน

| ขั้นตอน | รายละเอียด |
|---------|------------|
| **Step 1** | เลือกชนิดชิ้นงาน: Bracket, Housing, Shaft, Flange, Mount, Custom |
| **Step 2** | เลือกวัสดุ + ปรับ % Recycled / ผสม (Mix) + เลือกแหล่งที่มา (4 ทาง) |
| **Step 3** | เลือกกระบวนการ: CNC from Billet, Extrusion, Gravity Die Casting, Additive Mfg |
| **Step 4** | ใส่พารามิเตอร์: Batch Size (ชิ้น/เดือน), Transport Distance (km) |

> **ใหม่:** ก่อนเข้า Step 1 ต้องเลือก **Input Source** ก่อน (ปุ่ม 4 ปุ่ม) — ระบบจะดึงข้อมูลตามที่เลือก

---

## 3. SIMULATION ENGINE — หัวใจของระบบ

### 3.1 สมการคำนวณตอนผสมวัสดุ (Material Mix / Alloy)

กรณีใช้วัสดุผสม หรือปรับ % Recycled:

```
CO₂_mix = Σ (weight_fractionᵢ × CO₂_materialᵢ)

ตัวอย่าง:
Al 6061-T6 (Virgin)     50% × 8.24 = 4.12
Al 6061-T6 (Recycled)   50% × 0.50 = 0.25
─────────────────────────────────────────
CO₂_mix รวม              = 4.37 kgCO₂/kg
```

หรือกรณี Alloy:
```
Al 6061 = Al (97.9%) + Mg (1.0%) + Si (0.6%) + Cu (0.28%)
CO₂_Alloy = (0.979 × 8.24) + (0.01 × 22.0) + (0.006 × 2.5) + (0.0028 × 2.0)
```

### 3.2 แสดงแนวโน้ม + ผลลัพธ์ EU CBAM ตามปี

| ปี | ภาระผูกพัน (Obligation) | สถานะ |
|----|------------------------|--------|
| 2026 | 0% (Reporting Only) | ต้องรายงาน ยังไม่ต้องจ่าย |
| 2027 | 22% | เริ่มจ่าย Certificate |
| 2028 | 40% | ขยายครอบคลุมชิ้นส่วนยานยนต์ |
| 2029 | 60% | |
| 2030 | 80% | |
| 2031-2033 | 100% | จ่ายเต็ม |

แสดงเป็น **Trend Chart** ว่าค่าใช้จ่าย CBAM จะเพิ่มขึ้นอย่างไรหากไม่ปรับปรุงกระบวนการ

### 3.3 คำนวณค่าเสียหาย / ภาษี CBAM

```
CBAM Tax = (Embodied CO₂ - EU Benchmark) × ETS Price × Obligation %

ตัวอย่าง:
- Embodied CO₂ ชิ้นงาน: 4.2 ตัน/ปี
- EU Benchmark (Aluminum): 2.5 ตัน/ปี
- เกิน: 1.7 ตัน/ปี
- ETS Price: ~€180/ตัน (ประมาณการ)
- Obligation 2028: 40%
- CBAM Tax = 1.7 × 180 × 0.40 = €122.4/ปี

หากปรับปรุงเหลือ 1.8 ตัน/ปี:
- เกิน: 0 ตัน/ปี (ต่ำกว่า Benchmark)
- CBAM Tax = €0 ✅
```

แสดงบน Dashboard เป็น **"CBAM Tax Liability"** (ตัวเลขสีแดงถ้าต้องจ่าย / สีเขียวถ้าผ่าน)

### 3.4 กราฟแสดงสิ่งที่ EU CBAM ต้องการ (MRV)

EU CBAM ต้องการข้อมูล 3 ส่วน:
1. **Direct Emissions (Scope 1)** — กระบวนการผลิตในโรงงาน
2. **Indirect Emissions (Scope 2)** — ไฟฟ้าที่ใช้
3. **Embedded Emissions (Upstream)** — วัสดุ + Transport

แสดงเป็น **Stacked Bar Chart** แยกตามหมวดหมู่ที่ EU กำหนด

### 3.5 เปรียบเทียบ AI แนะนำหลายทางเลือก

AI เสนอพร้อมตัวเลขเปรียบเทียบ:

| ทางเลือก | กระบวนการ | CO₂/ปี | ลดได้ | ต้นทุน | CBAM Tax | Payback |
|----------|-----------|--------|--------|--------|----------|---------|
| **ปัจจุบัน** | CNC Billet | 4.2 ตัน | — | ฿520K | €122 | — |
| **A** | Gravity Die Casting | 1.8 ตัน | 57% | ฿380K | €0 | 8 เดือน |
| **B** | Extrusion + CNC | 2.5 ตัน | 40% | ฿420K | €0 | 12 เดือน |
| **C** | 50% Recycled + CNC | 2.9 ตัน | 31% | ฿460K | €29 | — |

แสดงเป็น **Comparison Table** + **Radar Chart** (เปรียบเทียบหลายมิติ)

---

## 4. OUTPUT LAYER — 3 รูปแบบ

### 4.1 เอกสารตาม Template EU CBAM + SDGs
- PDF โครงสร้างตาม EU CBAM Reporting Template
- ระบุชัดเจนว่าสอดคล้อง SDG 8 (Decent Work & Economic Growth), SDG 9 (Industry), SDG 12 (Responsible Consumption), SDG 13 (Climate Action)
- มีส่วน Verification & Data Source

### 4.2 ข้อมูลสำหรับวิศวกร (Technical View)
- สมการคำนวณละเอียด
- ค่าความเสี่ยงทางวิศวกรรม (Porosity, Tolerance, Strength)
- มาตรฐานที่ต้องตรวจสอบ (ASTM E155, ISO 14040)
- กราฟละเอียดทางเทคนิค

### 4.3 ข้อมูลสำหรับผู้ประกอบการ (Business View)
- สรุปตัวเลข: ต้นทุน, ประหยัด, Payback, CBAM Tax
- กำไรที่อาจเสียหากไม่ปรับปรุง
- กราฟสรุปสำหรับผู้บริหาร (Executive Summary)

---

## 5. UI FLOW — 4 หน้าหลัก

### หน้า 1: Process Builder (Wizard)
```
┌─────────────────────────────────────────┐
│  เลือกแหล่งข้อมูล [4 ปุ่มใหญ่]          │
│  [🏭 ค่ามาตรฐาน] [✏️ เติมเอง]           │
│  [📂 ข้อมูลเก่า] [🤝 ซัพพลายเออร์]      │
├─────────────────────────────────────────┤
│  Step 1: เลือกชิ้นงาน                   │
│  Step 2: เลือกวัสดุ + %Recycled        │
│  Step 3: เลือกกระบวนการ                 │
│  Step 4: Batch Size / Transport         │
│  [🚀 วิเคราะห์]                         │
└─────────────────────────────────────────┘
```

### หน้า 2: Carbon Digital Twin Dashboard
```
┌─────────────────────────────────────────┐
│  Carbon Score: 72/100  🔴               │
├─────────────────────────────────────────┤
│  Before [Donut] → After [Donut]         │
├─────────────────────────────────────────┤
│  CBAM Tax Liability: €122/ปี  🔴        │
│  [กราฟแนวโน้ม CBAM ตามปี]              │
├─────────────────────────────────────────┤
│  Hotspot: Material 60% | Process 25%    │
├─────────────────────────────────────────┤
│  AI Recommendation (3 ทางเลือก)        │
│  ┌────────┬────────┬────────┐          │
│  │ ทาง A  │ ทาง B  │ ทาง C  │          │
│  └────────┴────────┴────────┘          │
│  [❓ Why this?]                         │
└─────────────────────────────────────────┘
```

### หน้า 3: What-If Simulator
```
┌─────────────────────────────────────────┐
│  % Recycled: [░░░▓▓▓▓▓] 50%            │
│  Process: [Gravity Die Casting ▼]      │
│  Batch: [▓▓▓▓▓░░░░░] 1,000            │
├─────────────────────────────────────────┤
│  REAL-TIME RESULT                       │
│  CO₂: 1.8 ตัน/ปี ⬇️                    │
│  Cost: ฿380K/ปี ⬇️                     │
│  CBAM Tax: €0/ปี ✅                     │
│  [💾 Save Scenario]                     │
└─────────────────────────────────────────┘
```

### หน้า 4: Export & Compliance
```
┌─────────────────────────────────────────┐
│  เลือก Template:                       │
│  [📋 EU CBAM Standard]                  │
│  [📊 Executive Summary]                 │
│  [🔧 Technical Report]                  │
│  [💼 Business Report]                   │
├─────────────────────────────────────────┤
│  CBAM Compliance Badge:                 │
│  ✅ ผ่านเกณฑ์ 2026-2028                │
│  ⚠️ ต้องตรวจสอบ Porosity (ASTM E155)   │
├─────────────────────────────────────────┤
│  [📥 Export PDF] [📤 Share]             │
└─────────────────────────────────────────┘
```

---

## 6. DATA SCHEMA ปรับปรุง (NocoDB)

### Table เดิม (ยังใช้)
- `materials`
- `processes`
- `calculations`

### Table ใหม่ (เพิ่ม)

**table: `suppliers`**
| field | type | ตัวอย่าง |
|-------|------|----------|
| name | string | Thai Metal Supply Co. |
| material_ids | json | [1, 3, 5] |
| co2_certificate | string | ISO 14040 |
| contact | string | sales@tms.co.th |

**table: `factory_history`**
| field | type |
|-------|------|
| factory_name | string |
| previous_calculation_id | string |
| date | datetime |
| notes | text |

**table: `cbam_rates`**
| field | type | ตัวอย่าง |
|-------|------|----------|
| year | number | 2026 |
| obligation_percent | number | 0 |
| ets_price_eur | number | 180 |
| benchmark_co2 | number | 2.5 |

**table: `material_mixes`** (สำหรับสมการผสม)
| field | type | ตัวอย่าง |
|-------|------|----------|
| name | string | Al 6061-50% Recycled |
| material_id_1 | number | 1 |
| percent_1 | number | 50 |
| material_id_2 | number | 2 |
| percent_2 | number | 50 |
| calculated_co2 | number | 4.37 |

---

## 7. แผนงานปรับปรุง (หลังประชุม)

| วันที่ | งานหลัก | คนทำ |
|--------|---------|------|
| **21 ส.ค.** | ปรับ DB Schema เพิ่ม suppliers, factory_history, cbam_rates, material_mixes | C |
| **21 ส.ค.** | เขียนสมการคำนวณ CBAM Tax + Material Mix | A |
| **21-22 ส.ค.** | ปรับ UI: เพิ่ม Input Selector (4 ทาง) + CBAM Tax Display + Trend Chart | B |
| **22 ส.ค.** | ทดสอบ Simulation Engine กับ case จริง | A + B |
| **23 ส.ค.** | Final cut คลิป (ต้องโชว์ Input 4 ทาง + CBAM Tax + Template Export) | C |
| **24 ส.ค.** | ส่งคลิป | C |
| **25 ส.ค.** | Buffer / ตรวจสอบ | ทุกคน |

---

## 8. สรุปสิ่งที่เพิ่มจากเดิม (หลังประชุม)

| เดิม | ใหม่ |
|------|------|
| Input แบบกรอกอย่างเดียว | **Input 4 ทาง** (มาตรฐาน / เติมเอง / ข้อมูลเก่า / ซัพพลายเออร์) |
| คำนวณ CO₂ อย่างเดียว | **+ คำนวณ CBAM Tax** (ค่าเสียหายหากส่งออก) |
| ไม่มีแนวโน้ม | **+ Trend Chart** (CBAM Obligation ตามปี) |
| AI แนะนำ 1-2 ทาง | **+ AI Comparison Table** (เปรียบเทียบหลายทางเลือกชัดเจน) |
| PDF ทั่วไป | **+ Template EU CBAM** (ตรงตามที่ EU กำหนด) |
| Output แบบเดียว | **+ 2 มุมมอง** (Technical สำหรับวิศวกร / Business สำหรับผู้ประกอบการ) |
| ไม่มีสมการผสมวัสดุ | **+ Material Mix Calculation** (Alloy / Recycled Blend) |

---

## 9. ตัวอย่าง Demo Case ปรับปรุง (ใช้ในคลิป)

**Case: Bracket อากาศยาน — Input จากซัพพลายเออร์**

| | ปัจจุบัน | ทางเลือก A (AI แนะนำ) |
|---|---|---|
| **Input Source** | ค่ามาตรฐาน | พาร์ทเนอร์ซัพพลายเออร์ |
| **วัสดุ** | Al 6061-T6 (Virgin) | Al 6061-T6 (50% Recycled) |
| **กระบวนการ** | CNC 3-axis from Billet | Gravity Die Casting + CNC Finish |
| **Scrap Rate** | 70% | 12% |
| **CO₂/ปี** | 4.2 ตัน | 1.8 ตัน |
| **Cost/ปี** | ฿520,000 | ฿380,000 |
| **CBAM Tax 2028** | €122/ปี 🔴 | €0/ปี ✅ |
| **CBAM Tax 2034** | €612/ปี 🔴 | €0/ปี ✅ |
| **Payback** | — | 8 เดือน |
| **SDG** | — | SDG 8, 9, 12, 13 |

---

**ทีม TME มจธ. | Sriracha Hackathon 2026 | Smart Environment & Circular Economy**
