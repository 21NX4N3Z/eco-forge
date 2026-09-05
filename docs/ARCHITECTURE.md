# MATEGAYCBAM — System Architecture (v2, post-meeting 20 Aug 2026)

> Source: team meeting summary `MATEGAYCBAM_Pro_v2_PostMeeting.md`.
> Companion: `README.md` (summary), `docs/REVIEW.md` (review + decisions).

## 1. System diagram
```
┌─────────────────────────────────────────────┐
│ INPUT LAYER (4 sources)                       │
│  1. Standard DB  2. Manual Input             │
│  3. Factory History  4. Supplier DB          │
└───────────────────┬─────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PROCESS BUILDER (Wizard)                      │
│  Input Source → Step1 Part → Step2 Material  │
│  → Step3 Process → Step4 Params              │
└───────────────────┬─────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ SIMULATION ENGINE                             │
│  • Material Mix / Alloy                       │
│  • CBAM Obligation trend by year              │
│  • CBAM Tax liability                         │
│  • MRV stacked bar (Scope 1/2/3)             │
│  • AI comparison of alternatives (A/B/C)     │
└───────────────────┬─────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ OUTPUT LAYER                                  │
│  • EU CBAM Template + SDGs                    │
│  • Technical View (engineer)                  │
│  • Business View (owner)                      │
└───────────────────┬─────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ EXPORT                                        │
│  • PDF Report (CBAM / Exec / Tech / Biz)     │
│  • Dashboard View                             │
└─────────────────────────────────────────────┘
```

## 2. INPUT LAYER — 4 sources
- **Standard DB**: NocoDB (ICE v3.0, EcoInvent, Thai Grid Factor). Ready to use.
- **Manual Input**: name, density, embodied CO₂/kg, price, source.
- **Factory History**: reuse prior `factory_history` rows; compare/adjust.
- **Supplier DB**: partner suppliers with CO₂ certificates; real-time if API.

## 3. PROCESS BUILDER (Wizard)
| Step | Detail |
|------|--------|
| Input Source | 4 buttons (pick BEFORE Step 1) |
| 1 | Part type: Bracket, Housing, Shaft, Flange, Mount, Custom |
| 2 | Material + % Recycled / Mix + source (4 ways) |
| 3 | Process: CNC from Billet, Extrusion, Gravity Die Casting, Additive Mfg |
| 4 | Parameters: Batch Size (pcs/month), Transport Distance (km) |

## 4. SIMULATION ENGINE (deterministic — NOT LLM)
### 4.1 Material Mix / Alloy
```
CO₂_mix = Σ(weight_fractionᵢ × CO₂_materialᵢ)
e.g. Al6061 Virgin 50% × 8.24 = 4.12
     Al6061 Recycled 50% × 0.50 = 0.25  →  CO₂_mix = 4.37 kgCO₂/kg
Alloy: Al 6061 = Al 97.9% + Mg 1.0% + Si 0.6% + Cu 0.28%
```
### 4.2 CBAM Obligation trend
| Year | Obligation | Note |
|------|-----------|------|
| 2026 | 0% | Reporting only |
| 2027 | 22% | Pay certificates |
| 2028 | 40% | Auto parts coverage |
| 2029 | 60% | |
| 2030 | 80% | |
| 2031-33 | 100% | Full |

Trend Chart shows rising CBAM cost if process unchanged.

### 4.3 CBAM Tax
```
CBAM Tax = (Embodied CO₂ − EU Benchmark) × ETS Price × Obligation%
e.g. (4.2 − 2.5) × €180 × 40% = €122.4/yr
If improved to 1.8 t/yr → excess 0 → €0 ✅
```
Display as **CBAM Tax Liability** (red if payable / green if pass) on Dashboard.

### 4.4 MRV Stacked Bar
EU CBAM needs 3 scopes:
1. Direct Emissions (Scope 1) — in-factory process
2. Indirect Emissions (Scope 2) — electricity
3. Embedded Emissions (Scope 3) — material + transport

### 4.5 AI Comparison (rule-based engine, Hermes explains)
| Option | Process | CO₂/yr | Saved | Cost | CBAM Tax | Payback |
|--------|---------|--------|-------|------|----------|---------|
| Current | CNC Billet | 4.2 t | — | ฿520K | €122 | — |
| A | Gravity Die Casting | 1.8 t | 57% | ฿380K | €0 | 8 mo |
| B | Extrusion + CNC | 2.5 t | 40% | ฿420K | €0 | 12 mo |
| C | 50% Recycled + CNC | 2.9 t | 31% | ฿460K | €29 | — |

Show as Comparison Table + Radar Chart. Hermes `WhyButton` explains each row.

## 5. OUTPUT LAYER — 3 views
- **EU CBAM Template + SDG**: structure per EU CBAM Reporting Template; cite SDG 8/9/12/13; include Verification & Data Source.
- **Technical View**: detailed equations, engineering risk (Porosity/Tolerance/Strength), standards (ASTM E155, ISO 14040), detailed charts.
- **Business View**: cost / savings / payback / CBAM tax; lost-profit-if-no-action; executive summary chart.

## 6. UI FLOW — 4 pages
1. **Process Builder**: Input selector (4 buttons) + 4-step wizard + [Analyze].
2. **Carbon Digital Twin Dashboard**: Carbon Score 0-100, Before/After donut, CBAM Tax Liability + trend chart, hotspot (Material/Process %), AI Recommendation A/B/C, ❓ Why this?.
3. **What-If Simulator**: % Recycled / Process / Batch sliders → real-time CO₂ / Cost / CBAM Tax; [Save Scenario].
4. **Export & Compliance**: Template picker (EU CBAM / Exec / Tech / Biz), CBAM Compliance Badge, [Export PDF] [Share].

> UI must use SVG icons, not emoji (machine aesthetic / dark mode).

## 7. DATA SCHEMA (NocoDB)
Existing: `materials`, `processes`, `calculations`
New:
- `suppliers`: name, material_ids(json), co2_certificate, contact
- `factory_history`: factory_name, previous_calculation_id, date, notes
- `cbam_rates`: year, obligation_percent, ets_price_eur, benchmark_co2
- `material_mixes`: name, material_id_1, percent_1, material_id_2, percent_2, calculated_co2

Local `seed.json` mirrors these as demo source of truth.

## 8. Demo Case (video)
Aerospace Bracket from supplier input:
- Current: Al6061-T6 Virgin + CNC Billet, scrap 70%, 4.2 t/yr, ฿520K, CBAM €122 (2028) / €612 (2034)
- Alt A: 50% Recycled + Gravity Die Casting, scrap 12%, 1.8 t/yr, ฿380K, CBAM €0, payback 8 mo, SDG 8/9/12/13

## 9. Tech stack
- Vite + React + TS + Tailwind **v3**
- NocoDB (+ local JSON fallback)
- Firebase Auth
- Hermes via Nous Portal API (JSON-in/out) → Vercel serverless proxy `/api/why`
- Recharts, html2canvas + jsPDF (rgb-only print container)
