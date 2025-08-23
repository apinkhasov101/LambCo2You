import type { AceticAcidFacility, CO2EmitterFacility, OverlapSite } from "./types"

/**
 * Data validation utilities
 */
export class DataValidator {
  static validateCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
  }

  static validateAceticFacility(facility: any): facility is AceticAcidFacility {
    return (
      typeof facility.id === "string" &&
      typeof facility.name === "string" &&
      typeof facility.latitude === "number" &&
      typeof facility.longitude === "number" &&
      typeof facility.capacity === "number" &&
      ["active", "inactive", "planned"].includes(facility.operationalStatus) &&
      DataValidator.validateCoordinates(facility.latitude, facility.longitude) &&
      facility.capacity > 0
    )
  }

  static validateCO2Facility(facility: any): facility is CO2EmitterFacility {
    return (
      typeof facility.id === "string" &&
      typeof facility.name === "string" &&
      typeof facility.latitude === "number" &&
      typeof facility.longitude === "number" &&
      typeof facility.co2EmissionRate === "number" &&
      ["petrochemical", "refinery", "steel", "cement", "power"].includes(facility.facilityType) &&
      ["active", "inactive", "planned"].includes(facility.operationalStatus) &&
      DataValidator.validateCoordinates(facility.latitude, facility.longitude) &&
      facility.co2EmissionRate > 0
    )
  }
}

/**
 * Data aggregation and statistics
 */
