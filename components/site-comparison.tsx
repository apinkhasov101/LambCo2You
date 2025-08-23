"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, MapPin, Award, TrendingUp } from "lucide-react"
import type { OverlapSite } from "@/lib/types"

interface SiteComparisonProps {
  sites: OverlapSite[]
  onRemoveSite: (siteId: string) => void
}

export function SiteComparison({ sites, onRemoveSite }: SiteComparisonProps) {
  if (sites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site Comparison</CardTitle>
          <CardDescription>
            Select sites from the map or ranking table to compare their scores and characteristics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sites selected for comparison</p>
            <p className="text-sm">Click on sites in the map or table to add them here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-600"
    if (score >= 60) return "bg-lime-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const bestSite = sites.reduce((best, current) => (current.overallScore > best.overallScore ? current : best))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Site Comparison
        </CardTitle>
        <CardDescription>Comparing {sites.length} selected sites across all scoring criteria</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best Site Highlight */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Recommended Site</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{bestSite.id}</p>
              <p className="text-sm text-muted-foreground">
                {bestSite.latitude.toFixed(4)}, {bestSite.longitude.toFixed(4)}
              </p>
            </div>
            <Badge variant="default" className="text-lg px-3 py-1">
              {bestSite.overallScore}
            </Badge>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <Card key={site.id} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => onRemoveSite(site.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{site.id}</CardTitle>
                  <Badge variant={getScoreBadgeVariant(site.overallScore)}>{site.overallScore}</Badge>
                </div>
                <CardDescription className="text-xs">
                  {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Governmental</span>
                    <span className="font-medium">{site.governmentalScore}</span>
                  </div>
                  <Progress value={site.governmentalScore} className="h-1" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Logistics</span>
                    <span className="font-medium">{site.logisticsScore}</span>
                  </div>
                  <Progress value={site.logisticsScore} className="h-1" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Policy</span>
                    <span className="font-medium">{site.policyIncentivesScore}</span>
                  </div>
                  <Progress value={site.policyIncentivesScore} className="h-1" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Community</span>
                    <span className="font-medium">{site.communityReadinessScore}</span>
                  </div>
                  <Progress value={site.communityReadinessScore} className="h-1" />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Distance</span>
                    <span>{site.distance}km</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Facilities</span>
                    <span>
                      {site.aceticAcidFacilities.length}A + {site.co2EmitterFacilities.length}C
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Criteria</th>
                {sites.map((site) => (
                  <th key={site.id} className="text-center py-2 px-2">
                    {site.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-1">
              {[
                { key: "overallScore", label: "Overall Score" },
                { key: "governmentalScore", label: "Governmental" },
                { key: "logisticsScore", label: "Logistics" },
                { key: "policyIncentivesScore", label: "Policy Incentives" },
                { key: "communityReadinessScore", label: "Community Readiness" },
                { key: "distance", label: "Distance (km)" },
              ].map((criteria) => (
                <tr key={criteria.key} className="border-b border-muted">
                  <td className="py-2 font-medium">{criteria.label}</td>
                  {sites.map((site) => {
                    const value = site[criteria.key as keyof OverlapSite] as number
                    const isDistance = criteria.key === "distance"
                    const isBest = !isDistance
                      ? value === Math.max(...sites.map((s) => s[criteria.key as keyof OverlapSite] as number))
                      : value === Math.min(...sites.map((s) => s.distance))

                    return (
                      <td key={site.id} className="text-center py-2 px-2">
                        <span className={`${isBest ? "font-bold text-primary" : ""}`}>
                          {criteria.key === "distance" ? value : value}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
