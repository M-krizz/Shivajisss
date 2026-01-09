import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, DollarSign, TrendingUp } from "lucide-react"
import { orders } from "@/lib/mock-data"

export default function HistoryPage() {
  // Get all completed segments - no longer filtering by hardcoded provider ID
  const completedSegments = orders
    .flatMap((o) => o.segments)
    .filter((s) => s.status === "completed")

  const totalEarnings = completedSegments.reduce((sum, s) => sum + s.price, 0)
  const totalDistance = completedSegments.reduce((sum, s) => sum + s.distance, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery History</h1>
        <p className="text-muted-foreground">View your past deliveries and earnings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedSegments.length}</p>
              <p className="text-sm text-muted-foreground">Total Deliveries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">Rs. {totalEarnings}</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDistance} km</p>
              <p className="text-sm text-muted-foreground">Total Distance</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                Rs. {completedSegments.length > 0 ? Math.round(totalEarnings / completedSegments.length) : 0}
              </p>
              <p className="text-sm text-muted-foreground">Avg. per Delivery</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Order ID</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedSegments.map((segment) => (
                <TableRow key={segment.id} className="border-border">
                  <TableCell className="font-mono text-sm">{segment.orderId}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {segment.from.city} → {segment.to.city}
                    </span>
                  </TableCell>
                  <TableCell>{segment.distance} km</TableCell>
                  <TableCell className="font-medium">Rs. {segment.price}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {segment.completedAt ? new Date(segment.completedAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
