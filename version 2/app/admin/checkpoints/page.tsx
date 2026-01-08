import { CheckpointCard } from "@/components/admin/checkpoint-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building2, Package } from "lucide-react"
import { checkpoints } from "@/lib/mock-data"

export default function AdminCheckpointsPage() {
  const activeCheckpoints = checkpoints.filter((c) => c.available)
  const inactiveCheckpoints = checkpoints.filter((c) => !c.available)
  const totalCapacity = checkpoints.reduce((sum, c) => sum + c.capacity, 0)

  const typeCount = checkpoints.reduce(
    (acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checkpoints</h1>
        <p className="text-muted-foreground">Manage delivery checkpoints and capacity</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{checkpoints.length}</p>
              <p className="text-sm text-muted-foreground">Total Checkpoints</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCheckpoints.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Building2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inactiveCheckpoints.length}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Package className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCapacity}</p>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm text-muted-foreground">Types:</span>
          {Object.entries(typeCount).map(([type, count]) => (
            <Badge key={type} variant="outline" className="capitalize">
              {type.replace("_", " ")} ({count})
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Checkpoints Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checkpoints.map((checkpoint) => (
          <CheckpointCard key={checkpoint.id} checkpoint={checkpoint} />
        ))}
      </div>
    </div>
  )
}
