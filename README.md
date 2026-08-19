# EcoForge

**AI-Powered Carbon Engineering Software** for Thai SME auto/aero parts manufacturers facing EU CBAM.

> Sriracha Hackathon 2026 — Team TME KMUTT (Muxlsxd / A, B, C)

## Problem
- ~1,100 Tier-2/3 SME parts manufacturers in Thailand have no in-house environmental engineer.
- EU CBAM fully applies 1 Jan 2026; by 2030 it covers auto parts.
- LCA study costs ~EUR 10,000 (~฿370,000) per project — unaffordable for SMEs.

## Solution (NOT a chatbot)
An engineering software with AI at its core:
1. **Process Builder** — visual card selection (part → material → process → parameters)
2. **Carbon Digital Twin Dashboard** — Carbon Score (0-100), Before/After donut, hotspot visualization
3. **What-If Simulator** — real-time CO₂ / Cost via sliders
4. **One-Click PDF Export** — finished report ready to send to EU customers
5. **Embedded AI Assistant** — "❓ Why this?" button at decision points (not a separate chat screen)

## Stack
- Frontend: Vite + React + TypeScript + Tailwind CSS
- Database: NocoDB (materials, processes, calculations) + local JSON fallback
- Auth: Firebase Auth
- AI Engine: Hermes via Nous Portal API (text-only, JSON-in / JSON-out)
- Chart: Recharts
- PDF: html2canvas + jsPDF

## Repo structure (scaffold — app code not yet committed)
```
eco-forge/
  docs/REVIEW.md      # review + build plan (see .hermes/plans for full version)
  src/                # (to be added) React app
  api/                # (to be added) Vercel serverless proxy for Nous API
  nocodb/             # (to be added) sync scripts + table schema
```

## Key decisions (from review)
- Calculation engine is **deterministic** (fixed formulas vs ICE v3.0 / EcoInvent / Thai grid 0.42 kgCO₂/kWh). Hermes only explains points — it does NOT calculate.
- **Local JSON is the demo source of truth**; NocoDB is the scalable-backend story (never blocks demo).
- **Tailwind v3** to avoid html2canvas `oklch()` breakage on PDF export.
- Nous API key stays server-side via **Vercel serverless proxy** (`/api/why`).
- **Offline mode + local seed** always available (Backup Plan for live demo).

## Setup (for team)
```bash
git clone https://github.com/Muxlsxd/eco-forge.git
cd eco-forge
npm install
npm run dev
```
App code and environment files (`.env`) are added in later phases.

## Timeline
- 25 Aug 23:59 — submit 3-min video (selection)
- 28 Aug 12:00 — selection results
- 11 Sep 08:30 — competition day @ Kasetsart Sriracha

## Scoring focus (100 pts)
Innovation 25 · Technology & Implementation 25 · Sustainability & Impact 20 · Feasibility & Scalability 20 · Presentation 10
