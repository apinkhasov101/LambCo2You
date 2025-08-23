"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, Filter, Download, AlertTriangle, ExternalLink } from "lucide-react"
import type { AceticAcidFacility, CO2EmitterFacility, OverlapSite } from "@/lib/types"

interface GoogleMapProps {
  aceticFacilities: AceticAcidFacility[]
  co2Facilities: CO2EmitterFacility[]
  overlapSites: OverlapSite[]
  onSiteSelect?: (site: OverlapSite) => void
}

interface MapFilters {
  showAceticFacilities: boolean
  showCO2Facilities: boolean
  showOverlapSites: boolean
  minScore: number
  maxDistance: number
}

// Declare global google maps types
declare global {
  interface Window {
    google: any
    initMap: () => void
    gm_authFailure: () => void
  }
}

export function GoogleMap({ aceticFacilities, co2Facilities, overlapSites, onSiteSelect }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)

  const [selectedSite, setSelectedSite] = useState<OverlapSite | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<MapFilters>({
    showAceticFacilities: true,
    showCO2Facilities: true,
    showOverlapSites: true,
    minScore: 0,
    maxDistance: 50,
  })

  const hasApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== "undefined" &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim() !== ""

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.8283, lng: -98.5795 }, // Center of US
        zoom: 5,
        mapTypeId: "roadmap",
        styles: [
          {
            featureType: "all",
            elementType: "geometry.fill",
            stylers: [{ color: "#f0fdf4" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#bfdbfe" }],
          },
        ],
      })

      mapInstanceRef.current = map
      infoWindowRef.current = new window.google.maps.InfoWindow()
      setIsMapLoaded(true)
      setMapError(null)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Google Maps initialization error:", error)
      setMapError("Failed to initialize Google Maps. Please check your API key configuration.")
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasApiKey) {
      setMapError("Google Maps API key is not configured")
      setIsLoading(false)
      return
    }

    if (window.google) {
      initializeMap()
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`
    script.async = true
    script.defer = true

    script.onerror = () => {
      console.error("[v0] Failed to load Google Maps API script")
      setMapError("Failed to load Google Maps API. Please check your internet connection and API key.")
      setIsLoading(false)
    }

    window.gm_authFailure = () => {
      console.error("[v0] Google Maps API authentication failed")
      setMapError("Google Maps API authentication failed. Please check your API key and billing settings.")
      setIsLoading(false)
    }

    window.initMap = () => {
      setTimeout(initializeMap, 100)
    }

    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      delete window.initMap
      delete window.gm_authFailure
    }
  }, [initializeMap, hasApiKey])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#15803d" // green-700
    if (score >= 60) return "#84cc16" // lime-500
    if (score >= 40) return "#f97316" // orange-500
    return "#ea580c" // orange-600
  }

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
  }

  const createMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    clearMarkers()

    if (filters.showAceticFacilities) {
      aceticFacilities.forEach((facility) => {
        const marker = new window.google.maps.Marker({
          position: { lat: facility.latitude, lng: facility.longitude },
          map: mapInstanceRef.current,
          title: facility.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#1e40af",
            strokeWeight: 2,
            scale: 8,
          },
        })

        marker.addListener("click", () => {
          const content = `
            <div class="p-3 max-w-xs">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span class="font-medium">Acetic Acid Facility</span>
              </div>
              <p class="font-semibold">${facility.name}</p>
              <p class="text-sm text-gray-600">Capacity: ${facility.capacity.toLocaleString()} tons/year</p>
              <p class="text-sm"><span class="inline-block px-2 py-1 text-xs rounded ${facility.operationalStatus === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}">${facility.operationalStatus}</span></p>
            </div>
          `
          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(mapInstanceRef.current, marker)
        })

        markersRef.current.push(marker)
      })
    }

    if (filters.showCO2Facilities) {
      co2Facilities.forEach((facility) => {
        const marker = new window.google.maps.Marker({
          position: { lat: facility.latitude, lng: facility.longitude },
          map: mapInstanceRef.current,
          title: facility.name,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            fillColor: "#ef4444",
            fillOpacity: 1,
            strokeColor: "#dc2626",
            strokeWeight: 2,
            scale: 6,
            rotation: 45,
          },
        })

        marker.addListener("click", () => {
          const content = `
            <div class="p-3 max-w-xs">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-4 h-4 bg-red-500"></div>
                <span class="font-medium">CO2 Emitter Facility</span>
              </div>
              <p class="font-semibold">${facility.name}</p>
              <p class="text-sm text-gray-600">Emissions: ${facility.co2EmissionRate.toLocaleString()} tons/year</p>
              <p class="text-sm"><span class="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">${facility.facilityType}</span></p>
            </div>
          `
          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(mapInstanceRef.current, marker)
        })

        markersRef.current.push(marker)
      })
    }

    if (filters.showOverlapSites) {
      const filteredSites = overlapSites.filter(
        (site) => site.overallScore >= filters.minScore && site.distance <= filters.maxDistance,
      )

      filteredSites.forEach((site) => {
        const marker = new window.google.maps.Marker({
          position: { lat: site.latitude, lng: site.longitude },
          map: mapInstanceRef.current,
          title: `Optimal Site - Score: ${site.overallScore}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: getScoreColor(site.overallScore),
            fillOpacity: 0.8,
            strokeColor: "#374151",
            strokeWeight: selectedSite?.id === site.id ? 3 : 1,
            scale: Math.max(10, (site.overallScore / 100) * 20),
          },
          label: {
            text: site.overallScore.toString(),
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
          },
        })

        marker.addListener("click", () => {
          setSelectedSite(site)
          onSiteSelect?.(site)

          const content = `
            <div class="p-3 max-w-sm">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-4 h-4 rounded-full" style="background-color: ${getScoreColor(site.overallScore)}"></div>
                <span class="font-medium">Optimal Site</span>
              </div>
              <p class="font-semibold mb-2">Site ID: ${site.id}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Overall Score:</strong> ${site.overallScore}</div>
                <div><strong>Distance:</strong> ${site.distance}km</div>
                <div><strong>Governmental:</strong> ${site.governmentalScore}</div>
                <div><strong>Logistics:</strong> ${site.logisticsScore}</div>
                <div><strong>Policy:</strong> ${site.policyIncentivesScore}</div>
                <div><strong>Community:</strong> ${site.communityReadinessScore}</div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <div>Acetic Facilities: ${site.aceticAcidFacilities.length}</div>
                <div>CO2 Facilities: ${site.co2EmitterFacilities.length}</div>
              </div>
            </div>
          `
          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(mapInstanceRef.current, marker)
        })

        markersRef.current.push(marker)
      })
    }
  }, [aceticFacilities, co2Facilities, overlapSites, filters, selectedSite, isMapLoaded, onSiteSelect])

  useEffect(() => {
    createMarkers()
  }, [createMarkers])

  const exportData = () => {
    const filteredSites = overlapSites.filter(
      (site) => site.overallScore >= filters.minScore && site.distance <= filters.maxDistance,
    )

    const csvContent = [
      "Site ID,Latitude,Longitude,Overall Score,Governmental,Logistics,Policy,Community,Distance",
      ...filteredSites.map(
        (site) =>
          `${site.id},${site.latitude},${site.longitude},${site.overallScore},${site.governmentalScore},${site.logisticsScore},${site.policyIncentivesScore},${site.communityReadinessScore},${site.distance}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "site-analysis.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <Label className="text-sm font-medium">Filters</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="acetic-facilities"
              checked={filters.showAceticFacilities}
              onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, showAceticFacilities: checked }))}
              disabled={!isMapLoaded}
            />
            <Label htmlFor="acetic-facilities" className="text-sm">
              Acetic Acid
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="co2-facilities"
              checked={filters.showCO2Facilities}
              onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, showCO2Facilities: checked }))}
              disabled={!isMapLoaded}
            />
            <Label htmlFor="co2-facilities" className="text-sm">
              CO2 Emitters
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="overlap-sites"
              checked={filters.showOverlapSites}
              onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, showOverlapSites: checked }))}
              disabled={!isMapLoaded}
            />
            <Label htmlFor="overlap-sites" className="text-sm">
              Optimal Sites
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-sm">Min Score:</Label>
            <div className="w-24">
              <Slider
                value={[filters.minScore]}
                onValueChange={([value]) => setFilters((prev) => ({ ...prev, minScore: value }))}
                max={100}
                step={5}
                className="w-full"
                disabled={!isMapLoaded}
              />
            </div>
            <span className="text-sm text-muted-foreground">{filters.minScore}</span>
          </div>

          <Button onClick={exportData} variant="outline" size="sm" disabled={!isMapLoaded}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {mapError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>{mapError}</p>
            {!hasApiKey && (
              <div className="space-y-2">
                <p className="font-medium">To enable Google Maps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Get a Google Maps API key from the Google Cloud Console</li>
                  <li>Enable the Maps JavaScript API for your project</li>
                  <li>Add the API key to your environment variables as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
                  <li>Ensure billing is enabled for your Google Cloud project</li>
                </ol>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Get API Key
                  </a>
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="relative">
        <div ref={mapRef} className="w-full h-[600px] rounded-lg" style={{ minHeight: "600px" }} />

        {isLoading && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center space-y-2 p-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Map unavailable</p>
              <p className="text-xs text-muted-foreground">See error message above for details</p>
            </div>
          </div>
        )}
      </Card>

      {selectedSite && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Selected Site: {selectedSite.id}</h3>
            </div>
            <Badge
              variant={
                selectedSite.overallScore >= 80
                  ? "default"
                  : selectedSite.overallScore >= 60
                    ? "secondary"
                    : "destructive"
              }
            >
              Score: {selectedSite.overallScore}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Coordinates</Label>
              <p className="font-medium">
                {selectedSite.latitude.toFixed(4)}, {selectedSite.longitude.toFixed(4)}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Distance</Label>
              <p className="font-medium">{selectedSite.distance} km</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Governmental</Label>
              <p className="font-medium">{selectedSite.governmentalScore}/100</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Logistics</Label>
              <p className="font-medium">{selectedSite.logisticsScore}/100</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Policy Incentives</Label>
              <p className="font-medium">{selectedSite.policyIncentivesScore}/100</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Community Readiness</Label>
              <p className="font-medium">{selectedSite.communityReadinessScore}/100</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Acetic Facilities</Label>
              <p className="font-medium">{selectedSite.aceticAcidFacilities.length}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">CO2 Facilities</Label>
              <p className="font-medium">{selectedSite.co2EmitterFacilities.length}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
