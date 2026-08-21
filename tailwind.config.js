/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme — clean white/slate base + readable signal tones
        base: {
          900: '#f8fafc', // page bg (slate-50)
          800: '#ffffff', // card bg
          700: '#f1f5f9', // input/inset bg (slate-100)
          600: '#cbd5e1', // border (slate-300)
          500: '#94a3b8', // muted border (slate-400)
        },
        signal: {
          cyan: '#0891b2', // cyan-600 (readable on white)
          green: '#059669', // emerald-600
          amber: '#d97706', // amber-600
          red: '#dc2626',   // red-600
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
