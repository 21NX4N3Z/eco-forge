// SVG icon set — machine aesthetic. No emoji (per team convention).
import React from 'react'

type P = { className?: string }
const base = (props: P, children: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
       strokeLinecap="round" strokeLinejoin="round" className={props.className ?? 'w-5 h-5'}>
    {children}
  </svg>
)

export const IconDatabase = (p: P) => base(p, <>
  <ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
  <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
</>)
export const IconPencil = (p: P) => base(p, <>
  <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
</>)
export const IconFolder = (p: P) => base(p, <>
  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
</>)
export const IconHandshake = (p: P) => base(p, <>
  <path d="M11 17l2 2 4-4" /><path d="M3 11l4-4 5 5 4-4 5 5v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
</>)
export const IconFactory = (p: P) => base(p, <>
  <path d="M3 21V9l6 4V9l6 4V5l6 4v12Z" />
</>)
export const IconBolt = (p: P) => base(p, <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />)
export const IconChart = (p: P) => base(p, <>
  <path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-4" /><path d="M12 16V8" /><path d="M16 16v-6" />
</>)
export const IconHelp = (p: P) => base(p, <>
  <circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" /><path d="M12 17h.01" />
</>)
export const IconExport = (p: P) => base(p, <>
  <path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
</>)
export const IconWifiOff = (p: P) => base(p, <>
  <path d="M2 2l20 20" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M5 12.5a10 10 0 0 1 4-2.3" />
  <path d="M19 12.5a10 10 0 0 0-5-2.8" /><path d="M12 20h.01" />
</>)
export const IconCheck = (p: P) => base(p, <path d="M20 6 9 17l-5-5" />)
export const IconAlert = (p: P) => base(p, <>
  <path d="M12 3 2 20h20Z" /><path d="M12 9v5" /><path d="M12 18h.01" />
</>)
