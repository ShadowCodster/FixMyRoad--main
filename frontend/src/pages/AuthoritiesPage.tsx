import { useEffect, useState } from 'react'
import { api } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Authority } from '../types'

export default function AuthoritiesPage() {
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getAuthorities()
      .then(setAuthorities)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading authorities…" />
  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 text-red-700">
        Failed to load authorities: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Routing Authorities</h1>
        <p className="mt-1 text-slate-600">
          How complaints are routed based on road type and BBMP division
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {authorities.map((auth) => (
          <div key={auth.id} className="card">
            <h2 className="font-semibold text-slate-900">{auth.name}</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Jurisdiction: </span>
                <span className="font-medium">
                  {auth.road_type_code}
                  {auth.bbmp_division_name && ` · ${auth.bbmp_division_name}`}
                </span>
              </p>
              {auth.escalation_to && (
                <p>
                  <span className="text-slate-500">Escalates to: </span>
                  <span className="font-medium">{auth.escalation_to}</span>
                </p>
              )}
              {auth.contact_email && (
                <p>
                  <span className="text-slate-500">Email: </span>
                  <a href={`mailto:${auth.contact_email}`} className="text-road-700 hover:underline">
                    {auth.contact_email}
                  </a>
                </p>
              )}
              {auth.contact_phone && (
                <p>
                  <span className="text-slate-500">Phone: </span>
                  <span className="font-medium">{auth.contact_phone}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
