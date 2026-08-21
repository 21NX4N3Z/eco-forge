/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Notion/Linear hybrid — light, warm-neutral, single accent
        ink: {
          DEFAULT: 'rgba(0,0,0,0.95)', // Notion near-black (warm, not pure black)
          soft: '#615d59', // warm gray 500 (secondary text)
          mute: '#a39e98', // warm gray 300 (muted/caption)
        },
        surface: {
          page: '#ffffff', // pure white page
          warm: '#f6f5f4', // Notion warm white (section alt)
          card: '#ffffff',
        },
        line: {
          DEFAULT: 'rgba(0,0,0,0.10)', // whisper border (Notion)
          strong: '#dddddd',
        },
        accent: {
          DEFAULT: '#0075de', // Notion Blue — the only saturated color
          hover: '#005bab',
          ring: '#097fe8',
          tint: '#f2f9ff', // pill badge bg
        },
        // semantic signals (restrained, Notion-style)
        ok: '#1aae39',
        warn: '#dd5b00',
        bad: '#e11d48',
        violet: '#5e6ad2', // Linear brand indigo (reserved for one CTA accent)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // Notion layered soft shadows (max opacity 0.05)
        card: 'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.85px, rgba(0,0,0,0.02) 0px 0.8px 2.93px, rgba(0,0,0,0.01) 0px 0.175px 1.04px',
        deep: 'rgba(0,0,0,0.01) 0px 1px 3px, rgba(0,0,0,0.02) 0px 3px 7px, rgba(0,0,0,0.02) 0px 7px 15px, rgba(0,0,0,0.04) 0px 14px 28px, rgba(0,0,0,0.05) 0px 23px 52px',
        focus: 'rgba(9,127,232,0.35) 0px 0px 0px 2px',
      },
      letterSpacing: {
        display: '-1.5px', // Linear compressed display
      },
    },
  },
  plugins: [],
}
