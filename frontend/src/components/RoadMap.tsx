import { useEffect, useMemo } from 'react'
import { MapContainer, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Road } from '../types'
import { BENGALURU_CENTER, parseWktLineString } from '../utils/geo'

interface RoadMapProps {
  roads?: Road[]
  selectedSlNo?: number | null
  onMapClick?: (lat: number, lng: number) => void
  height?: string
  zoom?: number
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FitBounds({ roads }: { roads: Road[] }) {
  const map = useMap()
  useEffect(() => {
    if (roads.length === 0) return
    const allCoords = roads.flatMap((r) =>
      r.geometry ? parseWktLineString(r.geometry) : [],
    )
    if (allCoords.length === 0) return
    map.fitBounds(allCoords, { padding: [30, 30] })
  }, [map, roads])
  return null
}

function getRoadColor(healthScore: number, selected: boolean): string {
  if (selected) return '#15803d'
  if (healthScore >= 70) return '#22c55e'
  if (healthScore >= 40) return '#f59e0b'
  return '#ef4444'
}

function getConditionLabel(score: number): string {
  if (score >= 70) return 'Good'
  if (score >= 40) return 'Average'
  return 'Poor'
}

export default function RoadMap({
  roads = [],
  selectedSlNo,
  onMapClick,
  height = '400px',
  zoom = 12,
}: RoadMapProps) {
  const polylines = useMemo(
    () =>
      roads
        .filter((r) => r.geometry)
        .map((road) => ({
          road,
          coords: parseWktLineString(road.geometry!),
        }))
        .filter((item) => item.coords.length > 0),
    [roads],
  )

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={BENGALURU_CENTER}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        {roads.length > 0 && <FitBounds roads={roads} />}
        {polylines.map(({ road, coords }) => (
          <Polyline
            key={road.sl_no}
            positions={coords}
            pathOptions={{
              color: getRoadColor(road.health_score, road.sl_no === selectedSlNo),
              weight: road.sl_no === selectedSlNo ? 7 : 4,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div style={{ minWidth: '160px' }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{road.road_name}</p>
                <p>Health Score: <strong>{road.health_score}/100</strong></p>
                <p>Condition: <strong>{getConditionLabel(road.health_score)}</strong></p>
                <p>Contractor: {road.contractor_name}</p>
                <p>Open Complaints: {road.open_complaints}</p>
              </div>
            </Popup>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  )
}