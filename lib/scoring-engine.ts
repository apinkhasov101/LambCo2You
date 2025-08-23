import type { AceticAcidFacility, CO2EmitterFacility, OverlapSite } from "./types"

// Scoring weights for different criteria
export const SCORING_WEIGHTS = {
  governmental: 0.3,
  logistics: 0.25,
  policyIncentives: 0.25,
  communityReadiness: 0.2,
} as const

// Geographic regions with different regulatory environments
export const REGULATORY_ZONES = {
  "gulf-coast": { governmental: 85, logistics: 90, policy: 75 },
  midwest: { governmental: 70, logistics: 85, policy: 60 },
  northeast: { governmental: 60, logistics: 70, policy: 80 },
  "west-coast": { governmental: 65, logistics: 75, policy: 90 },
  southeast: { governmental: 80, logistics: 80, policy: 70 },
} as const

// Infrastructure proximity scoring
export const INFRASTRUCTURE_FACTORS = {
  port: { logistics: 25, governmental: 5 },
  highway: { logistics: 15, governmental: 0 },
  rail: { logistics: 20, governmental: 0 },
  pipeline: { logistics: 30, governmental: 10 },
  powerGrid: { logistics: 10, governmental: 5 },
} as const

export interface ScoringFactors {
  governmental: number
  logistics: number
  policyIncentives: number
  communityReadiness: number
}

