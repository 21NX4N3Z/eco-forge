import { useEffect, useState } from 'react'
import { IconDatabase, IconPencil, IconFolder, IconHandshake, IconCheck, IconAlert, IconSpark } from './icons'

type Ev = {
  id: number
  icon: typeof IconDatabase
  tone: 'accent' | 'ok' | 'warn' | 'bad' | 'mute'
  text: string
  time: string
}

const SEED: Ev[] = [
  { id: 1, icon: IconSpark, tone: 'accent', text: 'AI แนะนำ Option A (Gravity Die + 50% Recycled) — ลด CO₂ 79%', time: ' just now' },
  { id: 2, icon: IconDatabase, tone: 'mute', text: 'โหลดค่ามาตรฐาน ICE / EcoInvent / Thai Grid', time: '2m' },
  { id: 3, icon: IconHandshake, tone: 'ok', text: 'ซัพพลายเออร์ Aluminium Thai ส่ง CO₂ certificate', time: '14m' },
  { id: 4, icon: IconAlert, tone: 'warn', text: 'CBAM 2028: ต้องจ่ายภาษี €125/yr (Current)', time: '31m' },
  { id: 5, icon: IconFolder, tone: 'mute', text: 'ดึงประวัติงาน Bracket รุ่นก่อน (scrap 18%)', time: '1h' },
  { id: 6, icon: IconPencil, tone: 'mute', text: 'ปรับ net mass 3.7 → 3.7 kg, batch 3 pcs/mo', time: '2h' },
]

const toneCls: Record<Ev['tone'], string> = {
  accent: 'text-accent',
  ok: 'text-ok',
  warn: 'text-warn',
  bad: 'text-bad',
  mute: 'text-ink-mute',
}

export default function ActivityFeed() {
  // simulate a live entry when analysis runs
  const [events, setEvents] = useState<Ev[]>(SEED)
  useEffect(() => {
    const t = setInterval(() => {
      setEvents((e) => [
        { id: Date.now(), icon: IconCheck, tone: 'ok', text: 'Re-calc Carbon Twin — score อัปเดต', time: 'now' },
        ...e,
      ].slice(0, 8))
    }, 12000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="card">
      <div className="label mb-3">กิจกรรมล่าสุด</div>
      <ul className="space-y-3">
        {events.map((e) => {
          const Ic = e.icon
          return (
            <li key={e.id} className="flex items-start gap-2.5">
              <span className={`mt-0.5 ${toneCls[e.tone]}`}><Ic className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-ink leading-snug">{e.text}</div>
                <div className="text-[11px] text-ink-mute">{e.time}</div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
