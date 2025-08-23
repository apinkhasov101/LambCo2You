"use client"

import { useState, useEffect } from "react"
import type { AceticAcidFacility, CO2EmitterFacility, OverlapSite, APIResponse } from "@/lib/types"

interface MapDataState {
  aceticFacilities: AceticAcidFacility[]
  co2Facilities: CO2EmitterFacility[]
  overlapSites: OverlapSite[]
  loading: boolean
  error: string | null
}

interface MapDataParams {
  maxDistance?: number
  minScore?: number
  region?: string
  facilityType?: string
  autoRefresh?: boolean
}

export function useMapData(params: MapDataParams = {}) {
  const [data, setData] = useState<MapDataState>({
    aceticFacilities: [],
    co2Facilities: [],
    overlapSites: [],
    loading: true,
    error: null,
  })

  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }))

      // Build query parameters
      const searchParams = new URLSearchParams()
      if (params.maxDistance) searchParams.set("maxDistance", params.maxDistance.toString())
      if (params.minScore) searchParams.set("minScore", params.minScore.toString())
      if (params.region) searchParams.set("region", params.region)
      if (params.facilityType) searchParams.set("facilityType", params.facilityType)

      // Fetch overlap sites (which includes all facility data)
      const response = await fetch(`/api/site-analysis/overlap?${searchParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<OverlapSite[]> = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch data")
      }

      // Fetch individual facility data for map display
      const [aceticResponse, co2Response] = await Promise.all([
        fetch(`/api/facilities/acetic-acid?${searchParams}`),
        fetch(`/api/facilities/co2-emitters?${searchParams}`),
      ])

      const aceticData: APIResponse<AceticAcidFacility[]> = await aceticResponse.json()
      const co2Data: APIResponse<CO2EmitterFacility[]> = await co2Response.json()

      setData({
        aceticFacilities: aceticData.data || [],
        co2Facilities: co2Data.data || [],
        overlapSites: result.data || [],
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("Error fetching map data:", error)
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }))
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [params.maxDistance, params.minScore, params.region, params.facilityType])

  // Auto-refresh functionality
  useEffect(() => {
    if (!params.autoRefresh) return

    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [params.autoRefresh])

  return {
    ...data,
    refetch: fetchData,
  }
}
