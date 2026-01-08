"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { FailureCard } from "@/components/admin/failure-card"
import { DeliveryFlowChart } from "@/components/visualizations/delivery-flow-chart"
import { SystemFlowDiagram } from "@/components/visualizations/system-flow-diagram"
import { NetworkGraph } from "@/components/visualizations/network-graph"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, Users, AlertTriangle, DollarSign, Clock, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { orders, failureEvents, systemStats, checkpoints } from "@/lib/mock-data"
import Link from "next/link"
import type { Provider } from "@/lib/types"
import { useRealtime, type RealtimeEvent } from "@/hooks/use-realtime"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000"

export default function AdminDashboard() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(true)
  const [driverError, setDriverError] = useState<string | null>(null)
  const [backendOrders, setBackendOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`)
      if (!res.ok) throw new Error("Failed to load orders")
      const data = await res.json()
      setBackendOrders(data)
      setLastUpdate(new Date())
    } catch (err) {
      // keep mock stats if live fetch fails
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    if (event.type === "order_created" || event.type === "order_status_changed") {
      // Refresh orders when we get a new order event
      loadOrders()
    }
  }, [loadOrders])

  const { status: wsStatus, reconnect } = useRealtime(handleRealtimeEvent)

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const res = await fetch(`${API_BASE}/catalog/drivers`)
        if (!res.ok) throw new Error("Failed to load drivers")
        const drivers = await res.json()
        const mapped: Provider[] = drivers.map((d: any, idx: number) => ({
          id: d.id,
          name: d.name,
          rating: 4.2 + (idx % 10) * 0.05,
          completedSegments: 80 + (idx % 50),
          activeSegments: (idx % 3),
          vehicleType: d.vehicle_type === "auto" ? "car" : d.vehicle_type === "minivan" ? "van" : d.vehicle_type,
          availableCapacity: d.vehicle_type === "truck" ? 500 : d.vehicle_type === "van" ? 150 : 25,
          currentLocation: null,
          isOnline: (idx % 4) !== 0,
        }))
        setProviders(mapped)
      } catch (err: any) {
        setDriverError(err.message ?? "Unable to load drivers")
      } finally {
        setLoadingDrivers(false)
      }
    }
    loadDrivers()
    loadOrders()

    // Polling fallback every 10 seconds
    const pollInterval = setInterval(loadOrders, 10000)
    return () => clearInterval(pollInterval)
  }, [loadOrders])

  const activeFailures = failureEvents.filter((f) => !f.resolved)
  const onlineProviders = useMemo(() => providers.filter((p) => p.isOnline), [providers])

  // Get active routes for network graph
  const activeRoutes = orders
    .filter((o) => o.status === "in_transit")
    .flatMap((o) =>
      o.segments
        .filter((s) => s.status === "in_progress")
        .map((s) => ({ from: s.from.id, to: s.to.id, status: s.status })),
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Overview</h1>
          <p className="text-muted-foreground">Monitor and manage the logistics platform</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
            {wsStatus === "connected" ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">Live</span>
              </>
            ) : wsStatus === "connecting" ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                <span className="text-amber-500">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Offline</span>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={loadOrders} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      {driverError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {driverError}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Active Orders" value={systemStats.activeOrders} icon={Package} variant="default" />
        <StatCard title="Pending" value={systemStats.pendingOrders} icon={Clock} variant="warning" />
        <StatCard title="Delivered Today" value={systemStats.completedToday} icon={Package} variant="success" />
        <StatCard
          title="Failures Today"
          value={systemStats.failuresToday}
          icon={AlertTriangle}
          variant={systemStats.failuresToday > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Live Orders"
          value={loadingOrders ? "…" : backendOrders.length}
          icon={Truck}
          variant="default"
        />
        <StatCard
          title="Online Providers"
          value={loadingDrivers ? "…" : `${onlineProviders.length}/${providers.length}`}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Revenue Today"
          value={`Rs. ${systemStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          variant="success"
        />
      </div>

      <SystemFlowDiagram />

      {/* Active Failures Alert */}
      {activeFailures.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Active Failures ({activeFailures.length})
            </CardTitle>
            <Link href="/admin/failures">
              <Button variant="destructive" size="sm">
                Manage All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {activeFailures.slice(0, 2).map((failure) => (
                <FailureCard key={failure.id} failure={failure} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <DeliveryFlowChart />
        <NetworkGraph checkpoints={checkpoints} activeRoutes={activeRoutes} />
      </div>

      {/* Recent Orders (live) */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Recent Orders (live)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <p className="text-sm text-muted-foreground">Loading orders…</p>
          ) : backendOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No live orders yet.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {backendOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded border border-border p-3">
                  <div>
                    <p className="font-mono text-xs">{o.id}</p>
                    <p className="text-muted-foreground capitalize">
                      {o.request.origin_district} → {o.request.destination_district}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{o.plan.total_cost_inr}</p>
                    <p className="text-muted-foreground">{o.plan.segments.length} hops</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg. Delivery Time</span>
              <span className="font-medium">{systemStats.avgDeliveryTime}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">On-Time Rate</span>
              <span className="font-medium text-emerald-500">94.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-medium text-emerald-500">97.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Checkpoints</span>
              <span className="font-medium">9/10</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Provider Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Providers</span>
              <span className="font-medium">{loadingDrivers ? "…" : providers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Currently Online</span>
              <span className="font-medium text-emerald-500">{loadingDrivers ? "…" : onlineProviders.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg. Rating</span>
              <span className="font-medium">
                {providers.length
                  ? (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1)
                  : loadingDrivers ? "…" : "0.0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Deliveries</span>
              <span className="font-medium">
                {loadingDrivers ? "…" : providers.reduce((sum, p) => sum + p.completedSegments, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
