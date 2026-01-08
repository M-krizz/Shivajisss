import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Package, ArrowRight, Zap, DollarSign } from "lucide-react"
import type { Order } from "@/lib/types"
import Link from "next/link"

interface OrderCardProps {
  order: Order
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  route_planning: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_transit: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  route_planning: "Planning Route",
  in_transit: "In Transit",
  delivered: "Delivered",
  failed: "Failed",
}

export function OrderCard({ order }: OrderCardProps) {
  const completedSegments = order.segments.filter((s) => s.status === "completed").length
  const totalSegments = order.segments.length
  const progress = totalSegments > 0 ? (completedSegments / totalSegments) * 100 : 0

  return (
    <Card className="border-border bg-card transition-colors hover:border-primary/50">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{order.id}</span>
            <Badge variant="outline" className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{order.requesterName}</p>
        </div>
        <Badge
          variant="secondary"
          className={order.preference === "FAST" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"}
        >
          {order.preference === "FAST" ? <Zap className="mr-1 h-3 w-3" /> : <DollarSign className="mr-1 h-3 w-3" />}
          {order.preference}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-emerald-500" />
          <span className="truncate">{order.origin.city}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <MapPin className="h-4 w-4 text-destructive" />
          <span className="truncate">{order.destination.city}</span>
        </div>

        {/* Parcel Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{order.parcel.weight}kg</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Segment Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedSegments}/{totalSegments} segments
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Est. Cost: </span>
            <span className="font-semibold">Rs. {order.estimatedCost}</span>
          </div>
          <Link href={`/requester/track?id=${order.id}`}>
            <Button variant="outline" size="sm" className="bg-transparent">
              Track
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
