import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import RoadMap from '../components/RoadMap'
import HealthBadge from '../components/HealthBadge'
import type { Road, RoadNearbyItem } from '../types'

export default function MapPage() {
  const [nearbyRoads, setNearbyRoads] = useState<RoadNearbyItem[]>([])
  const [nearbyFullRoads, setNearbyFullRoads] = useState<Road[]>([])
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null)
  const [loadingNearby, setLoadingNearby] = useState(false)
  const [loadingRoad, setLoadingRoad] = useState(false)
  const [error, setError] = useState('')
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null)

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setClickCoords({ lat, lng })
    setSelectedRoad(null)
    setNearbyFullRoads([])
    setError('')
    setLoadingNearby(true)
    try {
      const roads = await api.getNearbyRoads(lat, lng, 2)
      setNearbyRoads(roads)
      if (roads.length === 0) {
        setError('No roads found within 2 km of this location.')
      } else {
        const fullRoads = await Promise.all(roads.map((r) => api.getRoad(r.sl_no)))
        setNearbyFullRoads(fullRoads)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to find nearby roads')
    } finally {
      setLoadingNearby(false)
    }
  }, [])

  const selectRoad = async (slNo: number) => {
    setLoadingRoad(true)
    setError('')
    try {
      const road = await api.getRoad(slNo)
      setSelectedRoad(road)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load road')
    } finally {
      setLoadingRoad(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tap-a-Road Map</h1>
        <p className="mt-1 text-slate-600">
          Click anywhere on the map to find nearby roads and view their health scores
        </p>
      </div>

      <RoadMap
        roads={nearbyFullRoads.length > 0 ? nearbyFullRoads : selectedRoad ? [selectedRoad] : []}
        selectedSlNo={selectedRoad?.sl_no}
        onMapClick={handleMapClick}
        height="480px"
      />

      {nearbyFullRoads.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span style={{ background: '#22c55e', width: 20, height: 8, display: 'inline-block', borderRadius: 2 }}></span>
            Good (≥70)
          </span>
          <span className="flex items-center gap-2">
            <span style={{ background: '#f59e0b', width: 20, height: 8, display: 'inline-block', borderRadius: 2 }}></span>
            Average (40–69)
          </span>
          <span className="flex items-center gap-2">
            <span style={{ background: '#ef4444', width: 20, height: 8, display: 'inline-block', borderRadius: 2 }}></span>
            Poor (&lt;40)
          </span>
          <span className="flex items-center gap-2">
            <span style={{ background: '#15803d', width: 20, height: 8, display: 'inline-block', borderRadius: 2 }}></span>
            Selected
          </span>
        </div>
      )}

      {clickCoords && (
        <p className="text-sm text-slate-500">
          Clicked at {clickCoords.lat.toFixed(5)}, {clickCoords.lng.toFixed(5)}
        </p>
      )}

      {loadingNearby && <LoadingSpinner label="Finding nearby roads…" />}

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          {error}
        </div>
      )}

      {nearbyRoads.length > 0 && !selectedRoad && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Nearby Roads</h2>
          <div className="divide-y divide-slate-100">
            {nearbyRoads.map((road) => (
              <button
                key={road.sl_no}
                type="button"
                onClick={() => selectRoad(road.sl_no)}
                className="flex w-full items-center justify-between py-3 text-left transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{road.road_name}</p>
                  <p className="text-sm text-slate-500">
                    {road.road_type} · {road.contractor_name}
                  </p>
                </div>
                <span className="text-sm text-slate-500">{road.distance_km.toFixed(2)} km</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loadingRoad && <LoadingSpinner label="Loading road details…" />}

      {selectedRoad && (
        <div className="card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedRoad.road_name}</h2>
              <p className="text-sm text-slate-500">
                {selectedRoad.road_type.code} · {selectedRoad.bbmp_division.name} ·{' '}
                {selectedRoad.length_km} km
              </p>
            </div>
            <HealthBadge condition="Health" score={selectedRoad.health_score} />
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Contractor</dt>
              <dd className="mt-1 font-medium">{selectedRoad.contractor_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Executive Engineer</dt>
              <dd className="mt-1 font-medium">{selectedRoad.executive_engineer}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Open Complaints</dt>
              <dd className="mt-1 font-medium">{selectedRoad.open_complaints}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/roads/${selectedRoad.sl_no}`} className="btn-primary">
              Full Road Details
            </Link>
            <Link
              to={`/complaint?road=${selectedRoad.sl_no}`}
              className="btn-secondary"
            >
              Report Issue on This Road
            </Link>
            <button
              type="button"
              onClick={() => {
                setSelectedRoad(null)
                setNearbyRoads([])
                setNearbyFullRoads([])
              }}
              className="btn-secondary"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
