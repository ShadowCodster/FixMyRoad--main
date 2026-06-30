import { useEffect, useState } from 'react'
import { api } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import type { ContractorScore } from '../types'

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<ContractorScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getContractorLeaderboard()
      .then(setContractors)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading contractor scores…" />
  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 text-red-700">
        Failed to load leaderboard: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Contractor Leaderboard</h1>
        <p className="mt-1 text-slate-600">
          Public accountability scores — contractors below 40 are red-flagged
        </p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-600">#</th>
              <th className="px-6 py-3 font-medium text-slate-600">Contractor</th>
              <th className="px-6 py-3 font-medium text-slate-600">Roads</th>
              <th className="px-6 py-3 font-medium text-slate-600">Avg Health</th>
              <th className="px-6 py-3 font-medium text-slate-600">Open Complaints</th>
              <th className="px-6 py-3 font-medium text-slate-600">Score</th>
            </tr>
          </thead>
          <tbody>
            {contractors.map((c, i) => (
              <tr
                key={c.contractor_name}
                className={`border-b border-slate-100 ${
                  c.red_flagged ? 'bg-red-50/60' : ''
                }`}
              >
                <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">{c.contractor_name}</span>
                  {c.red_flagged && (
                    <span className="ml-2 badge bg-red-100 text-red-800">Red Flag</span>
                  )}
                </td>
                <td className="px-6 py-4">{c.total_roads}</td>
                <td className="px-6 py-4">{c.avg_health_score.toFixed(1)}</td>
                <td className="px-6 py-4">{c.total_open_complaints}</td>
                <td className="px-6 py-4">
                  <span
                    className={`font-bold ${
                      c.contractor_score < 40
                        ? 'text-red-600'
                        : c.contractor_score < 70
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                    }`}
                  >
                    {c.contractor_score.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
