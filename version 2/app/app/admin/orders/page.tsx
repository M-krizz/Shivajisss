import { OrdersTable } from "@/components/admin/orders-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { orders } from "@/lib/mock-data"

export default function AdminOrdersPage() {
  const inTransitOrders = orders.filter((o) => o.status === "in_transit")
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "route_planning")
  const deliveredOrders = orders.filter((o) => o.status === "delivered")
  const failedOrders = orders.filter((o) => o.status === "failed")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Orders</h1>
          <p className="text-muted-foreground">Monitor and manage all delivery orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-500">
            {inTransitOrders.length} In Transit
          </Badge>
          <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
            {failedOrders.length} Failed
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="transit">In Transit ({inTransitOrders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({deliveredOrders.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <OrdersTable orders={orders} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transit" className="mt-6">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <OrdersTable orders={inTransitOrders} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <OrdersTable orders={pendingOrders} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered" className="mt-6">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <OrdersTable orders={deliveredOrders} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <OrdersTable orders={failedOrders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
