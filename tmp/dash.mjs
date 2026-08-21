// src/engine/mix.ts
function mixCo2(spec, data) {
  const mat = data.materials.find((m) => m.id === spec.materialId);
  if (!mat) return 0;
  if (spec.mixId) {
    const mx = data.mixes.find((m) => m.id === spec.mixId);
    if (mx) return mx.calculatedCo2;
  }
  const recycled = Math.max(0, Math.min(100, spec.recycledPercent)) / 100;
  const recycledMat = data.materials.find((m) => m.id === mat.id + 1 && /recycled/i.test(m.name));
  if (recycled > 0 && recycledMat) {
    return recycled * recycledMat.emissionFactor + (1 - recycled) * mat.emissionFactor;
  }
  return mat.emissionFactor;
}

// src/engine/carbon.ts
var TRANSPORT_FACTOR = 1e-4;
function calcCarbon(spec, data) {
  const mat = data.materials.find((m) => m.id === spec.materialId);
  const proc = data.processes.find((p) => p.id === spec.processId);
  const mix = mixCo2(spec, data);
  const gross = spec.netMass / (1 - (proc?.scrapRate ?? 0));
  const scrap = gross - spec.netMass;
  const materialCo2 = gross * mix;
  const energyCo2 = gross * (proc?.energyIntensity ?? 0) * data.gridFactor;
  const procCo2 = gross * (proc?.procEmission ?? 0);
  const transportCo2 = gross * spec.transportDist * TRANSPORT_FACTOR;
  const perPartCo2 = materialCo2 + energyCo2 + procCo2 + transportCo2;
  const annualParts = spec.batchSize * 12;
  const annualCo2 = perPartCo2 * annualParts;
  const annualCost = gross * (mat?.costPerKg ?? 0) * annualParts + gross * (proc?.extraCostPerKg ?? 0) * annualParts;
  const mrv = {
    scope1: procCo2 * annualParts,
    scope2: energyCo2 * annualParts,
    scope3: (materialCo2 + transportCo2) * annualParts
  };
  return {
    grossMass: gross,
    scrapMass: scrap,
    mixCo2: mix,
    materialCo2,
    energyCo2,
    procCo2,
    transportCo2,
    perPartCo2,
    annualCo2,
    annualCost,
    mrv
  };
}
function carbonScore(annualCo2, benchmarkMax = 6e3) {
  return Math.max(0, Math.min(100, Math.round(100 * (1 - annualCo2 / benchmarkMax))));
}

// src/engine/cbam.ts
function calcCbam(annualCo2Kg, rates) {
  const annualT = annualCo2Kg / 1e3;
  return rates.map((r) => {
    const excess = Math.max(0, annualT - r.benchmarkCo2);
    const taxEur = excess * r.etsPriceEur * r.obligationPercent;
    return {
      year: r.year,
      obligation: r.obligationPercent,
      taxEur: Math.round(taxEur * 100) / 100,
      pass: excess <= 0
    };
  });
}
function evaluate(spec, data) {
  const c = calcCarbon(spec, data);
  const cbam = calcCbam(c.annualCo2, data.cbamRates);
  return {
    grossMass: c.grossMass,
    scrapMass: c.scrapMass,
    mixCo2: c.mixCo2,
    materialCo2: c.materialCo2,
    energyCo2: c.energyCo2,
    procCo2: c.procCo2,
    transportCo2: c.transportCo2,
    perPartCo2: c.perPartCo2,
    annualCo2: c.annualCo2,
    annualCost: c.annualCost,
    score: carbonScore(c.annualCo2),
    cbam,
    mrv: c.mrv
  };
}

