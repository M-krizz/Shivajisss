"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Star, Truck, Bike, Car } from "lucide-react"
import type { Provider } from "@/lib/types"

interface ProvidersTableProps {
  providers: Provider[]
}

const vehicleIcons: Record<string, typeof Truck> = {
  bike: Bike,
  car: Car,
  van: Truck,
  truck: Truck,
}

export function ProvidersTable({ providers }: ProvidersTableProps) {
  const [search, setSearch] = useState("")

  const filteredProviders = providers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search providers..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Provider</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.map((provider) => {
              const VehicleIcon = vehicleIcons[provider.vehicleType] || Truck

              return (
                <TableRow key={provider.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{provider.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{provider.vehicleType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span>{provider.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>{provider.completedSegments}</TableCell>
                  <TableCell>
                    {provider.activeSegments > 0 ? (
                      <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-500">
                        {provider.activeSegments} active
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={provider.isOnline ? "default" : "secondary"}
                      className={provider.isOnline ? "bg-emerald-500" : ""}
                    >
                      {provider.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
