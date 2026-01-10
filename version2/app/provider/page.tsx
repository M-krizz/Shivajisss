"use client"

import { useEffect, useState } from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { SegmentCard } from "@/components/provider/segment-card"
import { CustodyHandoffDialog } from "@/components/provider/custody-handoff-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, DollarSign, Star, Route, CheckCircle2, MapPin, User, Loader2, WifiOff, AlertCircle } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { orders, availableSegments } from "@/lib/mock-data"
import { getDrivers, type Driver } from "@/lib/api"
import type { Segment } from "@/lib/types"

export default function ProviderDashboard() {
  const { user, loading: authLoading, isConnected, checkConnection } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "provider")) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])
  
  const [isOnline, setIsOnline] = useState(true)
  const [handoffDialogOpen, setHandoffDialogOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived state from selected driver
  const selectedDriver = drivers.find(d => d.id === selectedDriverId)
  const providerName = selectedDriver?.name ?? "Provider"
  const vehicleType = selectedDriver?.vehicle_type === "minivan" ? "van" : 
                      selectedDriver?.vehicle_type === "auto" ? "car" : 
                      selectedDriver?.vehicle_type ?? "bike"
  const capacity = vehicleType === "truck" ? 500 : vehicleType === "van" ? 150 : 25
  const driverIndex = drivers.findIndex(d => d.id === selectedDriverId)
  const rating = 4.2 + (driverIndex % 10) * 0.05
  const deliveries = 100 + driverIndex * 3

  useEffect(() => {
    const load = async () => {
      setError(null)
      try {
        // Check connection first
        await checkConnection()
        const data = await getDrivers()
        setDrivers(data)
        if (data.length > 0) {
          setSelectedDriverId(data[0].id)
        }
      } catch (e: any) {
        console.error(e)
        setError(e.message || "Failed to load provider data. Make sure the backend is running.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Get active segments for this provider - now uses selected driver ID
  const activeSegments = orders
    .flatMap((o) => o.segments)
    .filter((s) => s.status === "in_progress")

  // Completed today (mock)
  const completedToday = 3
  const earningsToday = 580

  const handleCompleteSegment = (segment: Segment) => {
    setSelectedSegment(segment)
    setHandoffDialogOpen(true)
  }

  const handleConfirmHandoff = () => {
    setHandoffDialogOpen(false)
    setSelectedSegment(null)
    // In real app, this would update the segment status
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading provider data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2">
            <span>{error}</span>
            {!isConnected && (
              <span className="flex items-center gap-1 text-sm">
                <WifiOff className="h-3 w-3" />
                Backend server is offline. Start it on port 8000.
              </span>
            )}
          </AlertDescription>
        </Alert>
        <div className="mt-4 p-4 rounded-lg bg-muted text-sm">
          <p className="font-medium mb-2">To start the backend:</p>
          <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
            cd backend{"\n"}
            uvicorn app.main:app --reload --port 8000
          </pre>
        </div>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Provider Selector */}
      <Card className="border-border bg-card">
        <CardContent className="flex items-center gap-4 p-4">
          <User className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <Label htmlFor="provider-select" className="text-sm text-muted-foreground">Select Provider Profile</Label>
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger id="provider-select" className="mt-1">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} - {driver.vehicle_type} ({driver.district_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Header with Online Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {providerName}</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-card p-3">
          <Label htmlFor="online-toggle" className="text-sm">
            {isOnline ? "Online" : "Offline"}
          </Label>
          <Switch id="online-toggle" checked={isOnline} onCheckedChange={setIsOnline} />
          <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? "bg-emerald-500" : ""}>
            {isOnline ? "Accepting Jobs" : "Not Available"}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Segments"
          value={activeSegments.length}
          icon={Truck}
          variant={activeSegments.length > 0 ? "warning" : "default"}
        />
        <StatCard title="Completed Today" value={completedToday} icon={CheckCircle2} variant="success" />
        <StatCard
          title="Today's Earnings"
          value={`Rs. ${earningsToday}`}
          icon={DollarSign}
          variant="default"
          subtitle="3 segments"
        />
        <StatCard
          title="Rating"
          value={rating.toFixed(1)}
          icon={Star}
          variant="success"
          subtitle={`${deliveries} deliveries`}
        />
      </div>

      {/* Active Deliveries */}
      {activeSegments.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Truck className="h-5 w-5" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {activeSegments.map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  isActive
                  onComplete={() => handleCompleteSegment(segment)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Switcher + Available Segments */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Available Segments Nearby
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isOnline ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableSegments.slice(0, 3).map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  onAccept={() => {
                    // In real app, this would accept the segment
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Go online to see available segments</p>
              <Button className="mt-4" onClick={() => setIsOnline(true)}>
                Go Online
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vehicle Type</span>
              <Badge variant="outline" className="capitalize">
                {vehicleType}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available Capacity</span>
              <span className="font-medium">{capacity} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Location</span>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Mumbai</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Deliveries</span>
              <span className="font-medium">{deliveries}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">This Month</span>
              <span className="font-medium">42</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">On-Time Rate</span>
              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                96%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Handoff Dialog */}
      <CustodyHandoffDialog
        open={handoffDialogOpen}
        onOpenChange={setHandoffDialogOpen}
        segment={selectedSegment}
        onConfirm={handleConfirmHandoff}
      />
    </div>
  )
}
