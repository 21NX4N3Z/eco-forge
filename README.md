# MATEGAYCBAM

**AI-Powered Carbon Engineering Software** for Thai SME auto/aero parts manufacturers facing EU CBAM.

> Sriracha Hackathon 2026 — Team TME KMUTT (Muxlsxd / A, B, C)
> Updated to **v2** after team meeting 20 Aug 2026.

## Problem
- ~1,100 Tier-2/3 SME parts manufacturers in Thailand have no in-house environmental engineer.
- EU CBAM fully applies 1 Jan 2026; by 2030 it covers auto parts.
- LCA study costs ~EUR 10,000 (~฿370,000) per project — unaffordable for SMEs.
- CBAM costs Thailand ~USD 500M/yr; Thai auto parts exports ~USD 15.6B/yr.

## What's new in v2 (post-meeting)
| Was | Now |
|-----|-----|
| Single manual input | **4 Input Sources** (Standard DB / Manual / Factory History / Supplier) |
| CO₂ only | **+ CBAM Tax** (liability if exporting) |
| No trend | **+ CBAM Obligation Trend** by year (2026→2033) |
| 1-2 AI tips | **+ AI Comparison Table** (multiple alternatives + radar) |
| Generic PDF | **+ EU CBAM Template** + Technical / Business views |
| No mix calc | **+ Material Mix / Alloy** calculation |

## Architecture (4 layers)
```
INPUT (4 sources) → PROCESS BUILDER (4-step wizard) → SIMULATION ENGINE
→ OUTPUT (3 views) → EXPORT (PDF / Dashboard)
```

### 1. INPUT LAYER — 4 sources
1. **Standard DB** — NocoDB (ICE v3.0, EcoInvent, Thai Grid 0.42)
2. **Manual Input** — engineer fills material/density/CO₂/price/source
3. **Factory History** — reuse prior `factory_history` calculations
4. **Supplier DB** — partner suppliers with CO₂ certificates (real-time if API)

### 2. PROCESS BUILDER (Wizard)
- Step 1: Part type (Bracket / Housing / Shaft / Flange / Mount / Custom)
- Step 2: Material + % Recycled / Mix + source (4 ways)
- Step 3: Process (CNC from Billet / Extrusion / Gravity Die Casting / Additive)
- Step 4: Parameters (Batch Size /km, Transport Distance km)
- **Before Step 1:** pick Input Source (4 buttons)

### 3. SIMULATION ENGINE (core — deterministic)
- **Material Mix:** `CO₂_mix = Σ(weight_fractionᵢ × CO₂_materialᵢ)`
- **CBAM Tax:** `(Embodied CO₂ − EU Benchmark) × ETS Price × Obligation%`
  - e.g. (4.2 − 2.5) × €180 × 40% = €122.4/yr
- **CBAM Obligation trend:** 2026 0% → 2027 22% → 2028 40% → 2029 60% → 2030 80% → 2031-33 100%
- **MRV Stacked Bar:** Scope 1 (Direct) / Scope 2 (Indirect/electricity) / Scope 3 (Embedded)
- **AI Comparison:** rule-based engine generates alternatives (A/B/C) with CO₂/Cost/CBAM Tax/Payback; Hermes explains "why this" per point (JSON-in/out, no chat UI)

### 4. OUTPUT LAYER — 3 views
- **EU CBAM Template + SDG** (9 / 12 / 13) with Verification & Data Source
- **Technical View** — equations, engineering risk (Porosity/Tolerance/Strength), ASTM E155 / ISO 14040
- **Business View** — cost, savings, payback, CBAM tax, executive summary

## 4 Pages
1. **Process Builder** (Input selector + 4-step wizard)
2. **Carbon Digital Twin Dashboard** (Carbon Score 0-100, Before/After donut, CBAM Tax Liability, trend chart, hotspot, AI recommendation A/B/C, ❓ Why this?)
3. **What-If Simulator** (sliders → real-time CO₂ / Cost / CBAM Tax, Save Scenario)
4. **Export & Compliance** (Template picker, CBAM Compliance Badge, Export PDF / Share)

