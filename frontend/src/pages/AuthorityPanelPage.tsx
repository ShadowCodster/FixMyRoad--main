import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import type { Repair } from '../types'
import { formatDate } from '../utils/geo'

export default function AuthorityPanelPage() {
  const { user, isAuthority } = useAuth()
  const [roadSlNo, setRoadSlNo] = useState('')
  const [timeline, setTimeline] = useState<Repair[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [form, setForm] = useState({
    event_type: 'Repaired',
    event_date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadTimeline = async () => {
    if (!roadSlNo) return
    setLoadingTimeline(true)
    setError('')
    try {
      const events = await api.getRoadTimeline(Number(roadSlNo))
      setTimeline(events)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load timeline')
    } finally {
      setLoadingTimeline(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      await api.addRepair(Number(roadSlNo), {
        event_type: form.event_type,
        event_date: form.event_date,
        notes: form.notes || undefined,
      })
      setMessage('Repair event logged successfully')
      setForm({ ...form, notes: '' })
      await loadTimeline()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to log repair')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="card">
          <p className="text-slate-600">Please log in to access the authority panel.</p>
          <Link to="/login" className="btn-primary mt-4 inline-flex">
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (!isAuthority) {
    return (
      <div className="card border-amber-200 bg-amber-50 text-amber-800">
        Access restricted to authority and admin accounts.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Authority Panel</h1>
        <p className="mt-1 text-slate-600">Log repair events on road timelines</p>
      </div>

      <div className="card">
        <label htmlFor="road_lookup" className="label">
          Road Serial Number
        </label>
        <div className="flex gap-3">
          <input
            id="road_lookup"
            type="number"
            className="input flex-1"
            value={roadSlNo}
            onChange={(e) => setRoadSlNo(e.target.value)}
            placeholder="Enter road sl_no"
          />
          <button type="button" onClick={loadTimeline} className="btn-secondary shrink-0">
            Load Timeline
          </button>
        </div>
      </div>

      {loadingTimeline && <LoadingSpinner label="Loading timeline…" />}

      {roadSlNo && !loadingTimeline && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold">Log Repair Event</h2>

          <div>
            <label htmlFor="event_type" className="label">
              Event Type
            </label>
            <select
              id="event_type"
              className="input"
              value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value })}
            >
              <option value="Repaired">Repaired</option>
              <option value="Built">Built</option>
              <option value="Complaint">Complaint</option>
            </select>
          </div>

          <div>
            <label htmlFor="event_date" className="label">
              Event Date
            </label>
            <input
              id="event_date"
              type="date"
              required
              className="input"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="notes" className="label">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Describe the repair work done…"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving…' : 'Log Repair Event'}
          </button>
        </form>
      )}

      {timeline.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Existing Timeline</h2>
          <ol className="relative border-l border-slate-200 pl-6">
            {timeline.map((event) => (
              <li key={event.id} className="mb-4 last:mb-0">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-road-600" />
                <p className="font-medium">{event.event_type}</p>
                <p className="text-sm text-slate-500">{formatDate(event.event_date)}</p>
                {event.notes && <p className="text-sm text-slate-600">{event.notes}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
