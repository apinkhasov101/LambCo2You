"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Factory, Zap, Target, Filter, Download } from "lucide-react"
import type { AceticAcidFacility, CO2EmitterFacility, OverlapSite } from "@/lib/types"

interface MapProps {
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

// Mock map implementation using HTML5 Canvas
// In production, you would use a real mapping library like Leaflet or Mapbox
export function InteractiveMap({ aceticFacilities, co2Facilities, overlapSites, onSiteSelect }: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedSite, setSelectedSite] = useState<OverlapSite | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: any } | null>(null)
  const [filters, setFilters] = useState<MapFilters>({
    showAceticFacilities: true,
    showCO2Facilities: true,
    showOverlapSites: true,
    minScore: 0,
    maxDistance: 50,
  })

  // Map bounds (US coordinates)
  const mapBounds = {
    north: 49,
    south: 25,
    east: -66,
    west: -125,
  }

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat: number, lng: number, canvasWidth: number, canvasHeight: number) => {
    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * canvasWidth
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * canvasHeight
    return { x, y }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#15803d" // green-700
    if (score >= 60) return "#84cc16" // lime-500
    if (score >= 40) return "#f97316" // orange-500
    return "#ea580c" // orange-600
  }

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const canvasWidth = rect.width
    const canvasHeight = rect.height

    // Clear canvas
    ctx.fillStyle = "#f0fdf4"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * canvasWidth
      const y = (i / 10) * canvasHeight
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }

    // Draw acetic acid facilities
    if (filters.showAceticFacilities) {
      aceticFacilities.forEach((facility) => {
        const { x, y } = latLngToCanvas(facility.latitude, facility.longitude, canvasWidth, canvasHeight)

        ctx.fillStyle = "#3b82f6" // blue-500
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = "#1e40af" // blue-800
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    // Draw CO2 facilities
    if (filters.showCO2Facilities) {
      co2Facilities.forEach((facility) => {
        const { x, y } = latLngToCanvas(facility.latitude, facility.longitude, canvasWidth, canvasHeight)

        ctx.fillStyle = "#ef4444" // red-500
        ctx.beginPath()
        ctx.rect(x - 5, y - 5, 10, 10)
        ctx.fill()

        ctx.strokeStyle = "#dc2626" // red-600
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    // Draw overlap sites
    if (filters.showOverlapSites) {
      const filteredSites = overlapSites.filter(
        (site) => site.overallScore >= filters.minScore && site.distance <= filters.maxDistance,
      )

      filteredSites.forEach((site) => {
        const { x, y } = latLngToCanvas(site.latitude, site.longitude, canvasWidth, canvasHeight)
        const radius = Math.max(8, (site.overallScore / 100) * 15)

        ctx.fillStyle = getScoreColor(site.overallScore)
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = "#374151"
        ctx.lineWidth = selectedSite?.id === site.id ? 3 : 1
        ctx.stroke()

        // Add score text
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(site.overallScore.toString(), x, y + 4)
      })
    }

    // Draw legend
    const legendX = 20
    const legendY = 20
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(legendX - 10, legendY - 10, 200, 120)
    ctx.strokeStyle = "#e5e7eb"
    ctx.strokeRect(legendX - 10, legendY - 10, 200, 120)

    ctx.fillStyle = "#374151"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Legend", legendX, legendY + 10)

    // Legend items
    const legendItems = [
      { color: "#3b82f6", shape: "circle", label: "Acetic Acid Facilities" },
      { color: "#ef4444", shape: "square", label: "CO2 Emitter Facilities" },
      { color: "#15803d", shape: "circle", label: "Optimal Sites (80+ score)" },
    ]

    legendItems.forEach((item, index) => {
      const itemY = legendY + 35 + index * 25

      if (item.shape === "circle") {
        ctx.fillStyle = item.color
        ctx.beginPath()
        ctx.arc(legendX + 10, itemY, 6, 0, 2 * Math.PI)
        ctx.fill()
      } else {
        ctx.fillStyle = item.color
        ctx.fillRect(legendX + 4, itemY - 6, 12, 12)
      }

      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.fillText(item.label, legendX + 25, itemY + 4)
    })
  }, [aceticFacilities, co2Facilities, overlapSites, filters, selectedSite])

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if click is on an overlap site
    const filteredSites = overlapSites.filter(
      (site) => site.overallScore >= filters.minScore && site.distance <= filters.maxDistance,
    )

    for (const site of filteredSites) {
      const { x: siteX, y: siteY } = latLngToCanvas(site.latitude, site.longitude, rect.width, rect.height)
      const radius = Math.max(8, (site.overallScore / 100) * 15)

      const distance = Math.sqrt((x - siteX) ** 2 + (y - siteY) ** 2)
      if (distance <= radius) {
        setSelectedSite(site)
        onSiteSelect?.(site)
        break
      }
    }
  }

  // Handle mouse move for hover effects
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check for hover on facilities or sites
    let hovered = null

    // Check acetic facilities
    if (filters.showAceticFacilities) {
      for (const facility of aceticFacilities) {
        const { x: facilityX, y: facilityY } = latLngToCanvas(
          facility.latitude,
          facility.longitude,
          rect.width,
          rect.height,
        )
        const distance = Math.sqrt((x - facilityX) ** 2 + (y - facilityY) ** 2)
        if (distance <= 8) {
          hovered = { x: event.clientX, y: event.clientY, data: { type: "acetic", ...facility } }
          break
        }
      }
    }

    // Check CO2 facilities
    if (!hovered && filters.showCO2Facilities) {
      for (const facility of co2Facilities) {
        const { x: facilityX, y: facilityY } = latLngToCanvas(
          facility.latitude,
          facility.longitude,
          rect.width,
          rect.height,
        )
        const distance = Math.sqrt((x - facilityX) ** 2 + (y - facilityY) ** 2)
        if (distance <= 8) {
          hovered = { x: event.clientX, y: event.clientY, data: { type: "co2", ...facility } }
          break
        }
      }
    }

    // Check overlap sites
    if (!hovered && filters.showOverlapSites) {
      const filteredSites = overlapSites.filter(
        (site) => site.overallScore >= filters.minScore && site.distance <= filters.maxDistance,
      )

      for (const site of filteredSites) {
        const { x: siteX, y: siteY } = latLngToCanvas(site.latitude, site.longitude, rect.width, rect.height)
        const radius = Math.max(8, (site.overallScore / 100) * 15)
        const distance = Math.sqrt((x - siteX) ** 2 + (y - siteY) ** 2)
        if (distance <= radius) {
          hovered = { x: event.clientX, y: event.clientY, data: { type: "site", ...site } }
          break
        }
      }
    }

    setHoveredPoint(hovered)
  }

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
      {/* Map Controls */}
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
              />
            </div>
            <span className="text-sm text-muted-foreground">{filters.minScore}</span>
          </div>

          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Map Container */}
      <Card className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[600px] cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 bg-card border rounded-lg shadow-lg p-3 pointer-events-none"
            style={{
              left: hoveredPoint.x - 200,
              top: hoveredPoint.y - 100,
            }}
          >
            {hoveredPoint.data.type === "acetic" && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Acetic Acid Facility</span>
                </div>
                <p className="text-sm">{hoveredPoint.data.name}</p>
                <p className="text-xs text-muted-foreground">
                  Capacity: {hoveredPoint.data.capacity.toLocaleString()} tons/year
                </p>
                <Badge variant={hoveredPoint.data.operationalStatus === "active" ? "default" : "secondary"}>
                  {hoveredPoint.data.operationalStatus}
                </Badge>
              </div>
            )}

            {hoveredPoint.data.type === "co2" && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-red-500" />
                  <span className="font-medium">CO2 Emitter Facility</span>
                </div>
                <p className="text-sm">{hoveredPoint.data.name}</p>
                <p className="text-xs text-muted-foreground">
                  Emissions: {hoveredPoint.data.co2EmissionRate.toLocaleString()} tons/year
                </p>
                <Badge variant="outline">{hoveredPoint.data.facilityType}</Badge>
              </div>
            )}

            {hoveredPoint.data.type === "site" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">Optimal Site</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    Overall: <span className="font-medium">{hoveredPoint.data.overallScore}</span>
                  </div>
                  <div>
                    Distance: <span className="font-medium">{hoveredPoint.data.distance}km</span>
                  </div>
                  <div>Governmental: {hoveredPoint.data.governmentalScore}</div>
                  <div>Logistics: {hoveredPoint.data.logisticsScore}</div>
                  <div>Policy: {hoveredPoint.data.policyIncentivesScore}</div>
                  <div>Community: {hoveredPoint.data.communityReadinessScore}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Selected Site Details */}
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