export interface GeographicContext {
  region: keyof typeof REGULATORY_ZONES
  nearPort: boolean
  nearHighway: boolean
  nearRail: boolean
  nearPipeline: boolean
  nearPowerGrid: boolean
  populationDensity: "low" | "medium" | "high"
  industrialZoning: boolean
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Determine geographic region based on coordinates
 */
export function getGeographicRegion(lat: number, lon: number): keyof typeof REGULATORY_ZONES {
  // Gulf Coast: Texas, Louisiana, Mississippi, Alabama
  if (lat >= 25 && lat <= 32 && lon >= -97 && lon <= -87) return "gulf-coast"

  // Midwest: Illinois, Indiana, Ohio, Michigan, Wisconsin
  if (lat >= 38 && lat <= 47 && lon >= -90 && lon <= -80) return "midwest"

  // Northeast: New York, Pennsylvania, New Jersey, Connecticut, Massachusetts
  if (lat >= 39 && lat <= 45 && lon >= -80 && lon <= -69) return "northeast"

  // West Coast: California, Oregon, Washington
  if (lat >= 32 && lat <= 49 && lon >= -125 && lon <= -114) return "west-coast"

  // Default to Southeast for other locations
  return "southeast"
}

/**
 * Mock infrastructure proximity detection (in production, use GIS data)
 */
export function getInfrastructureContext(lat: number, lon: number): Omit<GeographicContext, "region"> {
  // Mock infrastructure detection based on location
  const isCoastal = Math.abs(lon) > 80 && (lat < 35 || lat > 45)
  const isUrban = Math.random() > 0.6

  return {
    nearPort: isCoastal && Math.random() > 0.4,
    nearHighway: Math.random() > 0.3,
    nearRail: Math.random() > 0.5,
    nearPipeline: Math.random() > 0.4,
    nearPowerGrid: Math.random() > 0.2,
    populationDensity: isUrban ? "high" : Math.random() > 0.5 ? "medium" : "low",
    industrialZoning: Math.random() > 0.4,
  }
}

/**
 * Calculate governmental permission score
 */
export function calculateGovernmentalScore(context: GeographicContext): number {
  let score = REGULATORY_ZONES[context.region].governmental

  // Adjust for zoning
  if (context.industrialZoning) score += 10
  else score -= 15

  // Population density impact on permitting
  switch (context.populationDensity) {
    case "low":
      score += 5
      break
    case "medium":
      score -= 5
      break
    case "high":
      score -= 15
      break
  }

  // Infrastructure proximity can ease permitting
  if (context.nearPort) score += INFRASTRUCTURE_FACTORS.port.governmental
  if (context.nearPipeline) score += INFRASTRUCTURE_FACTORS.pipeline.governmental
  if (context.nearPowerGrid) score += INFRASTRUCTURE_FACTORS.powerGrid.governmental

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate logistics score
 */
export function calculateLogisticsScore(context: GeographicContext): number {
  let score = REGULATORY_ZONES[context.region].logistics

  // Infrastructure proximity bonuses
  if (context.nearPort) score += INFRASTRUCTURE_FACTORS.port.logistics
  if (context.nearHighway) score += INFRASTRUCTURE_FACTORS.highway.logistics
  if (context.nearRail) score += INFRASTRUCTURE_FACTORS.rail.logistics
  if (context.nearPipeline) score += INFRASTRUCTURE_FACTORS.pipeline.logistics
  if (context.nearPowerGrid) score += INFRASTRUCTURE_FACTORS.powerGrid.logistics

  // Population density can affect logistics
  if (context.populationDensity === "high") score -= 10

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate policy incentives score
 */
export function calculatePolicyIncentivesScore(context: GeographicContext): number {
  let score = REGULATORY_ZONES[context.region].policy

  // Industrial zoning often comes with incentives
  if (context.industrialZoning) score += 15

  // Lower population areas often have more incentives
  switch (context.populationDensity) {
    case "low":
      score += 10
      break
    case "medium":
      score += 5
      break
    case "high":
      score -= 5
      break
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate community readiness score
 */
export function calculateCommunityReadinessScore(context: GeographicContext): number {
  let score = 50 // Base score

  // Industrial zoning indicates community acceptance
  if (context.industrialZoning) score += 20

  // Population density affects community acceptance
  switch (context.populationDensity) {
    case "low":
      score += 15
      break
    case "medium":
      score += 5
      break
    case "high":
      score -= 20
      break
  }

  // Existing infrastructure suggests community familiarity
  if (context.nearPort || context.nearRail || context.nearPipeline) score += 10

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate comprehensive site scores
 */
export function calculateSiteScores(lat: number, lon: number): ScoringFactors {
  const region = getGeographicRegion(lat, lon)
  const infraContext = getInfrastructureContext(lat, lon)
  const context: GeographicContext = { region, ...infraContext }

  return {
    governmental: calculateGovernmentalScore(context),
    logistics: calculateLogisticsScore(context),
    policyIncentives: calculatePolicyIncentivesScore(context),
    communityReadiness: calculateCommunityReadinessScore(context),
  }
}

/**
 * Calculate weighted overall score
 */
export function calculateOverallScore(scores: ScoringFactors): number {
  return Math.round(
    scores.governmental * SCORING_WEIGHTS.governmental +
      scores.logistics * SCORING_WEIGHTS.logistics +
      scores.policyIncentives * SCORING_WEIGHTS.policyIncentives +
      scores.communityReadiness * SCORING_WEIGHTS.communityReadiness,
  )
}

/**
 * Analyze facility synergies for enhanced scoring
 */
export function analyzeFacilitySynergies(
  aceticFacilities: AceticAcidFacility[],
  co2Facilities: CO2EmitterFacility[],
): number {
  let synergyScore = 0

  // Higher capacity acetic acid facilities get bonus
  const totalAceticCapacity = aceticFacilities.reduce((sum, f) => sum + f.capacity, 0)
  if (totalAceticCapacity > 400000) synergyScore += 10

  // Higher CO2 emission rates get bonus (more feedstock available)
  const totalCO2Emissions = co2Facilities.reduce((sum, f) => sum + f.co2EmissionRate, 0)
  if (totalCO2Emissions > 2000000) synergyScore += 10

  // Facility type diversity bonus
  const facilityTypes = new Set(co2Facilities.map((f) => f.facilityType))
  synergyScore += Math.min(facilityTypes.size * 3, 15)

  return Math.min(synergyScore, 25) // Cap at 25 points
}

/**
 * Generate site recommendations with enhanced scoring
 */
export function generateSiteRecommendations(
  aceticFacilities: AceticAcidFacility[],
  co2Facilities: CO2EmitterFacility[],
  maxDistance = 50,
  minScore = 0,
): OverlapSite[] {
  const sites: OverlapSite[] = []
  let siteId = 1

  aceticFacilities.forEach((aceticFacility) => {
    co2Facilities.forEach((co2Facility) => {
      const distance = calculateDistance(
        aceticFacility.latitude,
        aceticFacility.longitude,
        co2Facility.latitude,
        co2Facility.longitude,
      )

      if (distance <= maxDistance) {
        // Calculate optimal site location (weighted by facility capacity/emissions)
        const aceticWeight = aceticFacility.capacity / 1000000
        const co2Weight = co2Facility.co2EmissionRate / 10000000
        const totalWeight = aceticWeight + co2Weight

        const optimalLat = (aceticFacility.latitude * aceticWeight + co2Facility.latitude * co2Weight) / totalWeight
        const optimalLon = (aceticFacility.longitude * aceticWeight + co2Facility.longitude * co2Weight) / totalWeight

        // Calculate base scores
        const scores = calculateSiteScores(optimalLat, optimalLon)

        // Add synergy bonus
        const synergyBonus = analyzeFacilitySynergies([aceticFacility], [co2Facility])
        const adjustedScores = {
          ...scores,
          governmental: Math.min(100, scores.governmental + synergyBonus * 0.3),
          logistics: Math.min(100, scores.logistics + synergyBonus * 0.4),
        }

        const overallScore = calculateOverallScore(adjustedScores)

        if (overallScore >= minScore) {
          sites.push({
            id: `site-${siteId++}`,
            latitude: optimalLat,
            longitude: optimalLon,
            aceticAcidFacilities: [aceticFacility.id],
            co2EmitterFacilities: [co2Facility.id],
            distance: Math.round(distance * 100) / 100,
            governmentalScore: adjustedScores.governmental,
            logisticsScore: adjustedScores.logistics,
            policyIncentivesScore: adjustedScores.policyIncentives,
            communityReadinessScore: adjustedScores.communityReadiness,
            overallScore,
          })
        }
      }
    })
  })

  // Sort by overall score (highest first)
  return sites.sort((a, b) => b.overallScore - a.overallScore)
}
