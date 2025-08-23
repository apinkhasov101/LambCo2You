// Shared type definitions for the site selector platform

export interface AceticAcidFacility {
  id: string
  name: string
  latitude: number
  longitude: number
  capacity: number
  operationalStatus: "active" | "inactive" | "planned"
  lastUpdated: string
}

export interface CO2EmitterFacility {
  id: string
  name: string
  latitude: number
  longitude: number
  co2EmissionRate: number
  facilityType: "petrochemical" | "refinery" | "steel" | "cement" | "power"
  operationalStatus: "active" | "inactive" | "planned"
  lastUpdated: string
}

export interface OverlapSite {
  id: string
  latitude: number
  longitude: number
  aceticAcidFacilities: string[]
  co2EmitterFacilities: string[]
  distance: number
  governmentalScore: number
  logisticsScore: number
  policyIncentivesScore: number
  communityReadinessScore: number
  overallScore: number
}

export interface SiteAnalysisParams {
  maxDistance?: number
  minScore?: number
  region?: string
  facilityType?: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  count?: number
  timestamp: string
}
