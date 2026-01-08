"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Checkpoint } from "@/lib/types"

interface NetworkGraphProps {
  checkpoints: Checkpoint[]
  activeRoutes?: Array<{ from: string; to: string; status: string }>
}

export function NetworkGraph({ checkpoints, activeRoutes = [] }: NetworkGraphProps) {
  // Group checkpoints by approximate region (using lat)
  const northern = checkpoints.filter((c) => c.lat > 20)
  const southern = checkpoints.filter((c) => c.lat <= 20)

  const getCheckpointColor = (cp: Checkpoint) => {
    if (!cp.available) return "bg-muted border-muted-foreground"
    const hasActiveRoute = activeRoutes.some((r) => r.from === cp.id || r.to === cp.id)
    if (hasActiveRoute) return "bg-primary/20 border-primary"
    return "bg-card border-border"
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Checkpoint Network</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Northern Region */}
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Northern Region</p>
            <div className="flex flex-wrap gap-3">
              {northern.map((cp) => (
                <div
                  key={cp.id}
                  className={`rounded-lg border-2 p-3 transition-all hover:scale-105 ${getCheckpointColor(cp)}`}
                >
                  <p className="text-sm font-medium">{cp.city}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {cp.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{cp.capacity} cap</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Network Connected</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Southern Region */}
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Southern Region</p>
            <div className="flex flex-wrap gap-3">
              {southern.map((cp) => (
                <div
                  key={cp.id}
                  className={`rounded-lg border-2 p-3 transition-all hover:scale-105 ${getCheckpointColor(cp)}`}
                >
                  <p className="text-sm font-medium">{cp.city}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {cp.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{cp.capacity} cap</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Routes */}
        {activeRoutes.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Active Routes</p>
            <div className="flex flex-wrap gap-2">
              {activeRoutes.map((route, i) => {
                const fromCp = checkpoints.find((c) => c.id === route.from)
                const toCp = checkpoints.find((c) => c.id === route.to)
                return (
                  <Badge key={i} variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    {fromCp?.city} → {toCp?.city}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
