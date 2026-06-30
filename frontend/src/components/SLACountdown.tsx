import { useEffect, useState } from 'react'

interface SLACountdownProps {
  deadline: string | null
  resolved?: boolean
}

function getTimeParts(ms: number) {
  const abs = Math.abs(ms)
  const days = Math.floor(abs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((abs / (1000 * 60)) % 60)
  const seconds = Math.floor((abs / 1000) % 60)
  return { days, hours, minutes, seconds }
}

export default function SLACountdown({ deadline, resolved }: SLACountdownProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (resolved || !deadline) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [deadline, resolved])

  if (!deadline) {
    return <p className="text-sm text-slate-500">No SLA deadline set</p>
  }

  if (resolved) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
        <span className="text-emerald-600">✓</span>
        <span className="text-sm font-medium text-emerald-800">Resolved within SLA window</span>
      </div>
    )
  }

  const deadlineMs = new Date(deadline).getTime()
  const diff = deadlineMs - now
  const overdue = diff < 0
  const { days, hours, minutes, seconds } = getTimeParts(diff)

  // urgency: <24h left = red, <72h = amber, else green
  const hoursLeft = diff / (1000 * 60 * 60)
  let colorClasses = 'border-emerald-200 bg-emerald-50 text-emerald-800'
  let dotColor = 'bg-emerald-500'
  if (overdue) {
    colorClasses = 'border-red-300 bg-red-50 text-red-800 animate-pulse'
    dotColor = 'bg-red-600'
  } else if (hoursLeft < 24) {
    colorClasses = 'border-red-200 bg-red-50 text-red-800'
    dotColor = 'bg-red-500'
  } else if (hoursLeft < 72) {
    colorClasses = 'border-amber-200 bg-amber-50 text-amber-800'
    dotColor = 'bg-amber-500'
  }

  return (
    <div className={`rounded-md border px-3 py-2.5 ${colorClasses}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {overdue ? 'SLA Breached — Overdue by' : 'Repair Due In'}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5 font-mono">
        {days > 0 && (
          <span className="text-lg font-bold">
            {days}
            <span className="ml-0.5 text-xs font-normal">d</span>
          </span>
        )}
        <span className="text-lg font-bold">
          {String(hours).padStart(2, '0')}
          <span className="ml-0.5 text-xs font-normal">h</span>
        </span>
        <span className="text-lg font-bold">
          {String(minutes).padStart(2, '0')}
          <span className="ml-0.5 text-xs font-normal">m</span>
        </span>
        <span className="text-lg font-bold">
          {String(seconds).padStart(2, '0')}
          <span className="ml-0.5 text-xs font-normal">s</span>
        </span>
      </div>
    </div>
  )
}