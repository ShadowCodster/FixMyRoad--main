import { FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { SeverityBadge, StatusBadge } from '../components/HealthBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import SLACountdown from '../components/SLACountdown'
import type { Complaint } from '../types'
import { formatDateTime } from '../utils/geo'

export default function TrackComplaintPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '')
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookup = async (id: string) => {
    if (!id.trim()) return
    setLoading(true)
    setError('')
    setComplaint(null)
    try {
      const result = await api.getComplaint(id.trim())
      setComplaint(result)
      setSearchParams({ id: id.trim() })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Complaint not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setTrackingId(id)
      lookup(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    lookup(trackingId)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Track Complaint</h1>
        <p className="mt-1 text-slate-600">
          Enter your tracking ID to check status and SLA deadline
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card flex gap-3">
        <input
          className="input flex-1 font-mono"
          placeholder="RW-2026-00001"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? 'Searching…' : 'Track'}
        </button>
      </form>

      {loading && <LoadingSpinner label="Looking up complaint…" />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {complaint && (
        <div className="card space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Tracking ID</p>
              <p className="font-mono text-xl font-bold text-slate-900">{complaint.tracking_id}</p>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          {/* Live SLA countdown — the star feature */}
          <SLACountdown
            deadline={complaint.response_deadline}
            resolved={complaint.status === 'Resolved'}
          />

          {complaint.image_url && (
            <img
              src={api.imageUrl(complaint.image_url) || ''}
              alt="Complaint"
              className="max-h-72 w-full rounded-lg object-cover"
            />
          )}

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Issue Type</dt>
              <dd className="mt-1 font-medium">{complaint.issue_type}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Severity</dt>
              <dd className="mt-1">
                <SeverityBadge severity={complaint.severity} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Road</dt>
              <dd className="mt-1 font-medium">#{complaint.road_sl_no}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">AI Confidence</dt>
              <dd className="mt-1 font-medium">
                {complaint.confidence_score ? `${complaint.confidence_score}%` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Filed On</dt>
              <dd className="mt-1 font-medium">{formatDateTime(complaint.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Response Deadline</dt>
              <dd className="mt-1 font-medium">{formatDateTime(complaint.response_deadline)}</dd>
            </div>
            {complaint.resolved_at && (
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Resolved On</dt>
                <dd className="mt-1 font-medium">{formatDateTime(complaint.resolved_at)}</dd>
              </div>
            )}
          </dl>

          {complaint.escalated && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
              This complaint has been escalated due to SLA breach or repeated issues on the road.
            </div>
          )}
        </div>
      )}
    </div>
  )
}