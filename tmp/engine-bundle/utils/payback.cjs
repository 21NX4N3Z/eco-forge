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

// src/utils/payback.ts
var payback_exports = {};
__export(payback_exports, {
  CARBON_PRICE_THB_PER_TCO2: () => CARBON_PRICE_THB_PER_TCO2,
  paybackLabel: () => paybackLabel,
  paybackMonths: () => paybackMonths
});
module.exports = __toCommonJS(payback_exports);
var CARBON_PRICE_THB_PER_TCO2 = 3500;
function paybackMonths(curCost, altCost, co2SavedKg, toolingDeltaThb = 0) {
  if (toolingDeltaThb <= 0 && altCost <= curCost) return 0;
  const monthlyCashSaving = Math.max(0, curCost - altCost) / 12;
  const monthlyCarbonValue = co2SavedKg / 1e3 * CARBON_PRICE_THB_PER_TCO2 / 12;
  const monthlyTotal = monthlyCashSaving + monthlyCarbonValue;
  if (monthlyTotal <= 0) return null;
  return Math.round(toolingDeltaThb / monthlyTotal * 10) / 10;
}
function paybackLabel(m) {
  if (m === null) return "\u2014";
  if (m === 0) return "\u0E17\u0E31\u0E19\u0E17\u0E35";
  return `${m} \u0E40\u0E14\u0E37\u0E2D\u0E19`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CARBON_PRICE_THB_PER_TCO2,
  paybackLabel,
  paybackMonths
});
