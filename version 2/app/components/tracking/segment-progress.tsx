import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Truck, Clock, User, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import type { Segment } from "@/lib/types"

interface SegmentProgressProps {
  segments: Segment[]
}

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Circle,
  assigned: Clock,
  in_progress: Truck,
  completed: CheckCircle2,
  failed: AlertCircle,
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  assigned: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-amber-500/10 text-amber-500",
  completed: "bg-emerald-500/10 text-emerald-500",
  failed: "bg-destructive/10 text-destructive",
}

export function SegmentProgress({ segments }: SegmentProgressProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5" />
          Route Segments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {segments.map((segment, index) => {
            const StatusIcon = statusIcons[segment.status]

            return (
              <div key={segment.id} className="relative">
                {/* Connector line */}
                {index < segments.length - 1 && (
                  <div className="absolute left-[18px] top-12 h-[calc(100%-24px)] w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Segment number */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                      segment.status === "completed"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : segment.status === "in_progress"
                          ? "border-amber-500 bg-amber-500/10"
                          : segment.status === "failed"
                            ? "border-destructive bg-destructive/10"
                            : "border-border bg-muted"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        segment.status === "completed"
                          ? "text-emerald-500"
                          : segment.status === "in_progress"
                            ? "text-amber-500"
                            : segment.status === "failed"
                              ? "text-destructive"
                              : "text-muted-foreground"
                      }`}
                    >
                      {segment.sequence}
                    </span>
                  </div>

                  {/* Segment details */}
                  <div className="flex-1 rounded-lg bg-muted/30 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium">{segment.from.name}</span>
                        <span className="text-muted-foreground">→</span>
                        <MapPin className="h-4 w-4 text-destructive" />
                        <span className="font-medium">{segment.to.name}</span>
                      </div>
                      <Badge variant="outline" className={statusColors[segment.status]}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {segment.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>{segment.distance} km</span>
                      <span>~{Math.round(segment.estimatedDuration / 60)}h</span>
                      <span className="font-medium text-foreground">Rs. {segment.price}</span>
                    </div>

                    {segment.providerName && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-primary" />
                        <span>{segment.providerName}</span>
                        {segment.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            Completed: {new Date(segment.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
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