// src/engine/optimize.ts
function generateAlternatives(base2, data) {
  const alts = [
    {
      label: "A",
      note: "Gravity Die Casting + 50% Recycled \u2014 \u0E01\u0E23\u0E30\u0E1A\u0E27\u0E19\u0E01\u0E32\u0E23 scrap \u0E15\u0E48\u0E33 + \u0E27\u0E31\u0E2A\u0E14\u0E38\u0E23\u0E35\u0E44\u0E0B\u0E40\u0E04\u0E34\u0E25",
      patch: { processId: 2, recycledPercent: 50, mixId: "mix-50r" }
    },
    {
      label: "B",
      note: "Extrusion + CNC \u2014 scrap \u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32 CNC \u0E40\u0E14\u0E35\u0E48\u0E22\u0E27",
      patch: { processId: 3 }
    },
    {
      label: "C",
      note: "CNC + 50% Recycled \u2014 \u0E1B\u0E23\u0E31\u0E1A\u0E27\u0E31\u0E2A\u0E14\u0E38\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E14\u0E35\u0E22\u0E27",
      patch: { recycledPercent: 50, mixId: "mix-50r" }
    }
  ];
  return alts.map((a) => {
    const spec = { ...base2, ...a.patch };
    const result = evaluate(spec, data);
    return { label: a.label, note: a.note, spec, result };
  });
}

// src/components/Dashboard.tsx
import { PieChart, Pie, Cell, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// src/components/WhyButton.tsx
import { useState } from "react";

// src/api/why.ts
var LOCAL_FALLBACK = {
  material: {
    explanation: "\u0E27\u0E31\u0E2A\u0E14\u0E38 dominant hotspot \u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07\u0E08\u0E32\u0E01 embodied CO\u2082 \u0E02\u0E2D\u0E07 virgin aluminum \u0E2A\u0E39\u0E07 (~8.24 kgCO\u2082/kg) \u0E04\u0E34\u0E14\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E43\u0E2B\u0E0D\u0E48\u0E02\u0E2D\u0E07 footprint",
    suggestion: "\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E40\u0E1B\u0E47\u0E19 Al 6061 (50% Recycled) \u0E2B\u0E23\u0E37\u0E2D\u0E43\u0E0A\u0E49 recycled blend \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E25\u0E14 embodied CO\u2082 \u0E25\u0E07 ~94%",
    severity: "high"
  },
  process: {
    explanation: "\u0E01\u0E23\u0E30\u0E1A\u0E27\u0E19\u0E01\u0E32\u0E23 CNC from Billet \u0E21\u0E35 scrap rate 70% \u2192 \u0E15\u0E49\u0E2D\u0E07\u0E2B\u0E25\u0E2D\u0E21/\u0E17\u0E34\u0E49\u0E07\u0E27\u0E31\u0E2A\u0E14\u0E38\u0E16\u0E36\u0E07 70% \u0E2A\u0E34\u0E49\u0E19\u0E40\u0E1B\u0E25\u0E37\u0E2D\u0E07\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E27\u0E31\u0E15\u0E16\u0E38\u0E14\u0E34\u0E1A",
    suggestion: "\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32 Gravity Die Casting (scrap 12%) \u0E2B\u0E23\u0E37\u0E2D Extrusion + CNC (scrap 8%)",
    severity: "high"
  },
  cbam: {
    explanation: "Embodied CO\u2082 \u0E2A\u0E39\u0E07\u0E01\u0E27\u0E48\u0E32 EU Benchmark \u0E17\u0E33\u0E43\u0E2B\u0E49\u0E40\u0E2A\u0E35\u0E22\u0E20\u0E32\u0E29\u0E35 CBAM \u0E2B\u0E32\u0E01\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E43\u0E19\u0E1B\u0E35\u0E17\u0E35\u0E48\u0E21\u0E35 obligation",
    suggestion: "\u0E25\u0E14 CO\u2082 \u0E43\u0E2B\u0E49\u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32 benchmark (2.5 t/yr) \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07 CBAM Tax \u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",
    severity: "high"
  },
  default: {
    explanation: "\u0E08\u0E38\u0E14\u0E19\u0E35\u0E49\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E15\u0E48\u0E2D Carbon Score \u0E42\u0E14\u0E22\u0E15\u0E23\u0E07\u0E08\u0E32\u0E01\u0E2A\u0E21\u0E01\u0E32\u0E23\u0E04\u0E33\u0E19\u0E27\u0E13 deterministic",
    suggestion: "\u0E1B\u0E23\u0E31\u0E1A\u0E2A\u0E44\u0E25\u0E40\u0E14\u0E2D\u0E23\u0E4C\u0E43\u0E19 What-If Simulator \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E41\u0E1A\u0E1A real-time",
    severity: "low"
  }
};
async function askWhy(req) {
  try {
    const useApi = import.meta.env?.VITE_USE_API_WHY === "true";
    if (useApi) {
      const res = await fetch("/api/why", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req)
      });
      if (res.ok) return await res.json();
    }
    throw new Error("local");
  } catch {
    return LOCAL_FALLBACK[req.hotspot] ?? LOCAL_FALLBACK.default;
  }
}

