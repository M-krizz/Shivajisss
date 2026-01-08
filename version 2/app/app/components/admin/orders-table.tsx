"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, AlertTriangle, MapPin } from "lucide-react"
import type { Order } from "@/lib/types"
import Link from "next/link"

interface OrdersTableProps {
  orders: Order[]
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  route_planning: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_transit: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [search, setSearch] = useState("")

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      o.origin.city.toLowerCase().includes(search.toLowerCase()) ||
      o.destination.city.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Order ID</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Segments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const completedSegments = order.segments.filter((s) => s.status === "completed").length

              return (
                <TableRow key={order.id} className="border-border">
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell>{order.requesterName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-emerald-500" />
                      <span>{order.origin.city}</span>
                      <span className="text-muted-foreground">→</span>
                      <MapPin className="h-3 w-3 text-destructive" />
                      <span>{order.destination.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {completedSegments}/{order.segments.length}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {order.status === "failed" && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {order.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">Rs. {order.estimatedCost}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/orders/${order.id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        {order.status === "failed" && (
                          <DropdownMenuItem className="text-destructive">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            View Failure
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
