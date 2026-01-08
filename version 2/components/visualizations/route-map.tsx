"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Truck, Package, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import type { Segment, Checkpoint } from "@/lib/types"

interface RouteMapProps {
  segments: Segment[]
  origin: Checkpoint
  destination: Checkpoint
  title?: string
}

const statusColors: Record<string, string> = {
  pending: "bg-muted border-border",
  assigned: "bg-blue-500/20 border-blue-500",
  in_progress: "bg-amber-500/20 border-amber-500",
  completed: "bg-emerald-500/20 border-emerald-500",
  failed: "bg-destructive/20 border-destructive",
}

const lineColors: Record<string, string> = {
  pending: "bg-muted",
  assigned: "bg-blue-500",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  failed: "bg-destructive",
}

export function RouteMap({ segments, origin, destination, title = "Route Visualization" }: RouteMapProps) {
  // Get all unique checkpoints in order
  const checkpoints: Checkpoint[] = [origin]
  segments.forEach((seg) => {
    if (!checkpoints.find((c) => c.id === seg.to.id)) {
      checkpoints.push(seg.to)
    }
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Horizontal route visualization */}
        <div className="relative">
          {/* Connection lines */}
          <div className="absolute left-0 right-0 top-6 flex items-center px-4">
            {segments.map((segment, index) => (
              <div key={segment.id} className="flex-1 px-2">
                <div className={`h-1 rounded-full ${lineColors[segment.status]}`} />
              </div>
            ))}
          </div>

          {/* Checkpoints */}
          <div className="relative flex items-start justify-between">
            {checkpoints.map((checkpoint, index) => {
              const segment = segments[index]
              const isOrigin = index === 0
              const isDestination = index === checkpoints.length - 1
              const status = isOrigin ? "completed" : segment ? segment.status : "pending"

              return (
                <div key={checkpoint.id} className="relative flex flex-col items-center" style={{ flex: "0 0 auto" }}>
                  {/* Status indicator */}
                  <div
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${statusColors[status]}`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : status === "in_progress" ? (
                      <Truck className="h-6 w-6 text-amber-500" />
                    ) : status === "failed" ? (
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    ) : isOrigin ? (
                      <Package className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Checkpoint info */}
                  <div className="mt-3 text-center">
                    <p className="text-xs font-medium">{checkpoint.city}</p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {checkpoint.type.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Segment info (below the line) */}
                  {segment && index < checkpoints.length - 1 && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                      <p className="text-xs text-muted-foreground">{segment.distance}km</p>
                      <p className="text-xs font-medium text-foreground">Rs. {segment.price}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span>Failed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
