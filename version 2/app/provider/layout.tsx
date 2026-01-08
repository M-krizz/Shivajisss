import type React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout role="provider" userName="Provider">
      {children}
    </DashboardLayout>
  )
}
