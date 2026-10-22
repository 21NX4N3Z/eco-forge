// Single source of truth for the AI model id.
//
// Both call sites import this constant:
//   - `api/why.ts`      (Vercel serverless proxy, production)
//   - `src/api/why.ts`  (direct-key dev/demo path)
//
// Before this file existed the two call sites carried different ids
// (`nvidia/nemotron-3-super-120b-a12b:free` vs `minimax/minimax-m3:free`),
// which silently routed production and development to different models.
// Do not hardcode a model id anywhere else; change it here.
export const AI_MODEL = 'minimax/minimax-m3:free'

// Fallback used when the upstream model id is unreachable/retired.
// Kept as a constant so a provider outage is a one-line change.
export const AI_MODEL_FALLBACK = 'minimax/minimax-m3:free'

export function resolveModel(preferred: string = AI_MODEL, fallback: string = AI_MODEL_FALLBACK): string {
  return preferred || fallback
}
