interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  accent?: 'green' | 'amber' | 'red' | 'blue' | 'slate'
}

const accentClasses = {
  green: 'border-l-emerald-600',
  amber: 'border-l-amber-500',
  red: 'border-l-red-600',
  blue: 'border-l-civic-700',
  slate: 'border-l-slate-400',
}

const valueClasses = {
  green: 'text-emerald-700',
  amber: 'text-amber-600',
  red: 'text-red-700',
  blue: 'text-civic-800',
  slate: 'text-slate-700',
}

export default function StatCard({ label, value, subtext, accent = 'slate' }: StatCardProps) {
  return (
    <div className={`card border-l-4 ${accentClasses[accent]}`}>
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 font-serif text-3xl font-semibold ${valueClasses[accent]}`}>{value}</p>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  )
}