## Data Schema (NocoDB)
Existing: `materials`, `processes`, `calculations`
New (v2): `suppliers`, `factory_history`, `cbam_rates` (year/obligation%/ets_price/benchmark), `material_mixes`

## Demo Case (use in 3-min video)
**Aerospace Bracket — input from supplier**
| | Current | Alt A (AI) |
|---|---|---|
| Input Source | Standard | Supplier Partner |
| Material | Al 6061-T6 (Virgin) | Al 6061-T6 (50% Recycled) |
| Process | CNC 3-axis from Billet | Gravity Die Casting + CNC Finish |
| Scrap Rate | 70% | 12% |
| CO₂/yr | 4.2 t | 1.8 t |
| Cost/yr | ฿520,000 | ฿380,000 |
| CBAM Tax 2028 | €122/yr 🔴 | €0/yr ✅ |
| CBAM Tax 2034 | €612/yr 🔴 | €0/yr ✅ |
| Payback | — | 8 months |
| SDG | — | 9, 12, 13 |

> Note: UI must use **SVG icons, not emoji** (machine aesthetic / dark mode). Emojis in the meeting mockups (🏭✏️📂🤝🔴✅) are placeholders — replace with SVG.

## Stack (unchanged from v1)
- Frontend: Vite + React + TypeScript + Tailwind CSS **(v3 — avoid html2canvas oklch bug)**
- Database: NocoDB (+ local JSON fallback = demo source of truth)
- Auth: Firebase Auth
- AI Engine: Hermes via Nous Portal API (JSON-in / JSON-out) through Vercel serverless proxy
- Chart: Recharts
- PDF: html2canvas + jsPDF (rgb-only print container)

## Key decisions (from review + v2)
- Calculation engine is **deterministic** (fixed formulas). Hermes only explains points.
- **Local JSON = demo source of truth**; NocoDB = scalable story; never blocks demo.
- **Offline mode + local seed** always available (Backup Plan for live demo).
- CBAM Tax, Material Mix, Trend, MRV, AI Comparison are all rule-based (not LLM).

## Timeline (v2)
| Date | Work | Owner |
|------|------|-------|
| 21 Aug | DB schema + (suppliers, factory_history, cbam_rates, material_mixes) | C |
| 21 Aug | CBAM Tax + Material Mix equations | A |
| 21-22 Aug | UI: Input Selector + CBAM Tax display + Trend Chart | B |
| 22 Aug | Test Simulation Engine on real case | A+B |
| 23 Aug | Final video cut (show 4 inputs + CBAM Tax + Template Export) | C |
| 24 Aug | Submit video | C |
| 25 Aug | Buffer / verify | All |
| 28 Aug | Selection results | — |
| 11 Sep | Competition day @ Kasetsart Sriracha | — |

## Scoring focus (100 pts)
Innovation 25 · Technology & Implementation 25 · Sustainability & Impact 20 · Feasibility & Scalability 20 · Presentation 10

## Setup (for team)
```bash
git clone https://github.com/Muxlsxd/mategaycbam.git
cd mategaycbam
npm install
npm run dev
```
App code and `.env` are added in later phases. See `docs/ARCHITECTURE.md` for full spec and `docs/REVIEW.md` for review/decisions.

## Live deployment
- **Production:** https://mategaycbam.vercel.app (Vercel, auto-build from `dist/`)
- **AI endpoint:** `POST /api/why` — Vercel Function proxying the Nous inference API (`stealth/ox-alpha`, JSON-in/out, key stays server-side via `NOUS_API_KEY`). Graceful 504 on upstream timeout; frontend falls back to offline heuristic analysis.
- **Verified numbers** (deterministic engine, Bracket default spec): Current 4.23 tCO₂/yr · ฿524K · CBAM 2028 €31/yr — Alt A 0.88 t · €0 · payback ~7.8 months.
- Feature-complete per brief v2: part-type selector with geometry presets, AI comparison table A/B/C + radar + payback engine (tooling cost in seed), Technical/Business view toggle, PDF template picker (EU CBAM / Executive / Technical / Business), CBAM compliance badges, real SDG logo export.
