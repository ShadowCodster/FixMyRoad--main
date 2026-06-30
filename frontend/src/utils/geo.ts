/** Parse WKT LINESTRING into [lat, lng][] for Leaflet */
export function parseWktLineString(wkt: string): [number, number][] {
  const match = wkt.match(/LINESTRING\s*\(([^)]+)\)/i)
  if (!match) return []

  return match[1].split(',').map((pair) => {
    const [lng, lat] = pair.trim().split(/\s+/).map(Number)
    return [lat, lng] as [number, number]
  })
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_00_00_000) {
    return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(2)} L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946]
