/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // FORMTRACE — engineered-light palette (blue-grey structure, single teal-blue accent)
        ink: {
          DEFAULT: '#162d3e',
          soft: '#526777',
          mute: '#526777',
        },
        surface: {
          page: '#f4f7fa',
          warm: '#edf3f7',
          card: '#ffffff',
        },
        line: {
          DEFAULT: '#cad6df',
          strong: '#8198a8',
        },
        accent: {
          DEFAULT: '#126287',
          hover: '#084966',
          ring: '#3d84a8',
          tint: '#e4f1f7',
        },
        ok: '#176449',
        warn: '#855800',
        bad: '#a42e49',
        mint: '#e4f1f7',
        violet: '#526777',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgb(22 45 62 / 5%)',
        deep: '0 12px 32px rgb(22 45 62 / 8%)',
        focus: '0 0 0 2px #084966',
        glow: '0 4px 24px rgb(22 45 62 / 5%)',
      },
      letterSpacing: {
        display: '-1.5px',
      },
    },
  },
  plugins: [],
}
