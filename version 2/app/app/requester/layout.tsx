import type React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function RequesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <DashboardLayout role="requester" userName="Requester">
      {children}
    </DashboardLayout>
  )
}
