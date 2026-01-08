"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Zap, DollarSign, ArrowRight } from "lucide-react"
import type { RouteOption } from "@/lib/types"

interface RouteOptionCardProps {
  option: RouteOption
  selected?: boolean
  onSelect: () => void
}

export function RouteOptionCard({ option, selected, onSelect }: RouteOptionCardProps) {
  const hours = Math.floor(option.totalDuration / 60)
  const minutes = option.totalDuration % 60

  return (
    <Card
      className={`cursor-pointer border-2 transition-all ${
        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Badge
          variant="secondary"
          className={
            option.recommendation === "FAST" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
          }
        >
          {option.recommendation === "FAST" ? (
            <Zap className="mr-1 h-3 w-3" />
          ) : (
            <DollarSign className="mr-1 h-3 w-3" />
          )}
          {option.recommendation === "FAST" ? "Fastest Route" : "Cheapest Route"}
        </Badge>
        {selected && (
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Selected
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route visualization */}
        <div className="flex flex-wrap items-center gap-1">
          {option.segments.map((segment, index) => (
            <div key={segment.id} className="flex items-center">
              <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{segment.from.city}</span>
              </div>
              {index < option.segments.length - 1 && <ArrowRight className="mx-1 h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
          <div className="flex items-center">
            <ArrowRight className="mx-1 h-3 w-3 text-muted-foreground" />
            <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
              <MapPin className="h-3 w-3" />
              <span>{option.segments[option.segments.length - 1]?.to.city}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{option.hops}</p>
            <p className="text-xs text-muted-foreground">Hops</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {hours}
              <span className="text-sm font-normal">h</span>
              {minutes > 0 && (
                <>
                  {minutes}
                  <span className="text-sm font-normal">m</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
          <div>
            <p className="text-2xl font-bold">Rs. {option.estimatedCost}</p>
            <p className="text-xs text-muted-foreground">Cost</p>
          </div>
        </div>

        {/* Distance */}
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">Total Distance</span>
          <span className="font-medium">{option.totalDistance} km</span>
        </div>

        <Button className="w-full" variant={selected ? "default" : "outline"} onClick={onSelect}>
          {selected ? "Selected" : "Select Route"}
        </Button>
      </CardContent>
    </Card>
  )
}
