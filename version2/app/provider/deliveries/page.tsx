"use client"

import { useState } from "react"
import { SegmentCard } from "@/components/provider/segment-card"
import { CustodyHandoffDialog } from "@/components/provider/custody-handoff-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, CheckCircle2, Clock } from "lucide-react"
import { orders } from "@/lib/mock-data"
import type { Segment } from "@/lib/types"

export default function DeliveriesPage() {
  const [handoffDialogOpen, setHandoffDialogOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)

  // Get all segments - no longer filtering by hardcoded provider ID
  const allSegments = orders.flatMap((o) => o.segments)

  const activeSegments = allSegments.filter((s) => s.status === "in_progress")
  const assignedSegments = allSegments.filter((s) => s.status === "assigned")
  const completedSegments = allSegments.filter((s) => s.status === "completed")

  const handleCompleteSegment = (segment: Segment) => {
    setSelectedSegment(segment)
    setHandoffDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Deliveries</h1>
          <p className="text-muted-foreground">Manage your active and upcoming segments</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-500">
            <Truck className="mr-1 h-3 w-3" />
            {activeSegments.length} Active
          </Badge>
          <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            {assignedSegments.length} Assigned
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="active">Active ({activeSegments.length})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({assignedSegments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSegments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeSegments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeSegments.map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  isActive
                  onComplete={() => handleCompleteSegment(segment)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No active deliveries</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="mt-6">
          {assignedSegments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {assignedSegments.map((segment) => (
                <SegmentCard key={segment.id} segment={segment} showActions={true} />
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No upcoming assignments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedSegments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedSegments.map((segment) => (
                <SegmentCard key={segment.id} segment={segment} showActions={false} />
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No completed deliveries yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Handoff Dialog */}
      <CustodyHandoffDialog
        open={handoffDialogOpen}
        onOpenChange={setHandoffDialogOpen}
        segment={selectedSegment}
        onConfirm={() => {
          setHandoffDialogOpen(false)
          setSelectedSegment(null)
        }}
      />
    </div>
  )
}
