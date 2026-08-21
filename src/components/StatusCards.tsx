import { IconAlert } from './icons'

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse card space-y-3">
      <div className="h-4 w-1/3 bg-ink-mute/30 rounded" />
      <div className="h-24 bg-ink-mute/20 rounded" />
      <div className="h-4 w-2/3 bg-ink-mute/30 rounded" />
    </div>
  )
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="card border-bad/50 text-bad flex items-start gap-2">
      <IconAlert className="w-5 h-5 mt-0.5" />
      <div>
        <div className="font-semibold text-sm">เกิดข้อผิดพลาด</div>
        <div className="text-xs text-ink-soft">{message}</div>
        <div className="text-xs text-ink-mute mt-1">ระบบสลับไปใช้โหมด offline อัตโนมัติ — ยังวิเคราะห์ได้ตามปกติ</div>
      </div>
    </div>
  )
}
