import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import HealthBadge, { StatusBadge } from '../components/HealthBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import RoadMap from '../components/RoadMap'
import type { BudgetTrail, Complaint, Repair, Road, RoadHealthScore } from '../types'
import { formatCurrency, formatDate } from '../utils/geo'

export default function RoadDetailPage() {
  const { slNo } = useParams<{ slNo: string }>()
  const [road, setRoad] = useState<Road | null>(null)
  const [health, setHealth] = useState<RoadHealthScore | null>(null)
  const [budget, setBudget] = useState<BudgetTrail | null>(null)
  const [timeline, setTimeline] = useState<Repair[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slNo) return
    const id = Number(slNo)
    setLoading(true)
    Promise.all([
      api.getRoad(id),
      api.getRoadHealth(id),
      api.getRoadBudget(id),
      api.getRoadTimeline(id),
      api.getComplaints(id),
    ])
      .then(([r, h, b, t, c]) => {
        setRoad(r)
        setHealth(h)
        setBudget(b)
        setTimeline(t)
        setComplaints(c)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slNo])

  if (loading) return <LoadingSpinner label="Loading road details…" />
  if (error || !road) {
    return (
      <div className="card border-red-200 bg-red-50 text-red-700">
        {error || 'Road not found'}
        <Link to="/map" className="ml-2 underline">
          Back to map
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/map" className="text-sm text-road-700 hover:underline">
            ← Back to map
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{road.road_name}</h1>
          <p className="mt-1 text-slate-600">
            {road.road_id} · {road.road_type.code} · {road.bbmp_division.name} · {road.length_km} km
          </p>
        </div>
        {health && <HealthBadge condition={health.condition} score={health.health_score} />}
      </div>

      {road.geometry && (
        <RoadMap roads={[road]} selectedSlNo={road.sl_no} height="320px" zoom={14} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Contractor & Engineers</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Contractor</dt>
              <dd className="font-medium text-right">{road.contractor_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Executive Engineer</dt>
              <dd className="font-medium text-right">
                {road.executive_engineer}
                {road.ee_contact && (
                  <span className="block text-xs text-slate-400">{road.ee_contact}</span>
                )}
              </dd>
            </div>
            {road.asst_exec_engineer && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Asst. Exec. Engineer</dt>
                <dd className="font-medium text-right">{road.asst_exec_engineer}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Completion Date</dt>
              <dd className="font-medium">{formatDate(road.completion_date)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">DLP Expiry</dt>
              <dd className="font-medium">{formatDate(road.dlp_expiry_date)}</dd>
            </div>
          </dl>
        </div>

        {health && (
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Live Health Score</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Score</dt>
                <dd className="text-2xl font-bold text-road-700">{health.health_score.toFixed(0)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Days Since Last Repair</dt>
                <dd className="font-medium">{Math.round(health.days_since_last_repair)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Open Complaints</dt>
                <dd className="font-medium">{health.open_complaints}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Repair Events</dt>
                <dd className="font-medium">{health.repair_count}</dd>
              </div>
              {health.pct_budget_used !== null && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Budget Utilised</dt>
                  <dd className="font-medium">{health.pct_budget_used.toFixed(1)}%</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      {budget && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Budget Trail</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Sanctioned</p>
              <p className="text-lg font-bold">{formatCurrency(budget.budget_sanctioned)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Released ({budget.pct_released.toFixed(0)}%)</p>
              <p className="text-lg font-bold">{formatCurrency(budget.budget_released)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Spent ({budget.pct_spent.toFixed(0)}%)</p>
              <p className="text-lg font-bold">{formatCurrency(budget.budget_spent)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Unspent</p>
              <p className="text-lg font-bold">{formatCurrency(budget.budget_unspent)}</p>
            </div>
          </div>
          {(budget.flag_released_exceeds_sanctioned || budget.flag_large_spend_gap) && (
            <div className="mt-4 space-y-2">
              {budget.flag_released_exceeds_sanctioned && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  ⚠ Released budget exceeds sanctioned amount
                </p>
              )}
              {budget.flag_large_spend_gap && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  ⚠ Large gap between released and spent budget
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Repair Timeline</h2>
          <Link to={`/complaint?road=${road.sl_no}`} className="btn-primary text-xs">
            Report Issue
          </Link>
        </div>
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-500">No repair events recorded yet.</p>
        ) : (
          <ol className="relative border-l border-slate-200 pl-6">
            {timeline.map((event) => (
              <li key={event.id} className="mb-6 last:mb-0">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-road-600" />
                <p className="font-medium text-slate-900">{event.event_type}</p>
                <p className="text-sm text-slate-500">{formatDate(event.event_date)}</p>
                {event.notes && <p className="mt-1 text-sm text-slate-600">{event.notes}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>

      {complaints.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Complaints on This Road</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Tracking ID</th>
                  <th className="pb-2 pr-4 font-medium">Issue</th>
                  <th className="pb-2 pr-4 font-medium">Severity</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      <Link to={`/track?id=${c.tracking_id}`} className="text-road-700 hover:underline">
                        {c.tracking_id}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{c.issue_type}</td>
                    <td className="py-3 pr-4">{c.severity}</td>
                    <td className="py-3">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
