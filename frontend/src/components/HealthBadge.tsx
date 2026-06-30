interface HealthBadgeProps {
  condition: string
  score?: number
}

export default function HealthBadge({ condition, score }: HealthBadgeProps) {
  const normalized = condition.toLowerCase()
  let classes = 'badge bg-slate-100 text-slate-700'

  if (normalized.includes('good') || normalized.includes('excellent')) {
    classes = 'badge bg-emerald-100 text-emerald-800'
  } else if (normalized.includes('average') || normalized.includes('fair')) {
    classes = 'badge bg-amber-100 text-amber-800'
  } else if (normalized.includes('poor') || normalized.includes('bad')) {
    classes = 'badge bg-red-100 text-red-800'
  }

  return (
    <span className={classes}>
      {condition}
      {score !== undefined && ` (${Math.round(score)})`}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    Critical: 'bg-red-100 text-red-800',
    High: 'bg-orange-100 text-orange-800',
    Medium: 'bg-amber-100 text-amber-800',
    Low: 'bg-blue-100 text-blue-800',
  }
  return (
    <span className={`badge ${map[severity] || 'bg-slate-100 text-slate-700'}`}>
      {severity}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-amber-100 text-amber-800',
    Escalated: 'bg-red-100 text-red-800',
    Resolved: 'bg-emerald-100 text-emerald-800',
  }
  return (
    <span className={`badge ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}
