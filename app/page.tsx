"use client"

import { useState } from "react"
import Link from "next/link"
import { GoogleMap } from "@/components/google-map"
import { MapLegend } from "@/components/map-legend"
import { SiteRankingTable } from "@/components/site-ranking-table"
import { AnalyticsPanel } from "@/components/analytics-panel"
import { SiteComparison } from "@/components/site-comparison"
import { useMapData } from "@/hooks/use-map-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, BarChart3, Settings, RefreshCw } from "lucide-react"
import type { OverlapSite } from "@/lib/types"

export default function SiteSelectorDashboard() {
  const [selectedSites, setSelectedSites] = useState<OverlapSite[]>([])
  const [mapParams, setMapParams] = useState({
    maxDistance: 50,
    minScore: 0,
    autoRefresh: false,
  })

  const { aceticFacilities, co2Facilities, overlapSites, loading, error, refetch } = useMapData(mapParams)

  const handleSiteSelect = (site: OverlapSite) => {
    setSelectedSites((prev) => {
      const exists = prev.find((s) => s.id === site.id)
      if (exists) {
        return prev.filter((s) => s.id !== site.id)
      }
      return [...prev, site].slice(-3) // Keep max 3 sites for comparison
    })
  }

  const clearSelection = () => {
    setSelectedSites([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading site analysis data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>
            Error loading data: {error}
            <Button onClick={refetch} variant="outline" size="sm" className="ml-2 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI-Powered Site Selector</h1>
              <p className="text-muted-foreground mt-1">
                Optimal locations for acetic acid production from CO2 capture
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {overlapSites.length} Sites Analyzed
              </Badge>
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Analytics */}
          <div className="lg:col-span-1 space-y-6">
            <AnalyticsPanel
              aceticFacilities={aceticFacilities}
              co2Facilities={co2Facilities}
              overlapSites={overlapSites}
            />

            <MapLegend
              aceticCount={aceticFacilities.length}
              co2Count={co2Facilities.length}
              siteCount={overlapSites.length}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Map Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Interactive Site Map
                    </CardTitle>
                    <CardDescription>
                      Click on sites to select for comparison. Use filters to refine results.
                    </CardDescription>
                  </div>
                  {selectedSites.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{selectedSites.length} selected</Badge>
                      <Button onClick={clearSelection} variant="outline" size="sm">
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <GoogleMap
                  aceticFacilities={aceticFacilities}
                  co2Facilities={co2Facilities}
                  overlapSites={overlapSites}
                  onSiteSelect={handleSiteSelect}
                />
              </CardContent>
            </Card>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="ranking" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ranking">Site Rankings</TabsTrigger>
                <TabsTrigger value="comparison">Site Comparison</TabsTrigger>
                <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="ranking" className="space-y-4">
                <SiteRankingTable sites={overlapSites} selectedSites={selectedSites} onSiteSelect={handleSiteSelect} />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <SiteComparison
                  sites={selectedSites}
                  onRemoveSite={(siteId) => setSelectedSites((prev) => prev.filter((s) => s.id !== siteId))}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Score Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {["governmental", "logistics", "policyIncentives", "communityReadiness"].map((metric) => {
                          const scores = overlapSites.map(
                            (site) => site[`${metric}Score` as keyof OverlapSite] as number,
                          )
                          const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
                          const max = Math.max(...scores)
                          const min = Math.min(...scores)

                          return (
                            <div key={metric} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{metric.replace(/([A-Z])/g, " $1")}</span>
                                <span className="text-muted-foreground">
                                  Avg: {avg.toFixed(1)} | Range: {min}-{max}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${avg}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Regional Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {["Gulf Coast", "Midwest", "Northeast", "West Coast", "Southeast"].map((region) => {
                          // Mock regional data - in production, this would be calculated from actual coordinates
                          const count = Math.floor((Math.random() * overlapSites.length) / 2) + 1
                          const percentage = (count / overlapSites.length) * 100

                          return (
                            <div key={region} className="flex items-center justify-between">
                              <span className="text-sm">{region}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-muted rounded-full h-2">
                                  <div className="bg-accent h-2 rounded-full" style={{ width: `${percentage}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground w-8">{count}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
