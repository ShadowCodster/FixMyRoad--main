import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import ConditionChart from '../components/ConditionChart'
import LoadingSpinner from '../components/LoadingSpinner'
import StatCard from '../components/StatCard'
import { BBMP_DIVISIONS, type Dashboard } from '../types'

export default function DashboardPage() {
  const [division, setDivision] = useState<string>('')
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .getDashboard(division || undefined)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [division])

  if (loading) return <LoadingSpinner label="Loading dashboard…" />
  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 text-red-700">
        Failed to load dashboard: {error}
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="space-y-8">
      {/* Civic header band */}
      <div className="-mx-4 -mt-8 mb-2 border-b border-civic-100 bg-white px-4 pb-6 pt-8 sm:-mx-0 sm:rounded-lg sm:border sm:px-8 sm:shadow-[0_1px_3px_rgba(16,31,51,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Public Transparency Record</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-civic-900">
              City Dashboard
            </h1>
            <p className="mt-1 text-slate-600">
              Real-time road conditions and complaint tracking for Bengaluru
            </p>
          </div>
          <div>
            <label htmlFor="division" className="label">
              Filter by BBMP Division
            </label>
            <select
              id="division"
              className="input max-w-xs"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="">All divisions</option>
              {BBMP_DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Roads" value={data.total_roads} accent="blue" />
        <StatCard
          label="Complaints This Month"
          value={data.complaints_filed_this_month}
          accent="amber"
        />
        <StatCard
          label="Resolved This Month"
          value={data.complaints_resolved_this_month}
          accent="green"
        />
        <StatCard
          label="Pending Complaints"
          value={data.complaints_pending}
          accent="red"
          subtext={
            data.average_resolution_days
              ? `Avg resolution: ${data.average_resolution_days.toFixed(1)} days`
              : undefined
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ConditionChart
          good={data.condition_good}
          average={data.condition_average}
          poor={data.condition_poor}
          goodPct={data.condition_good_pct}
          averagePct={data.condition_average_pct}
          poorPct={data.condition_poor_pct}
        />

        <div className="card">
          <h3 className="mb-1 font-serif text-lg font-semibold text-civic-900">Quick Actions</h3>
          <p className="mb-4 text-xs text-slate-500">Common citizen services</p>
          <div className="grid gap-3">
            <Link
              to="/map"
              className="group rounded-md border border-slate-200 p-4 transition hover:border-civic-300 hover:bg-civic-50"
            >
              <p className="font-semibold text-civic-900 group-hover:text-civic-800">
                Tap-a-Road Map
              </p>
              <p className="text-sm text-slate-600">
                Explore roads on the map and view maintenance details
              </p>
            </Link>
            <Link
              to="/complaint"
              className="group rounded-md border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50"
            >
              <p className="font-semibold text-amber-900">Report a Road Issue</p>
              <p className="text-sm text-slate-600">
                Upload a photo — AI detects potholes and cracks automatically
              </p>
            </Link>
            <Link
              to="/track"
              className="group rounded-md border border-slate-200 p-4 transition hover:border-civic-300 hover:bg-civic-50"
            >
              <p className="font-semibold text-civic-900">Track Your Complaint</p>
              <p className="text-sm text-slate-600">
                Look up status using your tracking ID (e.g. RW-2026-00001)
              </p>
            </Link>
          </div>
        </div>
      </div>

      {data.lowest_scoring_contractor && (
        <div className="card border-l-4 border-l-red-600 bg-red-50/40">
          <p className="eyebrow text-red-700">Attention Required</p>
          <h3 className="mt-1 font-serif text-lg font-semibold text-red-900">
            Lowest Scoring Contractor
          </h3>
          <p className="mt-2 text-red-800">
            <span className="font-semibold">{data.lowest_scoring_contractor.contractor_name}</span>
            {' — '}
            Score: {data.lowest_scoring_contractor.contractor_score.toFixed(1)} / 100
            {' · '}
            {data.lowest_scoring_contractor.total_open_complaints} open complaints
          </p>
          <Link
            to="/contractors"
            className="mt-3 inline-block text-sm font-medium text-red-700 underline underline-offset-2"
          >
            View full contractor leaderboard →
          </Link>
        </div>
      )}
    </div>
  )
}