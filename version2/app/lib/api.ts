/**
 * API Service Layer
 * Handles all communication between frontend and backend
 */

// API base URL - defaults to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Get the auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

/**
 * Generic fetch wrapper with error handling and auth
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }
  
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = "Request failed"
    let details: unknown = null
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.message || errorMessage
      details = errorData
    } catch {
      errorMessage = response.statusText || errorMessage
    }
    
    throw new ApiError(response.status, errorMessage, details)
  }

  // Handle empty responses
  const text = await response.text()
  if (!text) return {} as T
  
  return JSON.parse(text)
}

// ============================================================================
// AUTH API
// ============================================================================

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: number
  email: string
  role: "requester" | "provider" | "admin"
}

export interface RegisterData {
  email: string
  password: string
  role: "requester" | "provider"
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams()
  formData.append("username", email)
  formData.append("password", password)

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }))
    throw new ApiError(response.status, error.detail || "Login failed", error)
  }

  return response.json()
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<UserResponse> {
  return apiFetch<UserResponse>("/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<UserResponse> {
  return apiFetch<UserResponse>("/me")
}

// ============================================================================
// CATALOG API
// ============================================================================

export interface District {
  code: string
  name: string
  lat: number
  lng: number
}

export interface Warehouse {
  id: string
  name: string
  district_code: string
  lat: number
  lng: number
  capacity: number
}

export interface Driver {
  id: string
  name: string
  district_code: string
  vehicle_type: string
  warehouse_id: string
}

/**
 * Get all districts
 */
export async function getDistricts(): Promise<District[]> {
  return apiFetch<District[]>("/catalog/districts")
}

/**
 * Get all warehouses
 */
export async function getWarehouses(): Promise<Warehouse[]> {
  return apiFetch<Warehouse[]>("/catalog/warehouses")
}

/**
 * Get all drivers
 */
export async function getDrivers(): Promise<Driver[]> {
  return apiFetch<Driver[]>("/catalog/drivers")
}

/**
 * Get map configuration
 */
export async function getMapConfig(): Promise<{
  tile_url: string
  attribution: string
  bounds: number[][]
  default_zoom: number
}> {
  return apiFetch("/map/config")
}

// ============================================================================
// ORDERS API
// ============================================================================

export interface QuoteRequest {
  origin_district: string
  destination_district: string
  priority: "FAST" | "COST"
  max_hops?: number
  preferred_vehicle?: string
  seed?: number
}

export interface SegmentOut {
  from_warehouse: Warehouse
  to_warehouse: Warehouse
  driver: Driver
  distance_km: number
  duration_mins: number
  cost_inr: number
}

export interface RoutePlan {
  origin_district: string
  destination_district: string
  priority: string
  segments: SegmentOut[]
  total_distance_km: number
  total_duration_mins: number
  total_cost_inr: number
  hops: number
}

export interface OrderRequest extends QuoteRequest {
  parcel_description?: string
  parcel_weight?: number
}

export interface Order {
  id: string
  request: OrderRequest
  plan: RoutePlan
  status?: string
}

/**
 * Get a route quote
 */
export async function getQuote(request: QuoteRequest): Promise<RoutePlan> {
  return apiFetch<RoutePlan>("/quote", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

/**
 * Create a new order
 */
export async function createOrder(request: OrderRequest): Promise<Order> {
  return apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

/**
 * Get all orders
 */
export async function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders")
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`)
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  await apiFetch(`/orders/${orderId}/status?status=${encodeURIComponent(status)}`, {
    method: "PATCH",
  })
}

// ============================================================================
// HEALTH & REALTIME
// ============================================================================

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health")
}

/**
 * Create WebSocket connection for real-time updates
 */
export function createWebSocket(onMessage: (data: unknown) => void): WebSocket {
  const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/ws"
  const ws = new WebSocket(wsUrl)
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error("WebSocket message parse error:", error)
    }
  }
  
  ws.onerror = (error) => {
    console.error("WebSocket error:", error)
  }
  
  return ws
}

// Export API base URL for use in components
export { API_BASE_URL }
