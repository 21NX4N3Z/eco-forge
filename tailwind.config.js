/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern light — Notion/Linear inspired: clean white + soft slate + vivid accent
        base: {
          900: '#f6f7f9', // app bg (soft gray-white)
          800: 'rgba(255,255,255,0.65)', // glass card
          700: 'rgba(255,255,255,0.45)', // inset glass
          600: 'rgba(15,23,42,0.08)', // hairline border
          500: 'rgba(15,23,42,0.14)', // stronger border
        },
        ink: {
          DEFAULT: '#0f172a',
          soft: '#475569',
          mute: '#94a3b8',
        },
        signal: {
          cyan: '#0ea5b7',
          green: '#059669',
          amber: '#d97706',
          red: '#e11d48',
          violet: '#7c3aed',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
