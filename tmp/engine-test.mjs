// Engine verify (bundled) + payback util test — run after any engine change
import { build } from 'esbuild'
import { readFileSync, rmSync } from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const root = 'D:/hermes-workspace/eco-forge'
const seed = JSON.parse(readFileSync(path.join(root, 'src/data/seed.json'), 'utf-8'))

rmSync(path.join(root, 'tmp/engine-bundle'), { recursive: true, force: true })
await build({
  entryPoints: [
    path.join(root, 'src/engine/cbam.ts'),
    path.join(root, 'src/engine/optimize.ts'),
    path.join(root, 'src/utils/payback.ts'),
  ],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outdir: path.join(root, 'tmp/engine-bundle'),
  outExtension: { '.js': '.cjs' },
})

const { evaluate } = await import(pathToFileURL(path.join(root, 'tmp/engine-bundle/engine/cbam.cjs')).href)
const { generateAlternatives } = await import(pathToFileURL(path.join(root, 'tmp/engine-bundle/engine/optimize.cjs')).href)
const { paybackMonths, paybackLabel } = await import(pathToFileURL(path.join(root, 'tmp/engine-bundle/utils/payback.cjs')).href)

const spec = {
  inputSource: 'standard', partType: 'Bracket', netMass: 3.7,
  materialId: 1, recycledPercent: 0, processId: 1, batchSize: 3, transportDist: 120,
}
const cur = evaluate(spec, seed)
const cbam2028 = cur.cbam.find((c) => c.year === 2028)?.taxEur
console.log(`CURRENT: ${(cur.annualCo2 / 1000).toFixed(2)} t/yr · ฿${Math.round(cur.annualCost / 1000)}K · CBAM2028 €${cbam2028}`)

const ok1 = Math.abs(cur.annualCo2 / 1000 - 4.23) < 0.05
const ok2 = Math.abs(cur.annualCost / 1000 - 524) < 5
const ok3 = Math.abs(cbam2028 - 124.78) < 0.5
console.log('VERIFY CURRENT:', ok1 && ok2 && ok3 ? 'PASS' : `FAIL (got ${(cur.annualCo2/1000).toFixed(2)}t, ฿${Math.round(cur.annualCost/1000)}K, €${cbam2028})`)

for (const a of generateAlternatives(spec, seed)) {
  const pb = paybackMonths(cur.annualCost, a.result.annualCost, cur.annualCo2 - a.result.annualCo2)
  console.log(`Option ${a.label}: ${(a.result.annualCo2 / 1000).toFixed(2)} t · CBAM2028 €${a.result.cbam.find((c) => c.year === 2028)?.taxEur} · payback ${paybackLabel(pb)}`)
}
const altA = generateAlternatives(spec, seed)[0]
const okA = Math.abs(altA.result.annualCo2 / 1000 - 0.88) < 0.05 && altA.result.cbam.find((c) => c.year === 2028)?.taxEur === 0
console.log('VERIFY ALT A:', okA ? 'PASS' : 'FAIL')

for (const pt of ['Housing', 'Shaft', 'Flange', 'Mount', 'Custom']) {
  const r = evaluate({ ...spec, partType: pt }, seed)
  if (!Number.isFinite(r.annualCo2) || !Number.isFinite(r.annualCost)) throw new Error('BAD CALC for ' + pt)
}
console.log('PART TYPES: all 6 calculate cleanly')

// payback util sanity
console.log('PAYBACK SANITY:', paybackMonths(524000, 524000, 1000) === 0 && paybackMonths(500000, 600000, 0) === null ? 'PASS' : 'FAIL')
