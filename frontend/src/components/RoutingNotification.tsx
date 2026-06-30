import { useEffect, useState } from 'react'
import type { Authority } from '../types'

interface RoutingNotificationProps {
  trackingId: string
  authority: Authority | null
  severity: string
}

const steps = [
  'Analyzing damage report…',
  'Matching to responsible authority…',
  'Notifying authority…',
  'Citizen notified',
]

export default function RoutingNotification({
  trackingId,
  authority,
  severity,
}: RoutingNotificationProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (stepIndex >= steps.length - 1) return
    const t = setTimeout(() => setStepIndex((i) => i + 1), 650)
    return () => clearTimeout(t)
  }, [stepIndex])

  const done = stepIndex >= steps.length - 1

  return (
    <div className="card border-civic-200 bg-civic-50/60">
      <p className="eyebrow">Automated Routing</p>
      <h3 className="mt-1 font-serif text-lg font-semibold text-civic-900">
        Complaint Dispatch Trail
      </h3>

      <ul className="mt-4 space-y-2">
        {steps.map((label, i) => {
          const active = i <= stepIndex
          const current = i === stepIndex && !done
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs transition-colors ${
                  active
                    ? 'bg-civic-700 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {active && !current ? '✓' : i + 1}
              </span>
              <span
                className={
                  active ? 'font-medium text-civic-900' : 'text-slate-400'
                }
              >
                {label}
                {current && <span className="ml-1 animate-pulse">…</span>}
              </span>
            </li>
          )
        })}
      </ul>

      {done && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm">
          <p className="font-medium text-emerald-900">
            ✓ Routed to: {authority ? authority.name : 'General Roads Authority'}
          </p>
          {authority?.contact_email && (
            <p className="mt-0.5 text-emerald-700">
              Notification sent to {authority.contact_email}
            </p>
          )}
          <p className="mt-1 text-xs text-emerald-700">
            Priority: <span className="font-semibold">{severity}</span> · Tracking ID:{' '}
            <span className="font-mono">{trackingId}</span>
          </p>
        </div>
      )}
    </div>
  )
}