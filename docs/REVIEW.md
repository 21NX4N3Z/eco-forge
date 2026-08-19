# EcoForge — Review & Decisions (Sriracha Hackathon 2026)

> Full version: `.hermes/plans/2026-08-20_210000-eco-forge-review.md`

## Verdict
Strong concept (clear problem + real citations + clear "not-a-chatbot" differentiation).
Fix these before the 25 Aug demo or risk losing points / breaking live:

### 🔴 Must-fix (blocks demo or loses points)
1. **External deps can crash the live demo** — NocoDB / Firebase / Hermes down → must have
   offline mode + local seed always. (Tech & Impl 25, Backup Plan)
2. **PDF turns black/blank** — Tailwind v4 uses `oklch()` which html2canvas can't render.
   Use **Tailwind v3** or a print stylesheet with `rgb()` only. (Tech & Impl 25)
3. **AI must NOT calculate** — calculation is deterministic (fixed formulas vs
   ICE v3.0 / EcoInvent / Thai grid 0.42). Hermes only explains points via JSON.
   This defends "not a chatbot" + "users never see chat text". (Innovation 25)

### 🟡 Recommended
- Nous API key stays **server-side** via Vercel serverless proxy (`/api/why`). (Tech & Impl 25)
- **SDG badges (9, 12, 13) must appear inside the app** (report header), not just slides.
- Expand Q&A to **20 questions** (brief had 4) — see below.
- Business Model slide + Demo script ≤2 min, rehearsed 10×.

## Key numbers for the pitch
- Thai auto parts makers ~2,200 (Tier-2/3 ~1,100); exports ~USD 15.6B/yr
- CBAM costs Thailand ~USD 500M/yr; LCA study ~EUR 10,000 (~฿370,000)/project
- **Example impact:** Al 6061 CNC scrap 70% → Gravity Die Casting 12% = −2.8 t CO₂/yr, −฿140,000/yr
- Closer: ฿370,000 consulting → ฿0, send EU-ready report instantly

## Architecture (agreed)
- Vite + React + TS + Tailwind (v3) frontend
- Deterministic engine: `calcPart()` multiplies material/energy/scrap by fixed factors
- Data layer: local `seed.json` = demo source of truth; NocoDB = scalable story
- Hermes via Vercel proxy: `WhyButton` → `/api/why` → JSON `{explanation, suggestion, severity}`
- PDF: html2canvas + jsPDF on an `rgb()`-only print container with SDG badges

## Q&A Cheat Sheet (20)
1. Why not ChatGPT? → answers as essays, no point-by-point numbers, no dashboard, no PDF.
2. Who pays? → Freemium, Pro ฿2,900/mo, Enterprise ฿15,000/mo.
3. Where's the data from? → ICE Database v3.0, EcoInvent, Thai Grid Factor 0.42 kgCO₂/kWh.
4. How is Hermes different from Claude? → JSON-in/JSON-out, runs in background, user never sees text.
5. How accurate is the calc? → deterministic engine (fixed formulas), not AI guessing.
6. How credible are CO₂ numbers? → standard LCA DBs (ICE/EcoInvent), cradle-to-gate.
7. Why would SMEs pay? → LCA consulting ~฿370k/project → we're far cheaper/free.
8. vs SimaPro/commercial LCA? → faster + cheaper + dashboard + PDF + point AI.
9. Scale to 1,100 firms? → NocoDB + serverless scales on free tier.
10. Demo API dies? → offline mode + local data + backup video.
11. How is data updated? → NocoDB admin + committed seed JSON.
12. Other parts besides auto? → yes — engine is generic part→material→process.
13. Thai Grid 0.42 source? → EGAT / IEA Thailand average.
14. Freemium vs one-time? → SMEs want to try first + sustainable recurring revenue.
15. Can 3 people finish? → A(domain/AI) B(frontend) C(PM/integration) clearly split.
16. IP/data safe? → Firebase Auth + data not shared across factories.
17. Post-competition plan? → build real SaaS + LCA consultant partners.
18. Success KPI? → # factories reducing CO₂ + total tonnes saved.
19. CO₂ only or cost too? → less scrap → cost savings too (e.g. ฿140k/yr).
20. What does this 2-min demo do? → build part → Carbon Score → Optimize → PDF to EU.

## Demo script (≤2 min)
- 0:00–0:20 Problem: CBAM 1 Jan 2026, LCA ~฿370k, no environmental engineer.
- 0:20–0:50 Process Builder: card part→material(Al6061)→process(CNC)→params.
- 0:50–1:20 Dashboard: Carbon Score + donut Before/After + hotspot (CNC scrap 70%).
- 1:20–1:40 What-If + Optimize: GDC → CO₂ −2.8t, ฿140k/yr real-time.
- 1:40–1:55 ❓ Why this? → AI explains point + One-Click PDF to EU customer.
- 1:55–2:00 Closer: ฿370,000 → ฿0, EU-ready report instantly.

## Assumptions
- Tailwind v3 (not v4) to avoid R2.
- Local JSON = demo source of truth; NocoDB = scalable story.
- Emission factors in seed are starters — A (Domain) must replace with real values pre-demo.
- Nous calls via Vercel serverless proxy (needs Vercel account + NOUS_API_KEY).
- Repo created at `D:\hermes-workspace\eco-forge`, pushed to `Muxlsxd/eco-forge` (private).
