/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // MATEGAYCBAM — Mint Sky (ฟ้ามิ้น) palette
        ink: {
          DEFAULT: 'rgba(15, 42, 56, 0.95)', // deep teal-navy (อ่านง่าย, contrast 16:1)
          soft: '#3d6b7a', // mid teal (secondary text)
          mute: '#7fa1ad', // soft sky (muted/caption)
        },
        surface: {
          page: '#f5fbfd', // very light mint-sky wash
          warm: '#e8f7fa', // soft section alt
          card: '#ffffff',
        },
        line: {
          DEFAULT: 'rgba(46, 138, 168, 0.18)', // mint-sky hairline
          strong: '#7fc5d6',
        },
        accent: {
          DEFAULT: '#2e8aa8', // mint sky (พาสเทลเข้ม — อ่านง่าย)
          hover: '#1f6d87',
          ring: '#3da9c9',
          tint: '#d4eef4', // pill badge bg
        },
        // semantic signals (mint-sky family — สีหลักทั้งหมดอยู่ในโทนเดียวกัน)
        ok: '#16a085', // teal-green (positive)
        warn: '#d99000', // amber (warning)
        bad: '#c44a6b', // dusty rose (negative)
        violet: '#7d6ec4', // reserved (cool contrast)
        mint: '#a8e0d4', // soft mint accent
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        // Mint-sky soft layered shadows (max opacity 0.06, with slight teal tint)
        card: 'rgba(46, 138, 168, 0.06) 0px 4px 18px, rgba(46, 138, 168, 0.04) 0px 2px 8px, rgba(46, 138, 168, 0.03) 0px 0.8px 3px',
        deep: 'rgba(46, 138, 168, 0.04) 0px 1px 3px, rgba(46, 138, 168, 0.05) 0px 3px 7px, rgba(46, 138, 168, 0.06) 0px 7px 15px, rgba(46, 138, 168, 0.08) 0px 14px 28px',
        focus: 'rgba(61, 169, 201, 0.40) 0px 0px 0px 2px',
        glow: 'rgba(46, 138, 168, 0.22) 0px 0px 18px',
      },
      letterSpacing: {
        display: '-1.5px',
      },
    },
  },
  plugins: [],
}