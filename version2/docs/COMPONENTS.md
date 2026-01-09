# 🧩 Component Documentation

## Multi-Modal Logistics Platform - UI Components Guide

This document describes the React components used in the frontend application.

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [UI Components (shadcn/ui)](#ui-components-shadcnui)
3. [Dashboard Components](#dashboard-components)
4. [Order Components](#order-components)
5. [Provider Components](#provider-components)
6. [Tracking Components](#tracking-components)
7. [Admin Components](#admin-components)
8. [Visualization Components](#visualization-components)
9. [Custom Hooks](#custom-hooks)
10. [Styling Guidelines](#styling-guidelines)

---

## Component Architecture

```
components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── dashboard/             # Dashboard-specific components
│   ├── dashboard-layout.tsx
│   ├── dashboard-header.tsx
│   ├── sidebar-nav.tsx
│   └── stat-card.tsx
├── orders/                # Order-related components
│   ├── order-card.tsx
│   └── route-option-card.tsx
├── provider/              # Provider portal components
│   ├── segment-card.tsx
│   └── custody-handoff-dialog.tsx
├── tracking/              # Parcel tracking components
│   ├── custody-timeline.tsx
│   └── segment-progress.tsx
├── admin/                 # Admin portal components
│   ├── orders-table.tsx
│   ├── providers-table.tsx
│   ├── checkpoint-card.tsx
│   └── failure-card.tsx
└── visualizations/        # Charts and maps
    ├── route-map.tsx
    └── warehouse-map.tsx
```

---

## UI Components (shadcn/ui)

Base components from shadcn/ui with Radix UI primitives.

### Button

```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Order Details</CardTitle>
    <CardDescription>View your order information</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Order content here...</p>
  </CardContent>
  <CardFooter>
    <Button>Track Order</Button>
  </CardFooter>
</Card>
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to proceed?
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="outline">Draft</Badge>
```

### Input & Form

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="tracking">Tracking ID</Label>
  <Input 
    id="tracking"
    placeholder="Enter order ID"
    value={trackingId}
    onChange={(e) => setTrackingId(e.target.value)}
  />
</div>
```

### Select

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select value={district} onValueChange={setDistrict}>
  <SelectTrigger>
    <SelectValue placeholder="Select district" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="chennai">Chennai</SelectItem>
    <SelectItem value="coimbatore">Coimbatore</SelectItem>
    <SelectItem value="madurai">Madurai</SelectItem>
  </SelectContent>
</Select>
```

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="active">
  <TabsList>
    <TabsTrigger value="active">Active</TabsTrigger>
    <TabsTrigger value="completed">Completed</TabsTrigger>
  </TabsList>
  <TabsContent value="active">
    Active orders...
  </TabsContent>
  <TabsContent value="completed">
    Completed orders...
  </TabsContent>
</Tabs>
```

---

## Dashboard Components

### DashboardLayout

Main layout wrapper for all dashboard pages.

```tsx
// components/dashboard/dashboard-layout.tsx
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "requester" | "provider" | "admin"
}

// Usage
<DashboardLayout role="requester">
  <YourPageContent />
</DashboardLayout>
```

### DashboardHeader

Header with title, breadcrumbs, and actions.

```tsx
// components/dashboard/dashboard-header.tsx
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

<DashboardHeader
  title="My Orders"
  description="Manage your delivery orders"
  actions={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      New Order
    </Button>
  }
/>
```

### SidebarNav

Navigation sidebar for different portals.

```tsx
// components/dashboard/sidebar-nav.tsx
import { SidebarNav } from "@/components/dashboard/sidebar-nav"

const requesterNavItems = [
  { title: "Dashboard", href: "/requester", icon: Home },
  { title: "Create Order", href: "/requester/create", icon: Plus },
  { title: "My Orders", href: "/requester/orders", icon: Package },
  { title: "Track", href: "/requester/track", icon: MapPin },
]

<SidebarNav items={requesterNavItems} />
```

### StatCard

Statistics display card for dashboards.

```tsx
// components/dashboard/stat-card.tsx
import { StatCard } from "@/components/dashboard/stat-card"

<StatCard
  title="Active Orders"
  value={42}
  description="+12% from last week"
  icon={<Package className="h-4 w-4" />}
  trend="up"
/>
```

---

## Order Components

### OrderCard

Displays order summary in a card format.

```tsx
// components/orders/order-card.tsx
import { OrderCard } from "@/components/orders/order-card"

interface OrderCardProps {
  order: Order
  onTrack?: (orderId: string) => void
  onCancel?: (orderId: string) => void
}

<OrderCard
  order={{
    id: "ORD-001",
    status: "in_transit",
    origin: { name: "Chennai Hub", city: "Chennai" },
    destination: { name: "Madurai Hub", city: "Madurai" },
    estimatedDelivery: "2026-01-10",
    estimatedCost: 450,
  }}
  onTrack={(id) => router.push(`/requester/track?id=${id}`)}
/>
```

**Features:**
- Status badge with color coding
- Origin/destination display
- Cost and ETA information
- Action buttons (Track, Cancel)

### RouteOptionCard

Displays route options for order creation.

```tsx
// components/orders/route-option-card.tsx
import { RouteOptionCard } from "@/components/orders/route-option-card"

interface RouteOptionCardProps {
  option: RouteOption
  isSelected: boolean
  onSelect: () => void
}

<RouteOptionCard
  option={{
    id: "route-1",
    hops: 3,
    totalDistance: 469,
    totalDuration: 534,
    estimatedCost: 4090,
    recommendation: "COST",
  }}
  isSelected={selectedRoute === "route-1"}
  onSelect={() => setSelectedRoute("route-1")}
/>
```

**Features:**
- Hop count visualization
- Distance and duration display
- Cost breakdown
- Recommendation badge (FAST/COST)

---

## Provider Components

### SegmentCard

Displays delivery segment for providers.

```tsx
// components/provider/segment-card.tsx
import { SegmentCard } from "@/components/provider/segment-card"

interface SegmentCardProps {
  segment: Segment
  onAccept?: () => void
  onStartDelivery?: () => void
  onCompleteDelivery?: () => void
}

<SegmentCard
  segment={{
    id: "SEG-001",
    from: { name: "Chennai Hub", city: "Chennai" },
    to: { name: "Trichy Hub", city: "Tiruchirappalli" },
    distance: 326,
    estimatedDuration: 356,
    price: 2842,
    status: "pending",
  }}
  onAccept={() => acceptSegment("SEG-001")}
/>
```

**Features:**
- Pickup/dropoff locations
- Distance and earnings display
- Status-based action buttons
- Vehicle type indicator

### CustodyHandoffDialog

Modal for custody transfer at checkpoints.

```tsx
// components/provider/custody-handoff-dialog.tsx
import { CustodyHandoffDialog } from "@/components/provider/custody-handoff-dialog"

interface CustodyHandoffDialogProps {
  segment: Segment
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (notes: string, photoUrl?: string) => void
}

<CustodyHandoffDialog
  segment={currentSegment}
  open={showHandoff}
  onOpenChange={setShowHandoff}
  onConfirm={(notes) => {
    completeHandoff(currentSegment.id, notes)
  }}
/>
```

**Features:**
- Parcel verification checklist
- Photo upload (optional)
- Notes input
- Digital signature (future)

---

## Tracking Components

### CustodyTimeline

Visual timeline of parcel custody events.

```tsx
// components/tracking/custody-timeline.tsx
import { CustodyTimeline } from "@/components/tracking/custody-timeline"

interface CustodyTimelineProps {
  events: CustodyEvent[]
  currentStatus: OrderStatus
}

<CustodyTimeline
  events={[
    {
      id: "1",
      type: "pickup",
      timestamp: "2026-01-08T10:00:00Z",
      checkpoint: { name: "Chennai Hub" },
      toEntityName: "Rajesh Kumar",
      verified: true,
    },
    {
      id: "2",
      type: "handoff",
      timestamp: "2026-01-08T16:00:00Z",
      checkpoint: { name: "Trichy Hub" },
      fromEntityName: "Rajesh Kumar",
      toEntityName: "Selvam K",
      verified: true,
    },
  ]}
  currentStatus="in_transit"
/>
```

**Features:**
- Chronological event display
- Event type icons (pickup, handoff, delivery)
- Timestamp formatting
- Verification status indicator
- Animated current position

### SegmentProgress

Visual progress of delivery segments.

```tsx
// components/tracking/segment-progress.tsx
import { SegmentProgress } from "@/components/tracking/segment-progress"

interface SegmentProgressProps {
  segments: Segment[]
  currentSegmentIndex: number
}

<SegmentProgress
  segments={order.segments}
  currentSegmentIndex={1}
/>
```

**Features:**
- Linear progress visualization
- Checkpoint markers
- Current segment highlighting
- Distance labels

---

## Admin Components

### OrdersTable

Data table for admin order management.

```tsx
// components/admin/orders-table.tsx
import { OrdersTable } from "@/components/admin/orders-table"

interface OrdersTableProps {
  orders: Order[]
  onViewDetails: (order: Order) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}

<OrdersTable
  orders={allOrders}
  onViewDetails={(order) => setSelectedOrder(order)}
  onUpdateStatus={(id, status) => updateOrderStatus(id, status)}
/>
```

**Features:**
- Sortable columns
- Status filter
- Search functionality
- Pagination
- Bulk actions

### ProvidersTable

Data table for provider management.

```tsx
// components/admin/providers-table.tsx
import { ProvidersTable } from "@/components/admin/providers-table"

interface ProvidersTableProps {
  providers: Provider[]
  onViewProfile: (provider: Provider) => void
  onToggleStatus: (providerId: string, isOnline: boolean) => void
}

<ProvidersTable
  providers={allProviders}
  onViewProfile={(provider) => router.push(`/admin/providers/${provider.id}`)}
  onToggleStatus={(id, status) => updateProviderStatus(id, status)}
/>
```

### CheckpointCard

Displays checkpoint/warehouse status.

```tsx
// components/admin/checkpoint-card.tsx
import { CheckpointCard } from "@/components/admin/checkpoint-card"

<CheckpointCard
  checkpoint={{
    id: "wh-chennai-001",
    name: "Chennai Hub Alpha",
    type: "warehouse",
    city: "Chennai",
    capacity: 500,
    available: true,
  }}
  currentLoad={342}
  onViewDetails={() => viewCheckpointDetails("wh-chennai-001")}
/>
```

### FailureCard

Displays delivery failure for resolution.

```tsx
// components/admin/failure-card.tsx
import { FailureCard } from "@/components/admin/failure-card"

<FailureCard
  failure={{
    id: "FAIL-001",
    orderId: "ORD-123",
    type: "vehicle_breakdown",
    description: "Tire puncture on NH44",
    timestamp: "2026-01-08T14:30:00Z",
    resolved: false,
  }}
  onResolve={(failureId, resolution) => resolveFailure(failureId, resolution)}
/>
```

---

## Visualization Components

### RouteMap

Interactive map showing delivery route.

```tsx
// components/visualizations/route-map.tsx
import { RouteMap } from "@/components/visualizations/route-map"

interface RouteMapProps {
  segments: Segment[]
  currentPosition?: { lat: number; lng: number }
  height?: string
}

<RouteMap
  segments={order.segments}
  currentPosition={{ lat: 10.79, lng: 78.70 }}
  height="400px"
/>
```

**Features:**
- Google Maps integration
- Route polyline
- Checkpoint markers
- Current position indicator
- Zoom controls

### WarehouseMap

Map showing warehouse network.

```tsx
// components/visualizations/warehouse-map.tsx
import { WarehouseMap } from "@/components/visualizations/warehouse-map"

interface WarehouseMapProps {
  warehouses: Checkpoint[]
  onWarehouseClick?: (warehouse: Checkpoint) => void
}

<WarehouseMap
  warehouses={allWarehouses}
  onWarehouseClick={(wh) => setSelectedWarehouse(wh)}
/>
```

---

## Custom Hooks

### useRealtime

WebSocket connection with polling fallback.

```tsx
// hooks/use-realtime.ts
import { useRealtime } from "@/hooks/use-realtime"

interface UseRealtimeOptions {
  onOrderCreated?: (data: any) => void
  onOrderStatusChanged?: (data: any) => void
  enablePolling?: boolean
  pollingInterval?: number
}

function MyComponent() {
  const { isConnected, lastUpdate, connectionType } = useRealtime({
    onOrderCreated: (data) => {
      console.log('New order:', data)
      refreshOrders()
    },
    onOrderStatusChanged: (data) => {
      console.log('Status changed:', data)
      updateOrderInList(data)
    },
    enablePolling: true,
    pollingInterval: 30000,
  })

  return (
    <div>
      <Badge variant={isConnected ? "default" : "secondary"}>
        {connectionType}: {isConnected ? "Connected" : "Disconnected"}
      </Badge>
    </div>
  )
}
```

### useToast

Toast notification system.

```tsx
// hooks/use-toast.ts
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Order Created",
      description: "Your order has been placed successfully.",
    })
  }

  const handleError = () => {
    toast({
      title: "Error",
      description: "Failed to create order. Please try again.",
      variant: "destructive",
    })
  }
}
```

### useMobile

Detect mobile viewport.

```tsx
// hooks/use-mobile.ts
import { useMobile } from "@/hooks/use-mobile"

function MyComponent() {
  const isMobile = useMobile()

  return isMobile ? <MobileLayout /> : <DesktopLayout />
}
```

---

## Styling Guidelines

### Tailwind CSS Classes

```tsx
// Common patterns

// Card with hover effect
<div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">

// Flex container with gap
<div className="flex items-center gap-4">

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Status colors
<Badge className="bg-green-100 text-green-800">Active</Badge>
<Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
<Badge className="bg-red-100 text-red-800">Failed</Badge>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
```

### CSS Variables (globals.css)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

### Component Naming Convention

```
ComponentName.tsx          # PascalCase for components
use-hook-name.ts           # kebab-case with 'use-' prefix for hooks
component-name.tsx         # kebab-case for UI primitives
```
