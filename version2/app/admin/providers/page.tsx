"use client"

import { useEffect, useMemo, useState } from "react"
import { ProvidersTable } from "@/components/admin/providers-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Star } from "lucide-react"
import type { Provider } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000"

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/catalog/drivers`)
        if (!res.ok) throw new Error("Failed to load drivers")
        const drivers = await res.json()
        const mapped: Provider[] = drivers.map((d: any) => ({
          id: d.id,
          name: d.name,
          rating: 4.5 + Math.random() * 0.5,
          completedSegments: Math.floor(100 + Math.random() * 200),
          activeSegments: Math.floor(Math.random() * 3),
          vehicleType: d.vehicle_type === "auto" ? "car" : d.vehicle_type === "minivan" ? "van" : d.vehicle_type,
          availableCapacity: d.vehicle_type === "truck" ? 500 : d.vehicle_type === "van" ? 150 : 25,
          currentLocation: null,
          isOnline: Math.random() > 0.3,
        }))
        setProviders(mapped)
      } catch (e: any) {
        setError(e.message ?? "Unable to load drivers")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onlineProviders = useMemo(() => providers.filter((p) => p.isOnline), [providers])
  const offlineProviders = useMemo(() => providers.filter((p) => !p.isOnline), [providers])
  const avgRating = providers.length
    ? providers.reduce((sum, p) => sum + p.rating, 0) / providers.length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Providers</h1>
        <p className="text-muted-foreground">Manage delivery providers and their performance</p>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? "…" : providers.length}</p>
              <p className="text-sm text-muted-foreground">Total Providers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <UserCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? "…" : onlineProviders.length}</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <UserX className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? "…" : offlineProviders.length}</p>
              <p className="text-sm text-muted-foreground">Offline</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? "…" : avgRating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>All Providers (drivers from backend)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading drivers…</p> : <ProvidersTable providers={providers} />}
        </CardContent>
      </Card>
    </div>
  )
}
