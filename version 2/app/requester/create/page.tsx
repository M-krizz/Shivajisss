"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Package, Zap, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react"
import type { DeliveryPreference } from "@/lib/types"
import { WarehouseMap } from "@/components/visualizations/warehouse-map"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000"

type District = { code: string; name: string; lat: number; lon: number }
type WarehouseOut = { id: string; name: string; district_code: string; lat: number; lon: number }
type DriverOut = { id: string; name: string; district_code: string; vehicle_type: string; warehouse_id: string }
type RouteSegment = {
  from: WarehouseOut
  to: WarehouseOut
  vehicle_type: string
  driver: DriverOut
  distance_km: number
  eta_minutes: number
  cost_inr: number
  handoff_checkpoint: string
}
type RoutePlan = {
  priority: "cost" | "time"
  fuel_index: number
  total_cost_inr: number
  total_eta_minutes: number
  total_distance_km: number
  checkpoints: string[]
  segments: RouteSegment[]
}
type RoutePlanOption = RoutePlan & { seed: number }
type Step = "details" | "route" | "confirm"

export default function CreateOrderPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "requester")) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  const [step, setStep] = useState<Step>("details")
  const [preference, setPreference] = useState<DeliveryPreference>("FAST")
  const [vehiclePref, setVehiclePref] = useState<string>("any")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [parcelDescription, setParcelDescription] = useState("")
  const [weight, setWeight] = useState("")
  const [districts, setDistricts] = useState<District[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseOut[]>([])
  const [routePlans, setRoutePlans] = useState<RoutePlanOption[]>([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCreated, setOrderCreated] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const priority = useMemo(() => (preference === "FAST" ? "time" : "cost"), [preference])
  const selectedPlan = useMemo(() => routePlans[selectedRouteIndex] ?? null, [routePlans, selectedRouteIndex])

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true)
        const res = await fetch(`${API_BASE}/catalog/districts`)
        if (!res.ok) throw new Error("Failed to load districts")
        const data: District[] = await res.json()
        setDistricts(data)
      } catch (err: any) {
        setError(err.message ?? "Unable to fetch districts")
      } finally {
        setLoadingDistricts(false)
      }
    }

    const fetchWarehouses = async () => {
      try {
        setLoadingWarehouses(true)
        const res = await fetch(`${API_BASE}/catalog/warehouses`)
        if (!res.ok) throw new Error("Failed to load warehouses")
        const data: WarehouseOut[] = await res.json()
        setWarehouses(data)
      } catch (err: any) {
        setError(err.message ?? "Unable to fetch warehouses")
      } finally {
        setLoadingWarehouses(false)
      }
    }

    fetchDistricts()
    fetchWarehouses()
  }, [])

  const handleFindRoutes = async () => {
    if (!origin || !destination || origin === destination) {
      setError("Select different origin and destination")
      return
    }
    setError(null)
    setLoadingQuote(true)
    try {
      const seeds = [2025, 2026, 2027]
      const plans = await Promise.all(
        seeds.map(async (seed) => {
          const res = await fetch(`${API_BASE}/quote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              origin_district: origin,
              destination_district: destination,
              package_type: "general",
              priority,
              preferred_vehicle: vehiclePref === "any" ? null : vehiclePref,
              max_hops: 7,
              seed,
            }),
          })
          if (!res.ok) {
            const msg = await res.text()
            throw new Error(msg || "Quote failed")
          }
          const data: RoutePlan = await res.json()
          return { ...data, seed }
        })
      )
      setRoutePlans(plans)
      setSelectedRouteIndex(0)
      setStep("route")
    } catch (err: any) {
      setError(err.message ?? "Unable to fetch route")
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!selectedPlan) return
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_district: origin,
          destination_district: destination,
          package_type: "general",
          priority: selectedPlan.priority,
          preferred_vehicle: vehiclePref === "any" ? null : vehiclePref,
          max_hops: 7,
          customer_name: "Demo Requester",
          notes: parcelDescription,
        }),
      })
      if (!res.ok) throw new Error("Order creation failed")
      const data = await res.json()
      setCreatedOrderId(data.id)
      setOrderCreated(true)
      setStep("confirm")
    } catch (err: any) {
      setError(err.message ?? "Order failed")
    }
  }

  if (orderCreated && createdOrderId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Order Created Successfully!</h2>
            <p className="mb-6 text-muted-foreground">Your order has been submitted and is now being processed.</p>
            <div className="rounded-lg bg-background p-4">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-lg font-bold">{createdOrderId}</p>
            </div>
            <div className="mt-6 flex gap-4">
              <Button variant="outline" onClick={() => window.location.reload()} className="bg-transparent">
                Create Another
              </Button>
              <Button onClick={() => (window.location.href = `/requester/track?id=${createdOrderId}`)}>
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Order</h1>
        <p className="text-muted-foreground">Set up a new parcel delivery with multi-hop routing (live backend)</p>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {(["details", "route", "confirm"] as Step[]).map((s, index) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : index < ["details", "route", "confirm"].indexOf(step)
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-sm ${step === s ? "font-medium" : "text-muted-foreground"}`}>
              {s === "details" ? "Details" : s === "route" ? "Route" : "Confirm"}
            </span>
            {index < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 1: Order Details */}
      {step === "details" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pickup & Delivery (Tamil Nadu districts)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Preferred Vehicle (optional)</Label>
                <Select value={vehiclePref} onValueChange={setVehiclePref}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="minivan">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin District</Label>
                <Select value={origin} onValueChange={setOrigin} disabled={loadingDistricts}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select origin"} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.code} value={d.code}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination District</Label>
                <Select value={destination} onValueChange={setDestination} disabled={loadingDistricts}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select destination"} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts
                      .filter((d) => d.code !== origin)
                      .map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          {d.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parcel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What are you shipping?"
                  value={parcelDescription}
                  onChange={(e) => setParcelDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="0.0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (cm)</Label>
                  <Input id="dimensions" placeholder="L x W x H" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Delivery Preference</CardTitle>
              <CardDescription>Choose your priority for this delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preference}
                onValueChange={(v) => setPreference(v as DeliveryPreference)}
                className="grid gap-4 md:grid-cols-2"
              >
                <Label
                  htmlFor="fast"
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:border-primary ${
                    preference === "FAST" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="FAST" id="fast" className="sr-only" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Fast Delivery</p>
                    <p className="text-sm text-muted-foreground">Prioritize speed with higher-cost vehicles</p>
                  </div>
                </Label>

                <Label
                  htmlFor="cost"
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:border-primary ${
                    preference === "COST" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="COST" id="cost" className="sr-only" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Cost Effective</p>
                    <p className="text-sm text-muted-foreground">Use cheaper vehicles and extra hops</p>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Route Options */}
      {step === "route" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Planned Routes (live)</h2>
              <p className="text-sm text-muted-foreground">Choose a route based on cost/time & hops</p>
            </div>
            <Button variant="outline" onClick={() => setStep("details")}>
              Edit Details
            </Button>
          </div>

          {routePlans.length === 0 && (
            <Card className="border-dashed border-border bg-muted/30">
              <CardContent className="py-10 text-center text-muted-foreground">Request a quote to see hops.</CardContent>
            </Card>
          )}

          {routePlans.length > 0 && (
            <div className="grid gap-3 md:grid-cols-3">
              {routePlans.map((plan, idx) => (
                <Card
                  key={plan.seed}
                  className={`cursor-pointer border ${idx === selectedRouteIndex ? "border-primary" : "border-border"}`}
                  onClick={() => setSelectedRouteIndex(idx)}
                >
                  <CardContent className="space-y-2 py-4">
                    <p className="text-sm font-semibold">Route {idx + 1}</p>
                    <p className="text-xs text-muted-foreground">Seed {plan.seed}</p>
                    <p className="text-sm">₹{plan.total_cost_inr.toFixed(1)} · {plan.total_eta_minutes.toFixed(1)} min</p>
                    <p className="text-xs text-muted-foreground">{plan.segments.length} hops · {plan.total_distance_km.toFixed(1)} km</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedPlan && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Stat label="Total Cost" value={`₹${selectedPlan.total_cost_inr.toFixed(1)}`} />
                <Stat label="Total ETA" value={`${selectedPlan.total_eta_minutes.toFixed(1)} min`} />
                <Stat label="Distance" value={`${selectedPlan.total_distance_km.toFixed(1)} km`} />
              </div>

              <WarehouseMap
                warehouses={warehouses}
                segments={selectedPlan.segments.map((seg) => ({
                  from: seg.from,
                  to: seg.to,
                  vehicle_type: seg.vehicle_type,
                  cost_inr: seg.cost_inr,
                  eta_minutes: seg.eta_minutes,
                }))}
                title="Warehouses & planned hops"
              />

              <div className="space-y-3">
                {selectedPlan.segments.map((seg, idx) => (
                  <Card key={`${seg.from.id}-${seg.to.id}-${idx}`} className="border-border">
                    <CardContent className="space-y-2 py-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          Hop {idx + 1}: {seg.from.name} → {seg.to.name}
                        </p>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{seg.vehicle_type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Driver: {seg.driver.name} · {seg.distance_km} km · {seg.eta_minutes} min · ₹{seg.cost_inr}
                      </p>
                      <p className="text-xs text-muted-foreground">Handoff at: {seg.handoff_checkpoint}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep("confirm")} disabled={!selectedPlan}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === "confirm" && selectedPlan && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Route Summary</CardTitle>
              <CardDescription>Review the multi-hop journey before confirming</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPlan.segments.map((seg, idx) => (
                <div key={`${seg.from.id}-${seg.to.id}-${idx}`} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      Hop {idx + 1}: {seg.from.name} → {seg.to.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {seg.distance_km} km · {seg.eta_minutes} min · {seg.vehicle_type}
                    </p>
                  </div>
                  <div className="text-sm font-semibold">₹{seg.cost_inr}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Confirm & Push</CardTitle>
              <CardDescription>Finalize the order in the orchestration backend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Total Hops</span>
                <span className="font-medium">{selectedPlan.segments.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Est. Cost</span>
                <span className="font-medium">₹{selectedPlan.total_cost_inr.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Est. Duration</span>
                <span className="font-medium">{selectedPlan.total_eta_minutes.toFixed(1)} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Preference</span>
                <span className="font-medium">{selectedPlan.priority}</span>
              </div>
              <Button className="w-full" onClick={handleConfirmOrder} disabled={loadingQuote}>
                Confirm Order
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      {step === "details" && (
        <div className="flex justify-end">
          <Button size="lg" onClick={handleFindRoutes} disabled={!origin || !destination || !parcelDescription || !weight || loadingQuote}>
            {loadingQuote ? "Planning..." : "Find Routes"}
          </Button>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border">
      <CardContent className="py-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
