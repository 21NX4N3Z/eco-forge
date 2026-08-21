"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/engine/optimize.ts
var optimize_exports = {};
__export(optimize_exports, {
  bestAlternative: () => bestAlternative,
  generateAlternatives: () => generateAlternatives
});
module.exports = __toCommonJS(optimize_exports);

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

// src/data/cbam_real.ts
var ALUMINIUM_CN = [
  { cn: "76011010", desc: "Al slabs, not alloyed, unwrought", bmK: null, bmL: 0.091, dvTh: null },
  { cn: "76012040", desc: "Unwrought Al alloys \u2014 billets", bmK: null, bmL: 0.091, dvTh: null },
  { cn: "76031000", desc: "Powders of aluminium", bmK: 0.046, bmL: 0.14, dvTh: 1.05 },
  { cn: "76041010", desc: "Bars, rods and profiles (non-alloy)", bmK: 0.056, bmL: 0.148, dvTh: 1.27 },
  { cn: "76042910", desc: "Bars and rods of aluminium alloys", bmK: 0.056, bmL: 0.148, dvTh: 1.27 },
  { cn: "76042990", desc: "Solid profiles of aluminium alloys", bmK: 0.06, bmL: 0.152, dvTh: 1.29 },
  { cn: "76061150", desc: "Plates, sheets and strip (non-alloy)", bmK: 0.056, bmL: 0.148, dvTh: 1.73 },
  { cn: "76061250", desc: "Plates, sheets and strip (alloys)", bmK: 0.056, bmL: 0.148, dvTh: 1.73 }
];
function benchmarkFor(cn) {
  const e = ALUMINIUM_CN.find((x) => x.cn === cn);
  return e?.bmL ?? 2.5;
}
function dvThailandFor(cn) {
  return ALUMINIUM_CN.find((x) => x.cn === cn)?.dvTh ?? null;
}

// src/engine/cbam.ts
function calcCbam(annualCo2Kg, rates, cnCode) {
  const annualT = annualCo2Kg / 1e3;
  const benchmark = benchmarkFor(cnCode ?? "");
  const dvTh = dvThailandFor(cnCode ?? "");
  const years = rates.map((r) => {
    const excess = Math.max(0, annualT - benchmark);
    const taxEur = excess * r.etsPriceEur * r.obligationPercent;
    return {
      year: r.year,
      obligation: r.obligationPercent,
      taxEur: Math.round(taxEur * 100) / 100,
      pass: excess <= 0
    };
  });
  return { years, benchmark, dvTh };
}
function evaluate(spec, data) {
  const c = calcCarbon(spec, data);
  const { years, benchmark, dvTh } = calcCbam(c.annualCo2, data.cbamRates, spec.cnCode);
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
    cbam: years,
    mrv: c.mrv,
    benchmark,
    dvTh
  };
}

// src/engine/optimize.ts
function generateAlternatives(base, data) {
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
    const spec = { ...base, ...a.patch };
    const result = evaluate(spec, data);
    const curProc = data.processes.find((p) => p.id === base.processId);
    const altProc = data.processes.find((p) => p.id === spec.processId);
    const toolingDeltaThb = (altProc?.toolingCostThb ?? 0) - (curProc?.toolingCostThb ?? 0);
    return { label: a.label, note: a.note, spec, result, toolingDeltaThb };
  });
}
function bestAlternative(base, data) {
  const baseRes = evaluate(base, data);
  const alts = generateAlternatives(base, data);
  let best = null;
  for (const a of alts) {
    if (!best || a.result.annualCo2 < best.result.annualCo2 - 1e-6 || Math.abs(a.result.annualCo2 - best.result.annualCo2) < 1e-6 && a.result.annualCost < best.result.annualCost) {
      best = a;
    }
  }
  return best && best.result.annualCo2 < baseRes.annualCo2 ? best : null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  bestAlternative,
  generateAlternatives
});
