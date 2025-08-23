"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Factory, Zap, Target, MapPin } from "lucide-react"
import type { AceticAcidFacility, CO2EmitterFacility, OverlapSite } from "@/lib/types"

interface AnalyticsPanelProps {
  aceticFacilities: AceticAcidFacility[]
  co2Facilities: CO2EmitterFacility[]
  overlapSites: OverlapSite[]
}

export function AnalyticsPanel({ aceticFacilities, co2Facilities, overlapSites }: AnalyticsPanelProps) {
  // Calculate statistics
  const totalCapacity = aceticFacilities.reduce((sum, f) => sum + f.capacity, 0)
  const totalEmissions = co2Facilities.reduce((sum, f) => sum + f.co2EmissionRate, 0)
  const avgScore =
    overlapSites.length > 0 ? overlapSites.reduce((sum, s) => sum + s.overallScore, 0) / overlapSites.length : 0

  const excellentSites = overlapSites.filter((s) => s.overallScore >= 80).length
  const goodSites = overlapSites.filter((s) => s.overallScore >= 60 && s.overallScore < 80).length
  const fairSites = overlapSites.filter((s) => s.overallScore >= 40 && s.overallScore < 60).length

  const topSite = overlapSites.length > 0 ? overlapSites[0] : null

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Metrics</CardTitle>
          <CardDescription>Overview of facility data and site analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Acetic Facilities</span>
              </div>
              <Badge variant="secondary">{aceticFacilities.length}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-red-500" />
                <span className="text-sm">CO2 Emitters</span>
              </div>
              <Badge variant="secondary">{co2Facilities.length}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm">Optimal Sites</span>
              </div>
              <Badge variant="secondary">{overlapSites.length}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Avg Score</span>
              </div>
              <Badge variant={avgScore >= 70 ? "default" : "secondary"}>{avgScore.toFixed(1)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity & Emissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Production Capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Total Acetic Acid Capacity</span>
              <span className="font-medium">{(totalCapacity / 1000000).toFixed(1)}M tons/year</span>
            </div>
            <Progress value={Math.min((totalCapacity / 2000000) * 100, 100)} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Total CO2 Emissions</span>
              <span className="font-medium">{(totalEmissions / 1000000).toFixed(1)}M tons/year</span>
            </div>
            <Progress value={Math.min((totalEmissions / 10000000) * 100, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Site Quality Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Site Quality</CardTitle>
          <CardDescription>Distribution of sites by score range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Excellent (80+)</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${overlapSites.length > 0 ? (excellentSites / overlapSites.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs w-6">{excellentSites}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Good (60-79)</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div
                    className="bg-lime-500 h-2 rounded-full"
                    style={{ width: `${overlapSites.length > 0 ? (goodSites / overlapSites.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs w-6">{goodSites}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Fair (40-59)</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${overlapSites.length > 0 ? (fairSites / overlapSites.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs w-6">{fairSites}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Site */}
      {topSite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Top Ranked Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{topSite.id}</span>
              <Badge variant="default">{topSite.overallScore}</Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              {topSite.latitude.toFixed(4)}, {topSite.longitude.toFixed(4)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Gov: {topSite.governmentalScore}</div>
              <div>Log: {topSite.logisticsScore}</div>
              <div>Pol: {topSite.policyIncentivesScore}</div>
              <div>Com: {topSite.communityReadinessScore}</div>
            </div>

            <div className="text-xs text-muted-foreground">Distance: {topSite.distance}km</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
