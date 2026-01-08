"use client"

import { useEffect, useRef, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const BOUNDS = { minLat: 8.0, maxLat: 13.5, minLon: 76.2, maxLon: 80.4 }
const VIEWBOX = 1000
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export type WarehousePoint = {
  id: string
  name: string
  district_code: string
  lat: number
  lon: number
}

export type RouteSegmentLite = {
  from: WarehousePoint
  to: WarehousePoint
  vehicle_type: string
  cost_inr: number
  eta_minutes: number
}

function toXY(lat: number, lon: number) {
  const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * VIEWBOX
  const y = VIEWBOX - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VIEWBOX
  return { x, y }
}

// Track loading state globally to prevent multiple loads
let googleMapsLoadPromise: Promise<void> | null = null
let googleMapsLoaded = false

function loadGoogleMaps(apiKey?: string): Promise<void> {
  // Return immediately if already loaded
  if (googleMapsLoaded && (window as any).google?.maps) {
    return Promise.resolve()
  }
  
  // Return existing promise if already loading
  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    if (!apiKey) return reject(new Error("Google Maps API key missing"))
    
    // Check if script already exists
    const existing = document.getElementById("google-maps-sdk") as HTMLScriptElement | null
    if (existing) {
      if ((window as any).google?.maps) {
        googleMapsLoaded = true
        return resolve()
      }
      // Script exists but not loaded yet, wait for it
      existing.addEventListener('load', () => {
        googleMapsLoaded = true
        resolve()
      })
      existing.addEventListener('error', () => reject(new Error("Failed to load Google Maps")))
      return
    }

    const script = document.createElement("script")
    script.id = "google-maps-sdk"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = () => {
      googleMapsLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error("Failed to load Google Maps"))
    document.body.appendChild(script)
  })
  
  return googleMapsLoadPromise
}

export function WarehouseMap({
  warehouses,
  segments,
  title = "Warehouses & route",
}: {
  warehouses: WarehousePoint[]
  segments?: RouteSegmentLite[]
  title?: string
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<any>(null)
  const overlaysRef = useRef<{ markers: any[]; polylines: any[] }>({ markers: [], polylines: [] })
  const [googleReady, setGoogleReady] = useState(false)

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return
    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => setGoogleReady(true))
      .catch(() => setGoogleReady(false))
  }, [])

  useEffect(() => {
    if (!googleReady || !mapRef.current) return
    const g = (window as any).google
    if (!g?.maps) return

    if (!mapInstance.current) {
      mapInstance.current = new g.maps.Map(mapRef.current, {
        center: { lat: 11.0, lng: 78.5 },
        zoom: 7,
        disableDefaultUI: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      })
    }

    // Clear existing overlays
    overlaysRef.current.markers.forEach((m) => m.setMap(null))
    overlaysRef.current.polylines.forEach((p) => p.setMap(null))
    overlaysRef.current = { markers: [], polylines: [] }

    const bounds = new g.maps.LatLngBounds()
    warehouses.forEach((w) => {
      const marker = new g.maps.Marker({
        position: { lat: w.lat, lng: w.lon },
        map: mapInstance.current,
        title: w.name,
        label: w.name.split(" ")[0]?.[0] ?? undefined,
      })
      overlaysRef.current.markers.push(marker)
      bounds.extend(marker.getPosition()!)
    })

    if (!bounds.isEmpty()) mapInstance.current.fitBounds(bounds)

    if (segments?.length) {
      segments.forEach((seg, idx) => {
        const polyline = new g.maps.Polyline({
          path: [
            { lat: seg.from.lat, lng: seg.from.lon },
            { lat: seg.to.lat, lng: seg.to.lon },
          ],
          geodesic: true,
          strokeColor: idx === 0 ? "#0ea5e9" : "#22c55e",
          strokeOpacity: 0.75,
          strokeWeight: 6,
          map: mapInstance.current,
        })
        overlaysRef.current.polylines.push(polyline)
      })
    }
  }, [googleReady, warehouses, segments])

  const showGoogle = !!GOOGLE_MAPS_API_KEY

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/50" style={{ aspectRatio: "4 / 3" }}>
          {showGoogle ? (
            <div ref={mapRef} className="h-full w-full" />
          ) : (
            <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="h-full w-full">
              {/* Segments */}
              {segments?.map((seg, idx) => {
                const a = toXY(seg.from.lat, seg.from.lon)
                const b = toXY(seg.to.lat, seg.to.lon)
                return (
                  <g key={`${seg.from.id}-${seg.to.id}-${idx}`}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      strokeWidth={8}
                      stroke="var(--primary)"
                      strokeOpacity={0.6}
                    />
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 8} fontSize={24} fill="var(--foreground)" textAnchor="middle">
                      {Math.round(seg.eta_minutes)}m / ₹{Math.round(seg.cost_inr)}
                    </text>
                  </g>
                )
              })}

              {/* Warehouses */}
              {warehouses.map((w) => {
                const { x, y } = toXY(w.lat, w.lon)
                return (
                  <g key={w.id}>
                    <circle cx={x} cy={y} r={16} fill="var(--background)" stroke="var(--primary)" strokeWidth={6} />
                    <text x={x} y={y - 22} fontSize={22} fill="var(--foreground)" textAnchor="middle">
                      {w.name.split(" ")[0]}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {segments && (
          <div className="grid gap-2 md:grid-cols-2">
            {segments.map((seg, idx) => (
              <div key={`${seg.from.id}-${seg.to.id}-${idx}`} className="flex items-center justify-between rounded border border-border bg-muted/50 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">
                    {seg.from.name} → {seg.to.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">Vehicle: {seg.vehicle_type}</p>
                </div>
                <Badge variant="secondary">₹{Math.round(seg.cost_inr)} / {Math.round(seg.eta_minutes)}m</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
