import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { SeverityBadge } from '../components/HealthBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import RoutingNotification from '../components/RoutingNotification'
import { useAuth } from '../context/AuthContext'
import type { AnalyzeResult, Authority, Complaint, Road } from '../types'

export default function ComplaintPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedRoad = searchParams.get('road')

  const [roadSlNo, setRoadSlNo] = useState(preselectedRoad || '')
  const [road, setRoad] = useState<Road | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null)
  const [matchedAuthority, setMatchedAuthority] = useState<Authority | null>(null)

  useEffect(() => {
    if (preselectedRoad) {
      api.getRoad(Number(preselectedRoad)).then(setRoad).catch(() => {})
    }
  }, [preselectedRoad])

  useEffect(() => {
    if (roadSlNo && Number(roadSlNo) > 0) {
      api.getRoad(Number(roadSlNo)).then(setRoad).catch(() => setRoad(null))
    } else {
      setRoad(null)
    }
  }, [roadSlNo])

  const handleFileChange = async (selected: File | null) => {
    setFile(selected)
    setAnalysis(null)
    setError('')
    if (selected) {
      setPreview(URL.createObjectURL(selected))
      setAnalyzing(true)
      try {
        const result = await api.analyzeImage(selected)
        setAnalysis(result)
      } catch {
        /* preview is optional */
      } finally {
        setAnalyzing(false)
      }
    } else {
      setPreview(null)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6))
        setLongitude(pos.coords.longitude.toFixed(6))
      },
      () => setError('Could not get your location'),
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (!file) {
      setError('Please upload a photo of the road damage')
      return
    }

    setError('')
    setSubmitting(true)

    const formData = new FormData()
    formData.append('road_sl_no', roadSlNo)
    formData.append('file', file)
    if (latitude) formData.append('latitude', latitude)
    if (longitude) formData.append('longitude', longitude)

    try {
      const complaint = await api.submitComplaint(formData)
      setSubmittedComplaint(complaint)

      // Look up the matched authority for the routing display
      if (complaint.authority_id) {
        try {
          const authorities = await api.getAuthorities()
          const match = authorities.find((a) => a.id === complaint.authority_id)
          setMatchedAuthority(match || null)
        } catch {
          /* routing display is best-effort */
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit complaint')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="card">
          <h1 className="text-2xl font-bold">Report a Road Issue</h1>
          <p className="mt-2 text-slate-600">You need to be logged in to file a complaint.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
            <Link to="/signup" className="btn-secondary">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (submittedComplaint) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="card border-emerald-200 bg-emerald-50 text-center">
          <div className="text-4xl">✓</div>
          <h1 className="mt-4 text-2xl font-bold text-emerald-900">Complaint Filed!</h1>
          <p className="mt-2 text-emerald-800">
            Your tracking ID is{' '}
            <span className="font-mono font-bold">{submittedComplaint.tracking_id}</span>
          </p>
        </div>

        {/* Star feature — live routing/notification trail */}
        <RoutingNotification
          trackingId={submittedComplaint.tracking_id}
          authority={matchedAuthority}
          severity={submittedComplaint.severity}
        />

        <div className="flex justify-center gap-3">
          <Link to={`/track?id=${submittedComplaint.tracking_id}`} className="btn-primary">
            Track Complaint
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmittedComplaint(null)
              setMatchedAuthority(null)
            }}
            className="btn-secondary"
          >
            File Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Report a Road Issue</h1>
        <p className="mt-1 text-slate-600">
          Upload a photo — AI will detect the damage type and route your complaint automatically
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label htmlFor="road_sl_no" className="label">
            Road Serial Number (sl_no)
          </label>
          <input
            id="road_sl_no"
            type="number"
            required
            min={1}
            className="input"
            value={roadSlNo}
            onChange={(e) => setRoadSlNo(e.target.value)}
            placeholder="e.g. 620 — find this on the map"
          />
          {road && (
            <p className="mt-2 text-sm text-road-700">
              {road.road_name} · {road.road_type.code} · {road.bbmp_division.name}
            </p>
          )}
          <Link to="/map" className="mt-1 inline-block text-sm text-road-600 hover:underline">
            Find a road on the map →
          </Link>
        </div>

        <div>
          <label htmlFor="photo" className="label">
            Photo of Damage
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            required
            className="input file:mr-4 file:rounded file:border-0 file:bg-road-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-road-800"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
        </div>

        {preview && (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <img src={preview} alt="Preview" className="max-h-64 w-full object-cover" />
          </div>
        )}

        {analyzing && <LoadingSpinner label="Analyzing image with AI…" />}

        {analysis && analysis.status === 'damage_detected' && (
          <div className="rounded-lg border border-road-200 bg-road-50 p-4">
            <p className="font-semibold text-road-900">AI Detection Preview</p>
            <p className="mt-1 text-sm text-road-800">
              {analysis.total_detections} detection(s) · Worst severity:{' '}
              <SeverityBadge severity={analysis.worst_severity || 'Unknown'} />
            </p>
            {analysis.detections.map((d, i) => (
              <p key={i} className="mt-2 text-sm text-road-700">
                {d.damage_type} — {d.confidence.toFixed(0)}% confidence · SLA: {d.sla}
              </p>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="latitude" className="label">
              Latitude (optional)
            </label>
            <input
              id="latitude"
              className="input"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="longitude" className="label">
              Longitude (optional)
            </label>
            <input
              id="longitude"
              className="input"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>

        <button type="button" onClick={useMyLocation} className="btn-secondary text-xs">
          Use My Location
        </button>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Submitting…' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  )
}