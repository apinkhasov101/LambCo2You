import { type NextRequest, NextResponse } from "next/server"
import { generateSiteRecommendations } from "@/lib/scoring-engine"
import { DataValidator, DataAggregator } from "@/lib/data-processing"

interface OverlapSite {
  id: string
  latitude: number
  longitude: number
  aceticAcidFacilities: string[]
  co2EmitterFacilities: string[]
  distance: number // km radius for overlap
  governmentalScore: number // 0-100
  logisticsScore: number // 0-100
  policyIncentivesScore: number // 0-100
  communityReadinessScore: number // 0-100
  overallScore: number // weighted average
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Mock scoring algorithm - in production this would use real data sources
function calculateSiteScores(
  lat: number,
  lon: number,
): {
  governmental: number
  logistics: number
  policyIncentives: number
  communityReadiness: number
} {
  // Mock scoring based on location (in reality, this would query various databases)
  const governmental = Math.floor(Math.random() * 40) + 60 // 60-100
  const logistics = Math.floor(Math.random() * 30) + 50 // 50-80
  const policyIncentives = Math.floor(Math.random() * 50) + 30 // 30-80
  const communityReadiness = Math.floor(Math.random() * 60) + 20 // 20-80

  return { governmental, logistics, policyIncentives, communityReadiness }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const maxDistance = Number.parseFloat(searchParams.get("maxDistance") || "50")
    const minScore = Number.parseFloat(searchParams.get("minScore") || "0")

    // Fetch data from both facility APIs
    const baseUrl = request.nextUrl.origin

    const [aceticResponse, co2Response] = await Promise.all([
      fetch(`${baseUrl}/api/facilities/acetic-acid`),
      fetch(`${baseUrl}/api/facilities/co2-emitters`),
    ])

    const aceticData = await aceticResponse.json()
    const co2Data = await co2Response.json()

    const aceticFacilities = aceticData.data || []
    const co2Facilities = co2Data.data || []

    // Validate data
    const validAceticFacilities = aceticFacilities.filter(DataValidator.validateAceticFacility)
    const validCO2Facilities = co2Facilities.filter(DataValidator.validateCO2Facility)

    // Generate enhanced site recommendations
    const overlapSites = generateSiteRecommendations(validAceticFacilities, validCO2Facilities, maxDistance, minScore)

    // Calculate statistics
    const aceticStats = DataAggregator.calculateFacilityStats(validAceticFacilities)
    const co2Stats = DataAggregator.calculateEmissionStats(validCO2Facilities)
    const siteStats = DataAggregator.calculateSiteStats(overlapSites)

    return NextResponse.json({
      success: true,
      data: overlapSites,
      count: overlapSites.length,
      statistics: {
        aceticFacilities: aceticStats,
        co2Facilities: co2Stats,
        sites: siteStats,
      },
      parameters: {
        maxDistance,
        minScore,
        aceticFacilitiesCount: validAceticFacilities.length,
        co2FacilitiesCount: validCO2Facilities.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error analyzing site overlaps:", error)
    return NextResponse.json({ success: false, error: "Failed to analyze site overlaps" }, { status: 500 })
  }
}
