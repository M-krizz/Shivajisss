"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface DeliveryFlowChartProps {
  data?: Array<{
    name: string
    value: number
    status: "completed" | "in_transit" | "failed"
  }>
}

const defaultData = [
  { name: "Mumbai", value: 45, status: "completed" as const },
  { name: "Pune", value: 32, status: "completed" as const },
  { name: "Bangalore", value: 28, status: "in_transit" as const },
  { name: "Delhi", value: 52, status: "completed" as const },
  { name: "Hubli", value: 15, status: "in_transit" as const },
  { name: "Jaipur", value: 22, status: "completed" as const },
]

const statusColors = {
  completed: "#22c55e",
  in_transit: "#f59e0b",
  failed: "#ef4444",
}

export function DeliveryFlowChart({ data = defaultData }: DeliveryFlowChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Deliveries by City</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded bg-amber-500" />
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded bg-destructive" />
            <span>Failed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
