"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Factory, Zap, Target } from "lucide-react"

interface MapLegendProps {
  aceticCount: number
  co2Count: number
  siteCount: number
  className?: string
}

export function MapLegend({ aceticCount, co2Count, siteCount, className }: MapLegendProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-semibold mb-3">Map Legend</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-blue-800"></div>
            <Factory className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Acetic Acid Facilities</span>
          </div>
          <Badge variant="secondary">{aceticCount}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 border-2 border-red-600"></div>
            <Zap className="h-4 w-4 text-red-500" />
            <span className="text-sm">CO2 Emitter Facilities</span>
          </div>
          <Badge variant="secondary">{co2Count}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded-full border-2 border-foreground"></div>
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm">Optimal Sites</span>
          </div>
          <Badge variant="secondary">{siteCount}</Badge>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t">
        <h4 className="text-sm font-medium mb-2">Score Color Coding</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-700 rounded-full"></div>
            <span>80-100: Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
            <span>60-79: Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>40-59: Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span>0-39: Poor</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