export class DataAggregator {
  static calculateFacilityStats(facilities: AceticAcidFacility[]) {
    if (facilities.length === 0) return null

    const capacities = facilities.map((f) => f.capacity)
    const totalCapacity = capacities.reduce((sum, cap) => sum + cap, 0)
    const avgCapacity = totalCapacity / facilities.length
    const maxCapacity = Math.max(...capacities)
    const minCapacity = Math.min(...capacities)

    const statusCounts = facilities.reduce(
      (acc, f) => {
        acc[f.operationalStatus] = (acc[f.operationalStatus] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalFacilities: facilities.length,
      totalCapacity,
      avgCapacity: Math.round(avgCapacity),
      maxCapacity,
      minCapacity,
      statusDistribution: statusCounts,
    }
  }

  static calculateEmissionStats(facilities: CO2EmitterFacility[]) {
    if (facilities.length === 0) return null

    const emissions = facilities.map((f) => f.co2EmissionRate)
    const totalEmissions = emissions.reduce((sum, em) => sum + em, 0)
    const avgEmissions = totalEmissions / facilities.length
    const maxEmissions = Math.max(...emissions)
    const minEmissions = Math.min(...emissions)

    const typeCounts = facilities.reduce(
      (acc, f) => {
        acc[f.facilityType] = (acc[f.facilityType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusCounts = facilities.reduce(
      (acc, f) => {
        acc[f.operationalStatus] = (acc[f.operationalStatus] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalFacilities: facilities.length,
      totalEmissions,
      avgEmissions: Math.round(avgEmissions),
      maxEmissions,
      minEmissions,
      typeDistribution: typeCounts,
      statusDistribution: statusCounts,
    }
  }

  static calculateSiteStats(sites: OverlapSite[]) {
    if (sites.length === 0) return null

    const scores = {
      governmental: sites.map((s) => s.governmentalScore),
      logistics: sites.map((s) => s.logisticsScore),
      policyIncentives: sites.map((s) => s.policyIncentivesScore),
      communityReadiness: sites.map((s) => s.communityReadinessScore),
      overall: sites.map((s) => s.overallScore),
    }

    const calculateStats = (values: number[]) => ({
      avg: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
      max: Math.max(...values),
      min: Math.min(...values),
    })

    return {
      totalSites: sites.length,
      scoreStats: {
        governmental: calculateStats(scores.governmental),
        logistics: calculateStats(scores.logistics),
        policyIncentives: calculateStats(scores.policyIncentives),
        communityReadiness: calculateStats(scores.communityReadiness),
        overall: calculateStats(scores.overall),
      },
      avgDistance: Math.round((sites.reduce((sum, s) => sum + s.distance, 0) / sites.length) * 100) / 100,
    }
  }
}

/**
 * Data filtering and search utilities
 */
export class DataFilter {
  static filterByRegion(
    facilities: (AceticAcidFacility | CO2EmitterFacility)[],
    bounds: { north: number; south: number; east: number; west: number },
  ) {
    return facilities.filter(
      (f) =>
        f.latitude >= bounds.south &&
        f.latitude <= bounds.north &&
        f.longitude >= bounds.west &&
        f.longitude <= bounds.east,
    )
  }

  static filterByStatus(facilities: (AceticAcidFacility | CO2EmitterFacility)[], status: string[]) {
    return facilities.filter((f) => status.includes(f.operationalStatus))
  }

  static filterAceticByCapacity(facilities: AceticAcidFacility[], minCapacity: number, maxCapacity?: number) {
    return facilities.filter((f) => {
      if (maxCapacity) {
        return f.capacity >= minCapacity && f.capacity <= maxCapacity
      }
      return f.capacity >= minCapacity
    })
  }

  static filterCO2ByEmissions(facilities: CO2EmitterFacility[], minEmissions: number, maxEmissions?: number) {
    return facilities.filter((f) => {
      if (maxEmissions) {
        return f.co2EmissionRate >= minEmissions && f.co2EmissionRate <= maxEmissions
      }
      return f.co2EmissionRate >= minEmissions
    })
  }

  static filterCO2ByType(facilities: CO2EmitterFacility[], types: string[]) {
    return facilities.filter((f) => types.includes(f.facilityType))
  }

  static filterSitesByScore(
    sites: OverlapSite[],
    criteria: {
      minOverall?: number
      minGovernmental?: number
      minLogistics?: number
      minPolicyIncentives?: number
      minCommunityReadiness?: number
    },
  ) {
    return sites.filter((site) => {
      if (criteria.minOverall && site.overallScore < criteria.minOverall) return false
      if (criteria.minGovernmental && site.governmentalScore < criteria.minGovernmental) return false
      if (criteria.minLogistics && site.logisticsScore < criteria.minLogistics) return false
      if (criteria.minPolicyIncentives && site.policyIncentivesScore < criteria.minPolicyIncentives) return false
      if (criteria.minCommunityReadiness && site.communityReadinessScore < criteria.minCommunityReadiness) return false
      return true
    })
  }
}

/**
 * Export utilities for data processing
 */
export class DataExporter {
  static toCSV(sites: OverlapSite[]): string {
    const headers = [
      "Site ID",
      "Latitude",
      "Longitude",
      "Distance (km)",
      "Governmental Score",
      "Logistics Score",
      "Policy Incentives Score",
      "Community Readiness Score",
      "Overall Score",
      "Acetic Acid Facilities",
      "CO2 Emitter Facilities",
    ]

    const rows = sites.map((site) => [
      site.id,
      site.latitude.toFixed(6),
      site.longitude.toFixed(6),
      site.distance.toString(),
      site.governmentalScore.toString(),
      site.logisticsScore.toString(),
      site.policyIncentivesScore.toString(),
      site.communityReadinessScore.toString(),
      site.overallScore.toString(),
      site.aceticAcidFacilities.join(";"),
      site.co2EmitterFacilities.join(";"),
    ])

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }

  static toGeoJSON(sites: OverlapSite[]) {
    return {
      type: "FeatureCollection",
      features: sites.map((site) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [site.longitude, site.latitude],
        },
        properties: {
          id: site.id,
          distance: site.distance,
          governmentalScore: site.governmentalScore,
          logisticsScore: site.logisticsScore,
          policyIncentivesScore: site.policyIncentivesScore,
          communityReadinessScore: site.communityReadinessScore,
          overallScore: site.overallScore,
          aceticAcidFacilities: site.aceticAcidFacilities,
          co2EmitterFacilities: site.co2EmitterFacilities,
        },
      })),
    }
  }
}
