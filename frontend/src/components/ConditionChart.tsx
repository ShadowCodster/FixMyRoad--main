interface ConditionChartProps {
  good: number
  average: number
  poor: number
  goodPct: number
  averagePct: number
  poorPct: number
}

export default function ConditionChart({
  good,
  average,
  poor,
  goodPct,
  averagePct,
  poorPct,
}: ConditionChartProps) {
  const total = good + average + poor || 1

  return (
    <div className="card">
      <h3 className="mb-1 font-serif text-lg font-semibold text-civic-900">
        Road Condition Split
      </h3>
      <p className="mb-4 text-xs text-slate-500">Citywide health score distribution</p>

      <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="bg-emerald-600 transition-all"
          style={{ width: `${(good / total) * 100}%` }}
          title={`Good: ${goodPct.toFixed(1)}%`}
        />
        <div
          className="bg-amber-500 transition-all"
          style={{ width: `${(average / total) * 100}%` }}
          title={`Average: ${averagePct.toFixed(1)}%`}
        />
        <div
          className="bg-red-600 transition-all"
          style={{ width: `${(poor / total) * 100}%` }}
          title={`Poor: ${poorPct.toFixed(1)}%`}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span className="font-medium text-slate-700">Good</span>
          </div>
          <p className="mt-1 font-serif text-2xl font-semibold text-emerald-700">{good}</p>
          <p className="text-xs text-slate-500">{goodPct.toFixed(1)}%</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-slate-700">Average</span>
          </div>
          <p className="mt-1 font-serif text-2xl font-semibold text-amber-600">{average}</p>
          <p className="text-xs text-slate-500">{averagePct.toFixed(1)}%</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            <span className="font-medium text-slate-700">Poor</span>
          </div>
          <p className="mt-1 font-serif text-2xl font-semibold text-red-700">{poor}</p>
          <p className="text-xs text-slate-500">{poorPct.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
}