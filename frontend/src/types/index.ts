export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'citizen' | 'authority' | 'admin'
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RoadTypeBrief {
  id: number
  code: string
}

export interface DivisionBrief {
  id: number
  name: string
}

export interface Road {
  sl_no: number
  road_id: string
  road_name: string
  road_type: RoadTypeBrief
  road_ref: string | null
  length_km: string
  bbmp_division: DivisionBrief
  contractor_name: string
  executive_engineer: string
  ee_contact: number | null
  asst_exec_engineer: string | null
  aee_contact: number | null
  asst_engineer: string | null
  ae_contact: number | null
  completion_date: string
  dlp_period: string
  dlp_expiry_date: string
  budget_sanctioned: number
  budget_released: number
  budget_spent: number
  budget_unspent: number
  health_score: number
  last_complaint_date: string
  open_complaints: number
  geometry: string | null
}

export interface RoadNearbyItem {
  sl_no: number
  road_id: string
  road_name: string
  road_type: string
  contractor_name: string
  distance_km: number
}

export interface BudgetTrail {
  sl_no: number
  road_name: string
  budget_sanctioned: number
  budget_released: number
  budget_spent: number
  budget_unspent: number
  pct_released: number
  pct_spent: number
  flag_released_exceeds_sanctioned: boolean
  flag_large_spend_gap: boolean
}

export interface RoadHealthScore {
  sl_no: number
  road_name: string
  contractor_name: string
  health_score: number
  days_since_last_repair: number
  open_complaints: number
  pct_budget_used: number | null
  repair_count: number
  condition: string
}

export interface Repair {
  id: number
  road_sl_no: number
  event_type: string
  event_date: string
  notes: string | null
  linked_complaint_id: number | null
}

export interface Complaint {
  id: number
  tracking_id: string
  road_sl_no: number
  user_id: number | null
  authority_id: number | null
  issue_type: string
  severity: string
  confidence_score: string | null
  latitude: string | null
  longitude: string | null
  image_url: string | null
  status: string
  response_deadline: string | null
  escalated: boolean
  created_at: string
  resolved_at: string | null
}

export interface Authority {
  id: number
  name: string
  road_type_id: number
  road_type_code: string
  bbmp_division_id: number | null
  bbmp_division_name: string | null
  escalation_to: string | null
  contact_email: string | null
  contact_phone: string | null
}

export interface ContractorScore {
  contractor_name: string
  total_roads: number
  avg_health_score: number
  total_open_complaints: number
  low_utilisation_roads: number
  contractor_score: number
  red_flagged: boolean
}

export interface Dashboard {
  division: string | null
  total_roads: number
  condition_good: number
  condition_average: number
  condition_poor: number
  condition_good_pct: number
  condition_average_pct: number
  condition_poor_pct: number
  complaints_filed_this_month: number
  complaints_resolved_this_month: number
  complaints_pending: number
  average_resolution_days: number | null
  lowest_scoring_contractor: ContractorScore | null
}

export interface AnalyzeDetection {
  damage_type: string
  confidence: number
  severity: string
  sla: string
  route_to: string
  bbox: number[]
}

export interface AnalyzeResult {
  status: string
  total_detections: number
  worst_severity: string | null
  sla: string | null
  route_to: string | null
  detections: AnalyzeDetection[]
}

export const BBMP_DIVISIONS = [
  'West',
  'East',
  'Yelahanka',
  'Rajarajeshwari Nagar',
  'Dasarahalli',
  'Bommanahalli',
  'Mahadevapura',
  'South',
] as const
