"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, User, Package, Truck, Building2, CheckCircle2 } from "lucide-react"

export function SystemFlowDiagram() {
  const steps = [
    { icon: User, label: "Requester", description: "Creates order" },
    { icon: Package, label: "Parcel", description: "Registered" },
    { icon: Building2, label: "Origin", description: "Pickup" },
    { icon: Truck, label: "Segments", description: "Multi-hop" },
    { icon: Building2, label: "Checkpoints", description: "Handoffs" },
    { icon: CheckCircle2, label: "Delivery", description: "Complete" },
  ]

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">System Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-2 text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />}
              </div>
            )
          })}
        </div>

        {/* Key Concepts */}
        <div className="mt-6 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-primary">Segment-Based</p>
            <p className="mt-1 text-xs text-muted-foreground">Short, independent transport legs</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-amber-500">Custody Tracking</p>
            <p className="mt-1 text-xs text-muted-foreground">Explicit accountability chain</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-emerald-500">Local Recovery</p>
            <p className="mt-1 text-xs text-muted-foreground">Stash at nearest checkpoint</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
