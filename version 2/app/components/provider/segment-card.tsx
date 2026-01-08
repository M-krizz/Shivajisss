"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, ArrowRight, DollarSign } from "lucide-react"
import type { Segment } from "@/lib/types"

interface SegmentCardProps {
  segment: Segment
  onAccept?: () => void
  onComplete?: () => void
  showActions?: boolean
  isActive?: boolean
}

export function SegmentCard({ segment, onAccept, onComplete, showActions = true, isActive = false }: SegmentCardProps) {
  const hours = Math.floor(segment.estimatedDuration / 60)
  const minutes = segment.estimatedDuration % 60

  return (
    <Card
      className={`border-border bg-card transition-colors ${isActive ? "border-amber-500/50 bg-amber-500/5" : "hover:border-primary/50"}`}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-muted-foreground">{segment.orderId}</span>
          <span className="text-sm text-muted-foreground">Segment {segment.sequence}</span>
        </div>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
          <DollarSign className="mr-1 h-3 w-3" />
          Rs. {segment.price}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route */}
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                <MapPin className="h-3 w-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{segment.from.name}</p>
                <p className="text-xs text-muted-foreground">{segment.from.city}</p>
              </div>
            </div>
            <div className="ml-3 h-6 w-0.5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20">
                <MapPin className="h-3 w-3 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium">{segment.to.name}</p>
                <p className="text-xs text-muted-foreground">{segment.to.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ArrowRight className="h-4 w-4" />
            <span>{segment.distance} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {hours}h {minutes > 0 ? `${minutes}m` : ""}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 border-t border-border pt-3">
            {segment.status === "pending" && onAccept && (
              <Button className="w-full" onClick={onAccept}>
                Accept Segment
              </Button>
            )}
            {segment.status === "in_progress" && onComplete && (
              <Button className="w-full" variant="default" onClick={onComplete}>
                Complete & Handoff
              </Button>
            )}
            {segment.status === "assigned" && (
              <Button className="w-full bg-transparent" variant="outline" disabled>
                Starting Soon
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