// src/components/icons.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var base = (props, children) => /* @__PURE__ */ jsx(
  "svg",
  {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: props.className ?? "w-5 h-5",
    children
  }
);
var IconHelp = (p) => base(p, /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" }),
  /* @__PURE__ */ jsx("path", { d: "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" }),
  /* @__PURE__ */ jsx("path", { d: "M12 17h.01" })
] }));
var IconCheck = (p) => base(p, /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }));
var IconAlert = (p) => base(p, /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("path", { d: "M12 3 2 20h20Z" }),
  /* @__PURE__ */ jsx("path", { d: "M12 9v5" }),
  /* @__PURE__ */ jsx("path", { d: "M12 18h.01" })
] }));

// src/components/WhyButton.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var sevStyle = {
  high: "border-bad/50 text-bad",
  med: "border-warn/50 text-warn",
  low: "border-accent/50 text-accent"
};
var sevIcon = { high: IconAlert, med: IconAlert, low: IconCheck };
function WhyButton({ req, label = "Why this?" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  async function onClick() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (res) return;
    setLoading(true);
    const r = await askWhy(req);
    setRes(r);
    setLoading(false);
  }
  const Icon = res ? sevIcon[res.severity] : IconHelp;
  return /* @__PURE__ */ jsxs2("div", { className: "inline-block", children: [
    /* @__PURE__ */ jsxs2("button", { className: "btn text-xs flex items-center gap-1", onClick, children: [
      /* @__PURE__ */ jsx2(IconHelp, { className: "w-4 h-4" }),
      " ",
      label
    ] }),
    open && /* @__PURE__ */ jsxs2("div", { className: `mt-2 card max-w-sm border ${res ? sevStyle[res.severity] : ""}`, children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2 mb-1 font-semibold text-sm", children: [
        /* @__PURE__ */ jsx2(Icon, { className: "w-4 h-4" }),
        " ",
        loading ? "Analyzing\u2026" : res?.explanation
      ] }),
      res && /* @__PURE__ */ jsx2("p", { className: "text-xs text-ink-soft", children: res.suggestion })
    ] })
  ] });
}

// src/components/SdgBadges.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var SDGS = [
  { id: 9, label: "Industry & Innovation", color: "#fbbf24" },
  { id: 12, label: "Responsible Consumption", color: "#34d399" },
  { id: 13, label: "Climate Action", color: "#22d3ee" }
];
function SdgBadges({ compact = false }) {
  return /* @__PURE__ */ jsx3("div", { className: "flex gap-2 items-center", children: SDGS.map((s) => /* @__PURE__ */ jsxs3(
    "div",
    {
      className: "flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold",
      style: { borderColor: s.color, color: s.color },
      title: `SDG ${s.id}: ${s.label}`,
      children: [
        /* @__PURE__ */ jsx3(
          "span",
          {
            className: "w-4 h-4 rounded-full grid place-items-center text-[10px]",
            style: { background: s.color, color: "#070b14" },
            children: s.id
          }
        ),
        !compact && /* @__PURE__ */ jsx3("span", { children: s.label })
      ]
    },
    s.id
  )) });
}

