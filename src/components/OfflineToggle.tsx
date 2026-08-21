import { IconWifiOff } from './icons'

/** Backup Plan control — switch between NocoDB (online) and local seed (offline). */
export default function OfflineToggle({ offline, setOffline }: { offline: boolean; setOffline: (v: boolean) => void }) {
  return (
    <button
      className={`btn text-xs flex items-center gap-1 ${offline ? 'btn-active' : ''}`}
      onClick={() => setOffline(!offline)}
      title="สลับโหมด online (NocoDB) / offline (local seed)"
    >
      <IconWifiOff className="w-4 h-4" />
      {offline ? 'Offline (local seed)' : 'Online (NocoDB)'}
    </button>
  )
}
