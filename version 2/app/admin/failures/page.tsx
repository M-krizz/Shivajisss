"use client"

import { useState } from "react"
import { FailureCard } from "@/components/admin/failure-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { failureEvents as initialFailures } from "@/lib/mock-data"
import type { FailureEvent } from "@/lib/types"

export default function AdminFailuresPage() {
  const [failures, setFailures] = useState<FailureEvent[]>(initialFailures)

  const activeFailures = failures.filter((f) => !f.resolved)
  const resolvedFailures = failures.filter((f) => f.resolved)

  const handleResolve = (failureId: string) => {
    setFailures(
      failures.map((f) =>
        f.id === failureId
          ? { ...f, resolved: true, resolution: "Recovery initiated by admin", recoveredAt: new Date().toISOString() }
          : f,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Failure Management</h1>
          <p className="text-muted-foreground">Monitor and resolve delivery failures</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {activeFailures.length} Active
          </Badge>
          <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {resolvedFailures.length} Resolved
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeFailures.length}</p>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">2.5h</p>
              <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">98%</p>
              <p className="text-sm text-muted-foreground">Recovery Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="active">Active ({activeFailures.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedFailures.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeFailures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeFailures.map((failure) => (
                <FailureCard key={failure.id} failure={failure} onResolve={() => handleResolve(failure.id)} />
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <p className="mt-4 font-medium">All Clear!</p>
                <p className="text-muted-foreground">No active failures at the moment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          {resolvedFailures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {resolvedFailures.map((failure) => (
                <FailureCard key={failure.id} failure={failure} />
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No resolved failures yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
