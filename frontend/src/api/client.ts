import type {
  AnalyzeResult,
  Authority,
  BudgetTrail,
  Complaint,
  ContractorScore,
  Dashboard,
  Repair,
  Road,
  RoadHealthScore,
  RoadNearbyItem,
  TokenResponse,
  User,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem('roadwatch_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers = new Headers(options.headers)

  if (auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      message = body.detail || body.message || message
      if (Array.isArray(message)) {
        message = message.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(', ')
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, String(message))
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export const api = {
  baseUrl: API_URL,

  imageUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${API_URL}/${path.replace(/^\//, '')}`
  },

  // Auth
  signup(data: {
    name: string
    email: string
    phone?: string
    password: string
    role?: string
  }) {
    return request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  login(email: string, password: string) {
    return request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  me() {
    return request<User>('/auth/me', {}, true)
  },

  // Roads
  getRoad(slNo: number) {
    return request<Road>(`/roads/${slNo}`)
  },

  getRoadByOsm(osmId: string) {
    return request<Road>(`/roads/by-osm/${osmId}`)
  },

  getNearbyRoads(lat: number, lng: number, radius = 2) {
    return request<RoadNearbyItem[]>(
      `/roads/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
    )
  },

  getRoadBudget(slNo: number) {
    return request<BudgetTrail>(`/roads/${slNo}/budget`)
  },

  getRoadHealth(slNo: number) {
    return request<RoadHealthScore>(`/roads/${slNo}/health-score`)
  },

  getRoadTimeline(slNo: number) {
    return request<Repair[]>(`/roads/${slNo}/timeline`)
  },

  addRepair(
    slNo: number,
    data: {
      event_type: string
      event_date: string
      notes?: string
      linked_complaint_id?: number
    },
  ) {
    return request<Repair>(`/roads/${slNo}/repairs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true)
  },

  // Complaints
  submitComplaint(formData: FormData) {
    return request<Complaint>('/complaints', {
      method: 'POST',
      body: formData,
    }, true)
  },

  getComplaints(roadSlNo?: number) {
    const q = roadSlNo ? `?road_sl_no=${roadSlNo}` : ''
    return request<Complaint[]>(`/complaints${q}`)
  },

  getComplaint(trackingId: string) {
    return request<Complaint>(`/complaints/${trackingId}`)
  },

  // Authorities & contractors
  getAuthorities() {
    return request<Authority[]>('/authorities')
  },

  getContractorLeaderboard() {
    return request<ContractorScore[]>('/contractors/leaderboard')
  },

  // Dashboard
  getDashboard(division?: string) {
    const q = division ? `?division=${encodeURIComponent(division)}` : ''
    return request<Dashboard>(`/dashboard${q}`)
  },

  // ML preview
  analyzeImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request<AnalyzeResult>('/analyze/image', {
      method: 'POST',
      body: formData,
    })
  },
}

export { ApiError }
