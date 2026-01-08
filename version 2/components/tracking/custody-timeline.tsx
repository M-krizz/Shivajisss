import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Package, Truck, MapPin, AlertTriangle, RotateCcw } from "lucide-react"
import type { CustodyEvent } from "@/lib/types"

interface CustodyTimelineProps {
  events: CustodyEvent[]
}

const eventIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pickup: Package,
  handoff: Truck,
  stash: MapPin,
  recovery: RotateCcw,
  delivery: CheckCircle2,
}

const eventColors: Record<string, string> = {
  pickup: "bg-blue-500",
  handoff: "bg-primary",
  stash: "bg-amber-500",
  recovery: "bg-emerald-500",
  delivery: "bg-emerald-500",
}

const eventLabels: Record<string, string> = {
  pickup: "Pickup",
  handoff: "Custody Transfer",
  stash: "Stashed",
  recovery: "Recovered",
  delivery: "Delivered",
}

export function CustodyTimeline({ events }: CustodyTimelineProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Custody Chain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {events.map((event, index) => {
            const Icon = eventIcons[event.type] || Circle
            const isLast = index === events.length - 1
            const isStash = event.type === "stash"

            return (
              <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Timeline line */}
                {!isLast && (
                  <div
                    className={`absolute left-4 top-8 h-full w-0.5 -translate-x-1/2 ${
                      isStash ? "bg-amber-500/50" : "bg-border"
                    }`}
                  />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${eventColors[event.type]}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{eventLabels[event.type]}</span>
                      {event.verified && (
                        <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                          Verified
                        </Badge>
                      )}
                      {isStash && (
                        <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-500">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Failure Recovery
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {event.fromEntityName ? `${event.fromEntityName} → ` : ""}
                      </span>
                      <span className="font-medium">{event.toEntityName}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {event.checkpoint.name}, {event.checkpoint.city}
                      </span>
                    </div>
                    {event.notes && <p className="mt-2 text-xs text-muted-foreground">{event.notes}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
