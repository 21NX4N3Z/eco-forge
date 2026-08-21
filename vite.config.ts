import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config — root project. API proxy (/api/why) is deployed as a Vercel
// serverless function at /api/why.ts; locally WhyButton falls back to a
// rule-based local explainer so the demo never depends on the network.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  build: { outDir: 'dist', sourcemap: false },
})
