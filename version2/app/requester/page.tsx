"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { StatCard } from "@/components/dashboard/stat-card"
import { OrderCard } from "@/components/orders/order-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Truck, Clock, AlertTriangle, Plus } from "lucide-react"
import { orders } from "@/lib/mock-data"
import Link from "next/link"

export default function RequesterDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && (!user || user.role !== "requester")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Filter orders for this requester
  const myOrders = orders.filter((o) => o.requesterId === "req-1")
  const activeOrders = myOrders.filter((o) => o.status === "in_transit" || o.status === "route_planning")
  const pendingOrders = myOrders.filter((o) => o.status === "pending")
  const failedOrders = myOrders.filter((o) => o.status === "failed")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, TechCorp India</p>
        </div>
        <Link href="/requester/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Orders" value={activeOrders.length} icon={Truck} variant="default" />
        <StatCard title="Pending" value={pendingOrders.length} icon={Clock} variant="warning" />
        <StatCard title="Total Orders" value={myOrders.length} icon={Package} variant="success" />
        <StatCard
          title="Failed"
          value={failedOrders.length}
          icon={AlertTriangle}
          variant={failedOrders.length > 0 ? "danger" : "default"}
        />
      </div>

      {/* Recent Orders */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/requester/orders">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myOrders.slice(0, 3).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Failed Orders Alert */}
      {failedOrders.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {failedOrders.length} order(s) have encountered issues and require your attention.
            </p>
            <div className="space-y-2">
              {failedOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg bg-background p-3">
                  <div>
                    <span className="font-mono text-sm">{order.id}</span>
                    <p className="text-xs text-muted-foreground">
                      {order.origin.city} → {order.destination.city}
                    </p>
                  </div>
                  <Link href={`/requester/track?id=${order.id}`}>
                    <Button size="sm" variant="destructive">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
