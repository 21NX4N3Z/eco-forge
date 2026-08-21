import { Material, MaterialMix, SeedData } from '../types'

/**
 * Weighted CO2 of a material blend (Material Mix / Alloy).
 * CO2_mix = Σ(weight_fractionᵢ × CO2_materialᵢ)
 * Recycled content also shifts the effective factor by blended percent.
 */
export function mixCo2(spec: { materialId: number; recycledPercent: number; mixId?: string }, data: SeedData): number {
  const mat = data.materials.find((m) => m.id === spec.materialId)
  if (!mat) return 0
  // If a precomputed mix is selected, use it directly.
  if (spec.mixId) {
    const mx: MaterialMix | undefined = data.mixes.find((m) => m.id === spec.mixId)
    if (mx) return mx.calculatedCo2
  }
  const recycled = Math.max(0, Math.min(100, spec.recycledPercent)) / 100
  const recycledMat = data.materials.find((m) => m.id === mat.id + 1 && /recycled/i.test(m.name))
  if (recycled > 0 && recycledMat) {
    return recycled * recycledMat.emissionFactor + (1 - recycled) * mat.emissionFactor
  }
  return mat.emissionFactor
}