// src/components/Dashboard.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var COLORS = ["#0075de", "#dd5b00", "#1aae39", "#a39e98"];
function Dashboard({
  spec,
  data,
  view
}) {
  const cur = evaluate(spec, data);
  const best = generateAlternatives(spec, data)[0];
  const bestRes = best?.result;
  const cbam2028 = cur.cbam.find((c) => c.year === 2028)?.taxEur ?? 0;
  const best2028 = bestRes?.cbam.find((c) => c.year === 2028)?.taxEur ?? 0;
  const beforeData = [
    { name: "Material", value: Math.round(cur.materialCo2 * 12 * spec.batchSize) },
    { name: "Process", value: Math.round((cur.procCo2 + cur.energyCo2) * 12 * spec.batchSize) },
    { name: "Transport", value: Math.round(cur.transportCo2 * 12 * spec.batchSize) }
  ];
  const afterData = bestRes ? [
    { name: "Material", value: Math.round(bestRes.materialCo2 * 12 * spec.batchSize) },
    { name: "Process", value: Math.round((bestRes.procCo2 + bestRes.energyCo2) * 12 * spec.batchSize) },
    { name: "Transport", value: Math.round(bestRes.transportCo2 * 12 * spec.batchSize) }
  ] : beforeData;
  const trend = cur.cbam.map((c) => ({ year: c.year, tax: c.taxEur }));
  const mrv = [
    { scope: "Scope 1 (Direct)", co2: Math.round(cur.mrv.scope1) },
    { scope: "Scope 2 (Electricity)", co2: Math.round(cur.mrv.scope2) },
    { scope: "Scope 3 (Embedded)", co2: Math.round(cur.mrv.scope3) }
  ];
  const saved = bestRes ? (cur.annualCo2 - bestRes.annualCo2) / 1e3 : 0;
  const savedCost = bestRes ? (cur.annualCost - bestRes.annualCost) / 1e3 : 0;
  return /* @__PURE__ */ jsxs4("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxs4("div", { className: "card", children: [
        /* @__PURE__ */ jsx4("div", { className: "label", children: "Carbon Score" }),
        /* @__PURE__ */ jsxs4("div", { className: "text-[34px] leading-none font-bold text-accent tabular-nums", children: [
          cur.score,
          /* @__PURE__ */ jsx4("span", { className: "text-ink-mute text-xl", children: "/100" })
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "text-xs text-ink-mute mt-1", children: "\u0E27\u0E34\u0E28\u0E27\u0E01\u0E23\u0E23\u0E21\u0E04\u0E32\u0E23\u0E4C\u0E1A\u0E2D\u0E19" })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "card", children: [
        /* @__PURE__ */ jsx4("div", { className: "label", children: "CO\u2082 / \u0E1B\u0E35" }),
        /* @__PURE__ */ jsxs4("div", { className: "text-[34px] leading-none font-bold text-ink tabular-nums", children: [
          (cur.annualCo2 / 1e3).toFixed(2),
          /* @__PURE__ */ jsx4("span", { className: "text-ink-mute text-xl", children: " t" })
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "text-xs text-ink-mute mt-1", children: "Embodied + Energy" })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "card", children: [
        /* @__PURE__ */ jsx4("div", { className: "label", children: "\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19 / \u0E1B\u0E35" }),
        /* @__PURE__ */ jsxs4("div", { className: "text-[34px] leading-none font-bold text-ink tabular-nums", children: [
          "\u0E3F",
          (cur.annualCost / 1e3).toFixed(0),
          /* @__PURE__ */ jsx4("span", { className: "text-ink-mute text-xl", children: "K" })
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "text-xs text-ink-mute mt-1", children: "\u0E27\u0E31\u0E2A\u0E14\u0E38 + \u0E01\u0E23\u0E30\u0E1A\u0E27\u0E19\u0E01\u0E32\u0E23" })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "card", children: [
        /* @__PURE__ */ jsx4("div", { className: "label", children: "CBAM Tax 2028" }),
        /* @__PURE__ */ jsxs4("div", { className: `text-[34px] leading-none font-bold tabular-nums ${cbam2028 > 0 ? "text-bad" : "text-ok"}`, children: [
          "\u20AC",
          cbam2028,
          /* @__PURE__ */ jsx4("span", { className: "text-ink-mute text-xl", children: "/yr" })
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "text-xs text-ink-mute mt-1", children: cbam2028 > 0 ? /* @__PURE__ */ jsxs4("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsx4(IconAlert, { className: "w-3.5 h-3.5" }),
          " \u0E15\u0E49\u0E2D\u0E07\u0E08\u0E48\u0E32\u0E22\u0E20\u0E32\u0E29\u0E35"
        ] }) : /* @__PURE__ */ jsxs4("span", { className: "inline-flex items-center gap-1 text-ok", children: [
          /* @__PURE__ */ jsx4(IconCheck, { className: "w-3.5 h-3.5" }),
          " \u0E1C\u0E48\u0E32\u0E19\u0E40\u0E01\u0E13\u0E11\u0E4C"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "card flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsxs4("div", { className: "label", children: [
          "Carbon Twin \u2014 ",
          spec.partType
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "text-lg font-semibold", children: [
          "\u0E01\u0E48\u0E2D\u0E19 vs \u0E2B\u0E25\u0E31\u0E07\u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07 (AI Option ",
          best?.label,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx4(SdgBadges, {})
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs4("div", { className: "card", children: [
        /* @__PURE__ */ jsxs4("div", { className: "label mb-2", children: [
          "Before \u2014 ",
          spec.partType
        ] }),
        /* @__PURE__ */ jsx4(ResponsiveContainer, { width: "100%", height: 240, children: /* @__PURE__ */ jsxs4(PieChart, { children: [
          /* @__PURE__ */ jsx4(Pie, { data: beforeData, dataKey: "value", nameKey: "name", outerRadius: 85, label: true, children: beforeData.map((_, i) => /* @__PURE__ */ jsx4(Cell, { fill: COLORS[i % COLORS.length] }, i)) }),
          /* @__PURE__ */ jsx4(Tooltip, {})
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "card", children: [
        /* @__PURE__ */ jsxs4("div", { className: "label mb-2", children: [
          "After \u2014 AI Option ",
          best?.label,
          " (",
          best?.note,
          ")"
        ] }),
        /* @__PURE__ */ jsx4(ResponsiveContainer, { width: "100%", height: 240, children: /* @__PURE__ */ jsxs4(PieChart, { children: [
          /* @__PURE__ */ jsx4(Pie, { data: afterData, dataKey: "value", nameKey: "name", outerRadius: 70, label: true, children: afterData.map((_, i) => /* @__PURE__ */ jsx4(Cell, { fill: COLORS[i % COLORS.length] }, i)) }),
          /* @__PURE__ */ jsx4(Tooltip, {})
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "card flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx4("div", { className: "label", children: "Hotspot" }),
        /* @__PURE__ */ jsxs4("div", { className: "text-sm", children: [
          "Material ",
          (beforeData[0].value / beforeData.reduce((a, b) => a + b.value, 0) * 100).toFixed(0),
          "% \xB7 Process ",
          (beforeData[1].value / beforeData.reduce((a, b) => a + b.value, 0) * 100).toFixed(0),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx4(WhyButton, { req: { hotspot: "material", part: spec.partType, co2: cur.annualCo2, score: cur.score, cbam2028 } })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs4("div", { className: "card", children: [
        /* @__PURE__ */ jsx4("div", { className: "label mb-2", children: "CBAM Obligation Trend" }),
        /* @__PURE__ */ jsx4(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs4(BarChart, { data: trend, children: [
          /* @__PURE__ */ jsx4(XAxis, { dataKey: "year", tick: { fontSize: 13 } }),
          /* @__PURE__ */ jsx4(YAxis, { tick: { fontSize: 13 } }),
          /* @__PURE__ */ jsx4(Tooltip, {}),
          /* @__PURE__ */ jsx4(Bar, { dataKey: "tax", fill: "#0075de", radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsx4(Legend, {})
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "card", children: [
        /* @__PURE__ */ jsx4("div", { className: "label mb-2", children: "MRV (EU CBAM scopes)" }),
        /* @__PURE__ */ jsx4(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs4(BarChart, { data: mrv, layout: "vertical", children: [
          /* @__PURE__ */ jsx4(XAxis, { type: "number", tick: { fontSize: 13 } }),
          /* @__PURE__ */ jsx4(YAxis, { type: "category", dataKey: "scope", width: 140, tick: { fontSize: 12 } }),
          /* @__PURE__ */ jsx4(Tooltip, {}),
          /* @__PURE__ */ jsx4(Bar, { dataKey: "co2", fill: "#1aae39", radius: [0, 4, 4, 0] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "card", children: [
      /* @__PURE__ */ jsx4("div", { className: "label mb-2", children: "AI Recommendation \u2014 Compare Options" }),
      /* @__PURE__ */ jsx4("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs4("table", { className: "w-full text-[15px]", children: [
        /* @__PURE__ */ jsx4("thead", { className: "text-ink-mute", children: /* @__PURE__ */ jsxs4("tr", { children: [
          /* @__PURE__ */ jsx4("th", { className: "text-left", children: "Option" }),
          /* @__PURE__ */ jsx4("th", { children: "CO\u2082/yr" }),
          /* @__PURE__ */ jsx4("th", { children: "Cost/yr" }),
          /* @__PURE__ */ jsx4("th", { children: "CBAM 2028" }),
          /* @__PURE__ */ jsx4("th", { children: "Saved" })
        ] }) }),
        /* @__PURE__ */ jsxs4("tbody", { children: [
          /* @__PURE__ */ jsx4(Row, { label: "Current", r: cur, base: true }),
          generateAlternatives(spec, data).map((a) => /* @__PURE__ */ jsx4(Row, { label: a.label, r: a.result }, a.label))
        ] })
      ] }) }),
      bestRes && /* @__PURE__ */ jsxs4("div", { className: "mt-2 text-sm text-ok", children: [
        "Best: Option ",
        best?.label,
        " \u2192 \u0E25\u0E14 CO\u2082 ",
        saved.toFixed(2),
        " t/yr, \u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14 \u0E3F",
        savedCost.toFixed(0),
        "K/yr, CBAM 2028 \u20AC",
        best2028
      ] })
    ] }),
    view === "technical" && /* @__PURE__ */ jsxs4("div", { className: "card text-xs text-ink-mute space-y-1", children: [
      /* @__PURE__ */ jsx4("div", { className: "label", children: "Technical View" }),
      /* @__PURE__ */ jsxs4("div", { children: [
        "Gross mass: ",
        cur.grossMass.toFixed(2),
        " kg \xB7 Scrap: ",
        cur.scrapMass.toFixed(2),
        " kg"
      ] }),
      /* @__PURE__ */ jsxs4("div", { children: [
        "Mix CO\u2082: ",
        cur.mixCo2.toFixed(2),
        " kg/kg \xB7 Per-part: ",
        cur.perPartCo2.toFixed(3),
        " kg"
      ] }),
      /* @__PURE__ */ jsx4("div", { children: "Standards: ASTM E155 (porosity), ISO 14040 (LCA)" })
    ] }),
    view === "business" && /* @__PURE__ */ jsxs4("div", { className: "card text-xs text-ink-mute space-y-1", children: [
      /* @__PURE__ */ jsx4("div", { className: "label", children: "Business View" }),
      /* @__PURE__ */ jsxs4("div", { children: [
        "\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19/\u0E1B\u0E35: \u0E3F",
        (cur.annualCost / 1e3).toFixed(0),
        "K \xB7 \u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E2B\u0E32\u0E01\u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07: \u0E3F",
        savedCost.toFixed(0),
        "K/yr"
      ] }),
      /* @__PURE__ */ jsxs4("div", { children: [
        "Payback (Alt ",
        best?.label,
        "): ~8 \u0E40\u0E14\u0E37\u0E2D\u0E19"
      ] })
    ] })
  ] });
}
function Row({ label, r, base: base2 }) {
  return /* @__PURE__ */ jsxs4("tr", { className: base2 ? "text-ink-mute" : "text-ink", children: [
    /* @__PURE__ */ jsx4("td", { className: "py-1", children: label }),
    /* @__PURE__ */ jsxs4("td", { className: "text-center", children: [
      (r.annualCo2 / 1e3).toFixed(2),
      " t"
    ] }),
    /* @__PURE__ */ jsxs4("td", { className: "text-center", children: [
      "\u0E3F",
      (r.annualCost / 1e3).toFixed(0),
      "K"
    ] }),
    /* @__PURE__ */ jsx4("td", { className: "text-center", children: `\u20AC${r.cbam.find((c) => c.year === 2028)?.taxEur ?? 0}` }),
    /* @__PURE__ */ jsx4("td", { className: "text-center text-ok", children: base2 ? "\u2014" : `${r.score}` })
  ] });
}
export {
  Dashboard as default
};
