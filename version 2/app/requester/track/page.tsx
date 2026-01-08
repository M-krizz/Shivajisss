"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useRealtime } from "@/hooks/use-realtime"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustodyTimeline } from "@/components/tracking/custody-timeline"
import { SegmentProgress } from "@/components/tracking/segment-progress"
import { WarehouseMap } from "@/components/visualizations/warehouse-map"
import { MapPin, Package, Clock, Zap, DollarSign, AlertTriangle, ArrowLeft, Search, RefreshCw } from "lucide-react"
// Removed all mock data imports. All data will be fetched from backend API.
import Link from "next/link"
import { Suspense } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8001"

type BackendOrder = {
  id: string
  status: string
  request: {
    origin_district: string
    destination_district: string
    priority: string
    customer_name: string
    notes?: string
  }
  plan: {
    priority: string
    total_cost_inr: number
    total_eta_minutes: number
    total_distance_km: number
    checkpoints: string[]
    segments: Array<{
      from: { id: string; name: string; district_code: string; lat: number; lon: number }
      to: { id: string; name: string; district_code: string; lat: number; lon: number }
      vehicle_type: string
      driver: { id: string; name: string }
      distance_km: number
      eta_minutes: number
      cost_inr: number
    }>
  }
}

function TrackingContent() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("id") || ""
  
  const [orderId, setOrderId] = useState(initialOrderId)
  const [searchInput, setSearchInput] = useState(initialOrderId)
  const [backendOrder, setBackendOrder] = useState<BackendOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // All data will be fetched from backend. No mock order logic.
  const [custodyEvents, setCustodyEvents] = useState<any[]>([])
  const [failureEvents, setFailureEvents] = useState<any[]>([])

  const fetchOrder = useCallback(async (id: string) => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`)
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Order not found")
        }
        throw new Error("Failed to fetch order")
      }
      const data = await res.json()
      setBackendOrder(data)
      // Fetch custody events and failure events for this order
      const [custodyRes, failureRes] = await Promise.all([
        fetch(`${API_BASE}/orders/${id}/custody-events`),
        fetch(`${API_BASE}/orders/${id}/failures`)
      ])
      setCustodyEvents(custodyRes.ok ? await custodyRes.json() : [])
      setFailureEvents(failureRes.ok ? await failureRes.json() : [])
    } catch (err: any) {
      setError(err.message ?? "Failed to load order")
      setBackendOrder(null)
      setCustodyEvents([])
      setFailureEvents([])
    } finally {
      setLoading(false)
    }
  }, [])


  // WebSocket real-time updates
  const { status: wsStatus, lastEvent } = useRealtime(
    useCallback((event: { type: string; data: any; timestamp: string }) => {
      // Only refetch if the event is for this order
      if (!orderId) return
      if (
        (event.type === "order_status_changed" || event.type === "order_location_changed") &&
        event.data.order_id === orderId
      ) {
        fetchOrder(orderId)
      }
    }, [orderId, fetchOrder])
  )

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId])

  const handleSearch = () => {
    setOrderId(searchInput)
    fetchOrder(searchInput)
  }

  // Only use backend order
  const order = backendOrder

  if (!orderId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Track Order</h1>
          <p className="text-muted-foreground">Enter your order ID to track your parcel</p>
        </div>
        
        <Card className="border-border bg-card">
          <CardContent className="py-8">
            <div className="mx-auto max-w-md space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Order ID (e.g., ORD-001 or UUID)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Try: ORD-001, ORD-002, or paste a UUID from a created order
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Enter Order ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{error || "Order not found"}</p>
            <p className="mt-2 text-sm text-muted-foreground">Order ID: {orderId}</p>
            <Link href="/requester/orders">
              <Button className="mt-4">Back to Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    created: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    route_planning: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    in_transit: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  }

  // Normalize data for display - only backend orders
  const displayData = backendOrder ? {
    id: backendOrder.id,
    status: backendOrder.status,
    originName: backendOrder.plan.segments[0]?.from.name ?? backendOrder.request.origin_district,
    originCity: backendOrder.request.origin_district,
    destName: backendOrder.plan.segments[backendOrder.plan.segments.length - 1]?.to.name ?? backendOrder.request.destination_district,
    destCity: backendOrder.request.destination_district,
    parcelDesc: backendOrder.request.notes || "General Package",
    parcelWeight: "-",
    estimatedDelivery: null,
    preference: backendOrder.plan.priority === "time" ? "FAST" : "COST",
    estimatedCost: backendOrder.plan.total_cost_inr,
    segments: backendOrder.plan.segments,
    totalEta: backendOrder.plan.total_eta_minutes,
    totalDistance: backendOrder.plan.total_distance_km,
  } : null

  if (!displayData) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Order data not available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* WebSocket status indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={
          wsStatus === "connected" ? "text-emerald-600" : wsStatus === "connecting" ? "text-amber-500" : "text-destructive"
        }>
          ●
        </span>
        <span>Live updates: {wsStatus}</span>
      </div>
      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter Order ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/requester/orders"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">Track Order</h1>
          <p className="font-mono text-muted-foreground">{displayData.id}</p>
        </div>
        <Badge variant="outline" className={statusColors[displayData.status] || statusColors.pending}>
          {displayData.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Failure Alert - from backend */}
      {failureEvents.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delivery Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {failureEvents.map((failure) => (
              <div key={failure.id} className="space-y-2">
                <p className="font-medium">{failure.type.replace("_", " ")}</p>
                <p className="text-sm text-muted-foreground">{failure.description}</p>
                {failure.stashedAt && (
                  <div className="mt-2 rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Parcel safely stashed at:</p>
                    <p className="font-medium">
                      {failure.stashedAt.name}, {failure.stashedAt.city}
                    </p>
                  </div>
                )}
                <Badge
                  variant="outline"
                  className={failure.resolved ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" : ""}
                >
                  {failure.resolved ? "Resolved" : "Pending Recovery"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Route Map - for backend orders */}
      {backendOrder && (
        <WarehouseMap 
          warehouses={backendOrder.plan.segments.flatMap(s => [s.from, s.to]).filter((v, i, a) => a.findIndex(x => x.id === v.id) === i)}
          segments={backendOrder.plan.segments.map(s => ({
            from: s.from,
            to: s.to,
            vehicle_type: s.vehicle_type,
            cost_inr: s.cost_inr,
            eta_minutes: s.eta_minutes,
          }))}
          title="Route Map"
        />
      )}

      {/* Order Summary */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origin</p>
                  <p className="font-medium">{displayData.originName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{displayData.originCity}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                  <MapPin className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{displayData.destName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{displayData.destCity}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parcel</p>
                  <p className="font-medium">{displayData.parcelDesc}</p>
                  {displayData.parcelWeight !== "-" && (
                    <p className="text-sm text-muted-foreground">{displayData.parcelWeight}kg</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  {displayData.estimatedDelivery ? (
                    <p className="font-medium">{new Date(displayData.estimatedDelivery).toLocaleString()}</p>
                  ) : 'totalEta' in displayData ? (
                    <p className="font-medium">{Math.round(displayData.totalEta as number)} minutes</p>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Badge
              variant="secondary"
              className={
                displayData.preference === "FAST" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
              }
            >
              {displayData.preference === "FAST" ? <Zap className="mr-1 h-3 w-3" /> : <DollarSign className="mr-1 h-3 w-3" />}
              {displayData.preference} Priority
            </Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
              <p className="text-xl font-bold">Rs. {typeof displayData.estimatedCost === 'number' ? displayData.estimatedCost.toFixed(1) : displayData.estimatedCost}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Segments for backend orders */}
      {backendOrder && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Route Segments ({backendOrder.plan.segments.length} hops)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {backendOrder.plan.segments.map((seg, idx) => (
              <div key={`${seg.from.id}-${seg.to.id}-${idx}`} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">
                    Hop {idx + 1}: {seg.from.name} → {seg.to.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Driver: {seg.driver.name} · {seg.vehicle_type} · {seg.distance_km} km
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{seg.cost_inr}</p>
                  <p className="text-xs text-muted-foreground">{seg.eta_minutes} min</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Custody Timeline - for backend orders */}
      {custodyEvents.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Optionally, you can implement SegmentProgress for backend if segment data is compatible */}
          <CustodyTimeline events={custodyEvents} />
        </div>
      )}
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading tracking details...</div>}>
      <TrackingContent />
    </Suspense>
  )
}
