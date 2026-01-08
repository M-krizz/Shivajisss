// Core domain types based on your platform concept

export type UserRole = "requester" | "provider" | "admin"

export type OrderStatus = "pending" | "route_planning" | "in_transit" | "delivered" | "failed"

export type SegmentStatus = "pending" | "assigned" | "in_progress" | "completed" | "failed"

export type CustodyEventType = "pickup" | "handoff" | "stash" | "recovery" | "delivery"

export type DeliveryPreference = "FAST" | "COST"

export interface Checkpoint {
  id: string
  name: string
  type: "warehouse" | "dropbox" | "partner_store" | "locker" | "gas_station"
  lat: number
  lng: number
  city: string
  capacity: number
  available: boolean
}

export interface Parcel {
  id: string
  orderId: string
  description: string
  weight: number // kg
  dimensions: { l: number; w: number; h: number } // cm
}

export interface Order {
  id: string
  requesterId: string
  requesterName: string
  origin: Checkpoint
  destination: Checkpoint
  parcel: Parcel
  preference: DeliveryPreference
  status: OrderStatus
  estimatedCost: number
  actualCost: number
  estimatedDelivery: string
  createdAt: string
  segments: Segment[]
}

export interface Segment {
  id: string
  orderId: string
  sequence: number
  from: Checkpoint
  to: Checkpoint
  distance: number // km
  estimatedDuration: number // minutes
  price: number
  status: SegmentStatus
  providerId: string | null
  providerName: string | null
  startedAt: string | null
  completedAt: string | null
}

export interface CustodyEvent {
  id: string
  orderId: string
  segmentId: string | null
  parcelId: string
  type: CustodyEventType
  fromEntityId: string | null
  fromEntityName: string | null
  toEntityId: string
  toEntityName: string
  checkpoint: Checkpoint
  timestamp: string
  notes: string | null
  verified: boolean
}

export interface Provider {
  id: string
  name: string
  rating: number
  completedSegments: number
  activeSegments: number
  vehicleType: "bike" | "car" | "van" | "truck"
  availableCapacity: number
  currentLocation: { lat: number; lng: number } | null
  isOnline: boolean
}

export interface FailureEvent {
  id: string
  orderId: string
  segmentId: string
  type: "provider_unavailable" | "vehicle_breakdown" | "weather" | "checkpoint_closed" | "other"
  description: string
  timestamp: string
  resolved: boolean
  resolution: string | null
  stashedAt: Checkpoint | null
  recoveredAt: string | null
}

export interface RouteOption {
  id: string
  hops: number
  segments: Segment[]
  totalDistance: number
  totalDuration: number // minutes
  estimatedCost: number
  recommendation: DeliveryPreference
}

export interface SystemStats {
  activeOrders: number
  pendingOrders: number
  completedToday: number
  failuresToday: number
  activeProviders: number
  avgDeliveryTime: number // hours
  totalRevenue: number
}
