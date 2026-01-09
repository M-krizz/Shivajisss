"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, MapPin, Clock, RefreshCw } from "lucide-react"
import type { FailureEvent } from "@/lib/types"

interface FailureCardProps {
  failure: FailureEvent
  onResolve?: () => void
}

const typeLabels: Record<string, string> = {
  provider_unavailable: "Provider Unavailable",
  vehicle_breakdown: "Vehicle Breakdown",
  weather: "Weather Delay",
  checkpoint_closed: "Checkpoint Closed",
  other: "Other Issue",
}

export function FailureCard({ failure, onResolve }: FailureCardProps) {
  return (
    <Card className={`border-border ${failure.resolved ? "bg-card" : "border-destructive/50 bg-destructive/5"}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${failure.resolved ? "text-muted-foreground" : "text-destructive"}`} />
          <div>
            <span className="font-mono text-sm text-muted-foreground">{failure.orderId}</span>
            <p className="text-sm font-medium">{typeLabels[failure.type]}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={
            failure.resolved ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" : "border-destructive/20"
          }
        >
          {failure.resolved ? "Resolved" : "Active"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{failure.description}</p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(failure.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {failure.stashedAt && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Parcel Stashed At</p>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{failure.stashedAt.name}</span>
              <span className="text-muted-foreground">{failure.stashedAt.city}</span>
            </div>
          </div>
        )}

        {failure.resolution && (
          <div className="rounded-lg bg-emerald-500/10 p-3">
            <p className="text-xs text-emerald-500">Resolution</p>
            <p className="mt-1 text-sm">{failure.resolution}</p>
          </div>
        )}

        {!failure.resolved && onResolve && (
          <Button className="w-full" onClick={onResolve}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Initiate Recovery
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
