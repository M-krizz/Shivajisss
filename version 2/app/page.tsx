"use client"

import Link from "next/link"
import { Package2, ArrowRight, Truck, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Package2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Logistics Platform</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How it Works
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Distributed Logistics
          <span className="block text-primary">Orchestration Platform</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
          Parcel delivery through short, independent transport segments. Flexible checkpoints, explicit custody
          tracking, and local failure recovery.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/requester">
            <Button size="lg" className="gap-2">
              Requester Portal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/provider">
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              Provider Dashboard
              <Truck className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/admin">
            <Button size="lg" variant="secondary" className="gap-2">
              Admin Console
              <Shield className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Role Cards */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Package2 className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle>Requester</CardTitle>
              <CardDescription>
                Create orders, track parcels, and choose between FAST or COST optimized routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Create new delivery orders</li>
                <li>Real-time parcel tracking</li>
                <li>Multi-hop route visualization</li>
                <li>Custody event timeline</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Truck className="h-5 w-5 text-emerald-500" />
              </div>
              <CardTitle>Provider</CardTitle>
              <CardDescription>Accept segments, manage deliveries, and handle custody handoffs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Browse available segments</li>
                <li>Accept delivery jobs</li>
                <li>Custody transfer verification</li>
                <li>Earnings tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <CardTitle>Admin</CardTitle>
              <CardDescription>Monitor system health, manage failures, and oversee operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>System-wide monitoring</li>
                <li>Failure recovery management</li>
                <li>Provider oversight</li>
                <li>Checkpoint management</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>Logistics Orchestration Platform - Hackathon Demo</p>
        </div>
      </footer>
    </div>
  )
}
