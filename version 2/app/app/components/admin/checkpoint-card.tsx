import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package, Building2 } from "lucide-react"
import type { Checkpoint } from "@/lib/types"

interface CheckpointCardProps {
  checkpoint: Checkpoint
}

const typeIcons: Record<string, typeof Building2> = {
  warehouse: Building2,
  dropbox: Package,
  partner_store: Building2,
  locker: Package,
  gas_station: MapPin,
}

const typeColors: Record<string, string> = {
  warehouse: "bg-primary/10 text-primary",
  dropbox: "bg-blue-500/10 text-blue-500",
  partner_store: "bg-amber-500/10 text-amber-500",
  locker: "bg-emerald-500/10 text-emerald-500",
  gas_station: "bg-orange-500/10 text-orange-500",
}

export function CheckpointCard({ checkpoint }: CheckpointCardProps) {
  const Icon = typeIcons[checkpoint.type] || MapPin

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${typeColors[checkpoint.type]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{checkpoint.name}</p>
            <p className="text-sm text-muted-foreground">{checkpoint.city}</p>
          </div>
        </div>
        <Badge
          variant={checkpoint.available ? "default" : "secondary"}
          className={checkpoint.available ? "bg-emerald-500" : ""}
        >
          {checkpoint.available ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type</span>
          <Badge variant="outline" className="capitalize">
            {checkpoint.type.replace("_", " ")}
          </Badge>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Capacity</span>
          <span className="font-medium">{checkpoint.capacity} parcels</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Location</span>
          <span className="font-mono text-xs text-muted-foreground">
            {checkpoint.lat.toFixed(4)}, {checkpoint.lng.toFixed(4)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
