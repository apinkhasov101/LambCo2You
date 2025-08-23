"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Database,
  Sliders,
  Globe,
  Download,
  Upload,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { SCORING_WEIGHTS, REGULATORY_ZONES } from "@/lib/scoring-engine"

interface AdminConfig {
  apiEndpoints: {
    aceticAcidUrl: string
    aceticAcidKey: string
    co2EmittersUrl: string
    co2EmittersKey: string
  }
  scoringWeights: {
    governmental: number
    logistics: number
    policyIncentives: number
    communityReadiness: number
  }
  systemSettings: {
    autoRefresh: boolean
    refreshInterval: number
    maxDistance: number
    minScore: number
    cacheTimeout: number
  }
  regionalSettings: {
    defaultRegion: string
    customZones: Record<string, any>
  }
}

export default function AdminPanel() {
  const [config, setConfig] = useState<AdminConfig>({
    apiEndpoints: {
      aceticAcidUrl: process.env.NEXT_PUBLIC_ACETIC_ACID_API_URL || "",
      aceticAcidKey: "",
      co2EmittersUrl: process.env.NEXT_PUBLIC_CO2_EMITTERS_API_URL || "",
      co2EmittersKey: "",
    },
    scoringWeights: {
      governmental: SCORING_WEIGHTS.governmental * 100,
      logistics: SCORING_WEIGHTS.logistics * 100,
      policyIncentives: SCORING_WEIGHTS.policyIncentives * 100,
      communityReadiness: SCORING_WEIGHTS.communityReadiness * 100,
    },
    systemSettings: {
      autoRefresh: false,
      refreshInterval: 30,
      maxDistance: 50,
      minScore: 0,
      cacheTimeout: 300,
    },
    regionalSettings: {
      defaultRegion: "gulf-coast",
      customZones: {},
    },
  })

  const [apiStatus, setApiStatus] = useState({
    aceticAcid: "unknown",
    co2Emitters: "unknown",
    lastChecked: null as Date | null,
  })

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const testApiConnection = async (endpoint: "aceticAcid" | "co2Emitters") => {
    try {
      const url = endpoint === "aceticAcid" ? config.apiEndpoints.aceticAcidUrl : config.apiEndpoints.co2EmittersUrl
      const key = endpoint === "aceticAcid" ? config.apiEndpoints.aceticAcidKey : config.apiEndpoints.co2EmittersKey

      if (!url) {
        setApiStatus((prev) => ({ ...prev, [endpoint]: "error" }))
        return
      }

      // Mock API test - in production, this would make actual API calls
      const response = await fetch(`/api/facilities/${endpoint === "aceticAcid" ? "acetic-acid" : "co2-emitters"}`)

      if (response.ok) {
        setApiStatus((prev) => ({
          ...prev,
          [endpoint]: "connected",
          lastChecked: new Date(),
        }))
      } else {
        setApiStatus((prev) => ({ ...prev, [endpoint]: "error" }))
      }
    } catch (error) {
      setApiStatus((prev) => ({ ...prev, [endpoint]: "error" }))
    }
  }

  const testAllConnections = async () => {
    await Promise.all([testApiConnection("aceticAcid"), testApiConnection("co2Emitters")])
  }

  const saveConfiguration = async () => {
    setSaveStatus("saving")
    try {
      // Mock save operation - in production, this would save to a backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validate weights sum to 100
      const totalWeight = Object.values(config.scoringWeights).reduce((sum, weight) => sum + weight, 0)
      if (Math.abs(totalWeight - 100) > 0.1) {
        throw new Error("Scoring weights must sum to 100%")
      }

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const exportConfiguration = () => {
    const configJson = JSON.stringify(config, null, 2)
    const blob = new Blob([configJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "site-selector-config.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string)
        setConfig(importedConfig)
      } catch (error) {
        alert("Invalid configuration file")
      }
    }
    reader.readAsText(file)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="default">Connected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Admin Configuration
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure API endpoints, scoring parameters, and system settings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveConfiguration} disabled={saveStatus === "saving"}>
                <Save className="h-4 w-4 mr-2" />
                {saveStatus === "saving" ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Save Status Alert */}
        {saveStatus === "saved" && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Configuration saved successfully!</AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>Failed to save configuration. Please check your settings.</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="scoring">Scoring Weights</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="regional">Regional Settings</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>

          {/* API Configuration */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      External API Configuration
                    </CardTitle>
                    <CardDescription>Configure connections to external facility data APIs</CardDescription>
                  </div>
                  <Button onClick={testAllConnections} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test All Connections
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Acetic Acid API */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Acetic Acid Facilities API</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(apiStatus.aceticAcid)}
                      {getStatusBadge(apiStatus.aceticAcid)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acetic-url">API Endpoint URL</Label>
                      <Input
                        id="acetic-url"
                        placeholder="https://api.example.com/acetic-acid-facilities"
                        value={config.apiEndpoints.aceticAcidUrl}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            apiEndpoints: { ...prev.apiEndpoints, aceticAcidUrl: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acetic-key">API Key</Label>
                      <Input
                        id="acetic-key"
                        type="password"
                        placeholder="Enter API key"
                        value={config.apiEndpoints.aceticAcidKey}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            apiEndpoints: { ...prev.apiEndpoints, aceticAcidKey: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={() => testApiConnection("aceticAcid")} variant="outline" size="sm">
                    Test Connection
                  </Button>
                </div>

                <Separator />

                {/* CO2 Emitters API */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">CO2 Emitter Facilities API</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(apiStatus.co2Emitters)}
                      {getStatusBadge(apiStatus.co2Emitters)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="co2-url">API Endpoint URL</Label>
                      <Input
                        id="co2-url"
                        placeholder="https://api.example.com/co2-emitters"
                        value={config.apiEndpoints.co2EmittersUrl}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            apiEndpoints: { ...prev.apiEndpoints, co2EmittersUrl: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="co2-key">API Key</Label>
                      <Input
                        id="co2-key"
                        type="password"
                        placeholder="Enter API key"
                        value={config.apiEndpoints.co2EmittersKey}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            apiEndpoints: { ...prev.apiEndpoints, co2EmittersKey: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={() => testApiConnection("co2Emitters")} variant="outline" size="sm">
                    Test Connection
                  </Button>
                </div>

                {apiStatus.lastChecked && (
                  <div className="text-sm text-muted-foreground">
                    Last checked: {apiStatus.lastChecked.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Weights */}
          <TabsContent value="scoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Scoring Weight Configuration
                </CardTitle>
                <CardDescription>
                  Adjust the relative importance of different scoring criteria. Weights must sum to 100%.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(config.scoringWeights).map(([key, value]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                        <Badge variant="outline">{value}%</Badge>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) =>
                          setConfig((prev) => ({
                            ...prev,
                            scoringWeights: { ...prev.scoringWeights, [key]: newValue },
                          }))
                        }
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Weight:</span>
                    <Badge
                      variant={
                        Math.abs(Object.values(config.scoringWeights).reduce((sum, w) => sum + w, 0) - 100) < 0.1
                          ? "default"
                          : "destructive"
                      }
                    >
                      {Object.values(config.scoringWeights).reduce((sum, w) => sum + w, 0)}%
                    </Badge>
                  </div>
                  {Math.abs(Object.values(config.scoringWeights).reduce((sum, w) => sum + w, 0) - 100) > 0.1 && (
                    <p className="text-sm text-destructive mt-2">Warning: Weights must sum to exactly 100%</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Weight Descriptions</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Governmental:</strong> Ease of obtaining permits and regulatory approval
                    </p>
                    <p>
                      <strong>Logistics:</strong> Transportation infrastructure and supply chain access
                    </p>
                    <p>
                      <strong>Policy Incentives:</strong> Tax breaks, subsidies, and government support
                    </p>
                    <p>
                      <strong>Community Readiness:</strong> Local acceptance and workforce availability
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure system behavior, caching, and default parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Refresh Data</Label>
                        <p className="text-sm text-muted-foreground">Automatically refresh facility data</p>
                      </div>
                      <Switch
                        checked={config.systemSettings.autoRefresh}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            systemSettings: { ...prev.systemSettings, autoRefresh: checked },
                          }))
                        }
                      />
                    </div>

                    {config.systemSettings.autoRefresh && (
                      <div className="space-y-2">
                        <Label>Refresh Interval (seconds)</Label>
                        <Input
                          type="number"
                          value={config.systemSettings.refreshInterval}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              systemSettings: {
                                ...prev.systemSettings,
                                refreshInterval: Number.parseInt(e.target.value) || 30,
                              },
                            }))
                          }
                          min={10}
                          max={3600}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Cache Timeout (seconds)</Label>
                      <Input
                        type="number"
                        value={config.systemSettings.cacheTimeout}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              cacheTimeout: Number.parseInt(e.target.value) || 300,
                            },
                          }))
                        }
                        min={60}
                        max={7200}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default Max Distance (km)</Label>
                      <Input
                        type="number"
                        value={config.systemSettings.maxDistance}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              maxDistance: Number.parseInt(e.target.value) || 50,
                            },
                          }))
                        }
                        min={1}
                        max={500}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Default Min Score</Label>
                      <Input
                        type="number"
                        value={config.systemSettings.minScore}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              minScore: Number.parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regional Settings */}
          <TabsContent value="regional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional Configuration
                </CardTitle>
                <CardDescription>Configure regional scoring parameters and regulatory zones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Region</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={config.regionalSettings.defaultRegion}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          regionalSettings: { ...prev.regionalSettings, defaultRegion: e.target.value },
                        }))
                      }
                    >
                      {Object.keys(REGULATORY_ZONES).map((region) => (
                        <option key={region} value={region}>
                          {region
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <Label>Regional Scoring Parameters</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(REGULATORY_ZONES).map(([region, scores]) => (
                        <Card key={region} className="p-4">
                          <h4 className="font-medium mb-3 capitalize">{region.split("-").join(" ")}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Governmental:</span>
                              <Badge variant="outline">{scores.governmental}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Logistics:</span>
                              <Badge variant="outline">{scores.logistics}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Policy:</span>
                              <Badge variant="outline">{scores.policy}</Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup & Restore */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore Configuration</CardTitle>
                <CardDescription>Export current settings or import a previously saved configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Export Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      Download your current configuration as a JSON file for backup or sharing
                    </p>
                    <Button onClick={exportConfiguration} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Configuration
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Import Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a previously exported configuration file to restore settings
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={importConfiguration}
                        className="hidden"
                        id="config-import"
                      />
                      <Button variant="outline" onClick={() => document.getElementById("config-import")?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Configuration
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Configuration Summary</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(config, null, 2)}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
