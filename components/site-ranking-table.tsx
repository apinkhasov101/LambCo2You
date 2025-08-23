"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, Search, Filter } from "lucide-react"
import type { OverlapSite } from "@/lib/types"

interface SiteRankingTableProps {
  sites: OverlapSite[]
  selectedSites: OverlapSite[]
  onSiteSelect: (site: OverlapSite) => void
}

type SortField =
  | "overallScore"
  | "governmentalScore"
  | "logisticsScore"
  | "policyIncentivesScore"
  | "communityReadinessScore"
  | "distance"
type SortDirection = "asc" | "desc"

export function SiteRankingTable({ sites, selectedSites, onSiteSelect }: SiteRankingTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("overallScore")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [scoreFilter, setScoreFilter] = useState<string>("all")

  // Filter and sort sites
  const filteredAndSortedSites = sites
    .filter((site) => {
      // Search filter
      if (searchTerm && !site.id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Score filter
      if (scoreFilter !== "all") {
        const minScore = Number.parseInt(scoreFilter)
        if (site.overallScore < minScore) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortDirection === "asc") {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const isSelected = (site: OverlapSite) => {
    return selectedSites.some((s) => s.id === site.id)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Rankings</CardTitle>
        <CardDescription>
          Comprehensive ranking of all identified optimal sites based on scoring criteria
        </CardDescription>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="text-sm">Min Score:</Label>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="80">80+</SelectItem>
                <SelectItem value="60">60+</SelectItem>
                <SelectItem value="40">40+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedSites.length} of {sites.length} sites
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Site ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("overallScore")}>
                  <div className="flex items-center gap-1">
                    Overall Score
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("governmentalScore")}>
                  <div className="flex items-center gap-1">
                    Governmental
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("logisticsScore")}>
                  <div className="flex items-center gap-1">
                    Logistics
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("policyIncentivesScore")}>
                  <div className="flex items-center gap-1">
                    Policy
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("communityReadinessScore")}>
                  <div className="flex items-center gap-1">
                    Community
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("distance")}>
                  <div className="flex items-center gap-1">
                    Distance (km)
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedSites.map((site, index) => (
                <TableRow key={site.id} className={isSelected(site) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox checked={isSelected(site)} onCheckedChange={() => onSiteSelect(site)} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {site.id}
                      {index < 3 && (
                        <Badge variant="outline" className="text-xs">
                          Top {index + 1}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getScoreBadgeVariant(site.overallScore)}>{site.overallScore}</Badge>
                  </TableCell>
                  <TableCell>{site.governmentalScore}</TableCell>
                  <TableCell>{site.logisticsScore}</TableCell>
                  <TableCell>{site.policyIncentivesScore}</TableCell>
                  <TableCell>{site.communityReadinessScore}</TableCell>
                  <TableCell>{site.distance}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => onSiteSelect(site)}>
                      {isSelected(site) ? "Deselect" : "Select"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedSites.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No sites match the current filters</div>
        )}
      </CardContent>
    </Card>
  )
}
