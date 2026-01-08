"use client"

import { useState } from "react"
import { SegmentCard } from "@/components/provider/segment-card"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin } from "lucide-react"
import { availableSegments } from "@/lib/mock-data"

export default function AvailableSegmentsPage() {
  const [searchCity, setSearchCity] = useState("")
  const [sortBy, setSortBy] = useState("price")

  const filteredSegments = availableSegments
    .filter((s) => {
      if (!searchCity) return true
      return (
        s.from.city.toLowerCase().includes(searchCity.toLowerCase()) ||
        s.to.city.toLowerCase().includes(searchCity.toLowerCase())
      )
    })
    .sort((a, b) => {
      if (sortBy === "price") return b.price - a.price
      if (sortBy === "distance") return a.distance - b.distance
      return 0
    })

  const totalEarnings = filteredSegments.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available Segments</h1>
        <p className="text-muted-foreground">Browse and accept delivery segments in your area</p>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by city..."
              className="pl-9"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Highest Pay</SelectItem>
              <SelectItem value="distance">Shortest Distance</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <span className="text-sm text-muted-foreground">Total Available:</span>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
              Rs. {totalEarnings}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Segments Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSegments.map((segment) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            onAccept={() => {
              // Accept segment
            }}
          />
        ))}
      </div>

      {filteredSegments.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No segments found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
