"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Package,
  Truck,
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Users,
  Settings,
  Route,
  History,
  PlusCircle,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const requesterNav: NavItem[] = [
  { title: "Dashboard", href: "/requester", icon: LayoutDashboard },
  { title: "Create Order", href: "/requester/create", icon: PlusCircle },
  { title: "My Orders", href: "/requester/orders", icon: Package },
  { title: "Track Parcel", href: "/requester/track", icon: MapPin },
]

const providerNav: NavItem[] = [
  { title: "Dashboard", href: "/provider", icon: LayoutDashboard },
  { title: "Available Segments", href: "/provider/available", icon: Route },
  { title: "My Deliveries", href: "/provider/deliveries", icon: Truck },
  { title: "History", href: "/provider/history", icon: History },
]

const adminNav: NavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Orders", href: "/admin/orders", icon: Package },
  { title: "Providers", href: "/admin/providers", icon: Users },
  { title: "Checkpoints", href: "/admin/checkpoints", icon: MapPin },
  { title: "Failures", href: "/admin/failures", icon: AlertTriangle },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

interface SidebarNavProps {
  role: "requester" | "provider" | "admin"
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()

  const navItems = role === "requester" ? requesterNav : role === "provider" ? providerNav : adminNav

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
