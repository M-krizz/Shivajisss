# 🔌 API Documentation

## Multi-Modal Logistics Platform - REST API Reference

Base URL: `http://localhost:8001`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Health & Status](#health--status)
3. [Catalog Endpoints](#catalog-endpoints)
4. [Map Configuration](#map-configuration)
5. [Quote & Route Planning](#quote--route-planning)
6. [Order Management](#order-management)
7. [WebSocket API](#websocket-api)
8. [Error Handling](#error-handling)

---

## Authentication

> **Note:** Current version uses no authentication. Future versions will implement JWT-based auth.

---

## Health & Status

### Check Service Health

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Service is healthy |
| 503 | Service unavailable |

---

## Catalog Endpoints

### List All Districts

Returns all 38 Tamil Nadu districts with their geographic coordinates.

```http
GET /catalog/districts
```

**Response:**
```json
[
  {
    "code": "chennai",
    "name": "Chennai",
    "lat": 13.0827,
    "lon": 80.2707
  },
  {
    "code": "coimbatore",
    "name": "Coimbatore",
    "lat": 11.0168,
    "lon": 76.9558
  },
  // ... 36 more districts
]
```

### List All Warehouses

Returns all generated warehouses (2 per district = 76 total).

```http
GET /catalog/warehouses
```

**Response:**
```json
[
  {
    "id": "wh-chennai-001",
    "name": "Chennai Hub Alpha",
    "district_code": "chennai",
    "lat": 13.0827,
    "lon": 80.2707,
    "capacity": 500,
    "available": true
  }
]
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique warehouse identifier |
| name | string | Human-readable name |
| district_code | string | Parent district code |
| lat | number | Latitude coordinate |
| lon | number | Longitude coordinate |
| capacity | number | Maximum parcel capacity |
| available | boolean | Current availability status |

### List All Drivers

Returns all generated drivers (20 per district = 760 total).

```http
GET /catalog/drivers
```

**Response:**
```json
[
  {
    "id": "drv-chennai-bike-001",
    "name": "Rajesh Kumar",
    "district_code": "chennai",
    "vehicle_type": "bike",
    "rating": 4.7,
    "completed_trips": 156,
    "is_available": true,
    "current_warehouse_id": "wh-chennai-001"
  }
]
```

**Vehicle Types:**
| Type | Description | Max Distance |
|------|-------------|--------------|
| bike | Two-wheeler | 80 km |
| auto | Three-wheeler auto | 120 km |
| minivan | Small cargo van | 220 km |
| truck | Large cargo truck | 400+ km |

---

## Map Configuration

### Get Map Config

Returns OpenStreetMap configuration for Leaflet/Map components.

```http
GET /map/config
```

**Response:**
```json
{
  "tile_url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "attribution": "© OpenStreetMap contributors",
  "bounds": [[8.0, 76.0], [13.5, 80.5]],
  "default_zoom": 7
}
```

**Usage with Leaflet:**
```javascript
const map = L.map('map').setView([10.8, 78.7], config.default_zoom);
L.tileLayer(config.tile_url, {
  attribution: config.attribution
}).addTo(map);
map.fitBounds(config.bounds);
```

---

## Quote & Route Planning

### Get Route Quote

Plan a route without creating an order. Returns optimal path with cost/time estimates.

```http
POST /quote
Content-Type: application/json
```

**Request Body:**
```json
{
  "origin_district": "chennai",
  "destination_district": "madurai",
  "package_type": "general",
  "priority": "cost",
  "max_hops": 7,
  "seed": 2025,
  "preferred_vehicle": null
}
```

**Request Schema:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| origin_district | string | Yes | - | Origin district code |
| destination_district | string | Yes | - | Destination district code |
| package_type | string | No | "general" | Package category |
| priority | string | No | "cost" | Optimization: "cost" or "time" |
| max_hops | integer | No | 7 | Maximum segments allowed |
| seed | integer | No | 2025 | Random seed for route variation |
| preferred_vehicle | string | No | null | Preferred vehicle type |

**Response:**
```json
{
  "checkpoints": [
    {
      "id": "wh-chennai-001",
      "name": "Chennai Hub Alpha",
      "district_code": "chennai",
      "lat": 13.0827,
      "lon": 80.2707
    },
    {
      "id": "wh-tiruchirappalli-001",
      "name": "Trichy Hub Alpha",
      "district_code": "tiruchirappalli",
      "lat": 10.7905,
      "lon": 78.7047
    },
    {
      "id": "wh-madurai-002",
      "name": "Madurai Hub Beta",
      "district_code": "madurai",
      "lat": 9.9252,
      "lon": 78.1198
    }
  ],
  "segments": [
    {
      "from_checkpoint": "wh-chennai-001",
      "to_checkpoint": "wh-tiruchirappalli-001",
      "distance_km": 326.4,
      "eta_minutes": 356,
      "cost_inr": 2842.50,
      "vehicle_type": "truck",
      "driver": {
        "id": "drv-chennai-truck-003",
        "name": "Murugan S"
      }
    },
    {
      "from_checkpoint": "wh-tiruchirappalli-001",
      "to_checkpoint": "wh-madurai-002",
      "distance_km": 142.8,
      "eta_minutes": 178,
      "cost_inr": 1248.30,
      "vehicle_type": "minivan",
      "driver": {
        "id": "drv-tiruchirappalli-minivan-001",
        "name": "Selvam K"
      }
    }
  ],
  "total_distance_km": 469.2,
  "total_eta_minutes": 534,
  "total_cost_inr": 4090.80,
  "fuel_index": 1.023,
  "priority": "cost",
  "generated_at": "2026-01-08T10:30:00Z"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 404 | Route not found (disconnected districts) |
| 400 | Invalid district code |
| 500 | Internal routing error |

---

## Order Management

### Create Order

Create a new delivery order. Internally calls `/quote` and stores the result.

```http
POST /orders
Content-Type: application/json
```

**Request Body:**
```json
{
  "origin_district": "chennai",
  "destination_district": "coimbatore",
  "priority": "time",
  "max_hops": 5
}
```

**Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "request": {
    "origin_district": "chennai",
    "destination_district": "coimbatore",
    "priority": "time",
    "max_hops": 5
  },
  "plan": {
    "checkpoints": [...],
    "segments": [...],
    "total_distance_km": 504.2,
    "total_eta_minutes": 612,
    "total_cost_inr": 5280.40
  },
  "status": "pending",
  "created_at": "2026-01-08T10:35:00Z"
}
```

### Get Order by ID

```http
GET /orders/{order_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| order_id | string (UUID) | Order identifier |

**Response:** Same as Create Order response.

**Error Responses:**
| Code | Reason |
|------|--------|
| 404 | Order not found |

### List All Orders

```http
GET /orders
```

**Response:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "request": {...},
    "plan": {...},
    "status": "in_transit",
    "created_at": "2026-01-08T10:35:00Z"
  },
  {
    "id": "7ca85f64-1234-4562-b3fc-2c963f66afa6",
    "request": {...},
    "plan": {...},
    "status": "pending",
    "created_at": "2026-01-08T11:20:00Z"
  }
]
```

### Update Order Status

```http
PATCH /orders/{order_id}/status
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | Yes | New status value |

**Valid Status Values:**
| Status | Description |
|--------|-------------|
| pending | Order created, awaiting pickup |
| route_planning | Route being calculated |
| in_transit | Parcel in transit |
| delivered | Successfully delivered |
| failed | Delivery failed |

**Response:**
```json
{
  "message": "Status updated",
  "order_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "in_transit"
}
```

---

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8001/ws');
```

### Initial Connection Message

Upon connection, the server sends:
```json
{
  "type": "connected",
  "data": {
    "orders_count": 5,
    "drivers_count": 760,
    "warehouses_count": 76
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

### Client Messages

#### Ping (Heartbeat)
```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": "2026-01-08T10:30:00Z"
}
```

#### Subscribe to Topic
```json
{
  "type": "subscribe",
  "topic": "orders"
}
```

**Response:**
```json
{
  "type": "subscribed",
  "data": {
    "topic": "orders"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

### Server Broadcast Events

#### Order Created
Sent when a new order is placed.
```json
{
  "type": "order_created",
  "data": {
    "order_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "origin": "chennai",
    "destination": "coimbatore",
    "total_cost": 5280.40,
    "segments": 3
  },
  "timestamp": "2026-01-08T10:35:00Z"
}
```

#### Order Status Changed
Sent when an order status is updated.
```json
{
  "type": "order_status_changed",
  "data": {
    "order_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "in_transit"
  },
  "timestamp": "2026-01-08T11:00:00Z"
}
```

### WebSocket Client Example

```typescript
class LogisticsWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  
  connect() {
    this.ws = new WebSocket('ws://localhost:8001/ws');
    
    this.ws.onopen = () => {
      console.log('Connected to logistics server');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onclose = () => {
      this.scheduleReconnect();
    };
  }
  
  private handleMessage(message: any) {
    switch (message.type) {
      case 'connected':
        console.log('Initial state:', message.data);
        break;
      case 'order_created':
        console.log('New order:', message.data);
        break;
      case 'order_status_changed':
        console.log('Status update:', message.data);
        break;
    }
  }
  
  private startHeartbeat() {
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }
  
  private scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request body or parameters |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side error |

### Validation Errors

```json
{
  "detail": [
    {
      "loc": ["body", "origin_district"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Rate Limiting

> **Note:** Current version has no rate limiting. Future versions will implement:
> - 100 requests/minute for general endpoints
> - 10 requests/minute for `/quote` and `/orders` (POST)
> - WebSocket: 1 connection per client

---

## OpenAPI Specification

Full OpenAPI 3.0 documentation available at:
```
http://localhost:8001/docs      # Swagger UI
http://localhost:8001/redoc     # ReDoc
http://localhost:8001/openapi.json  # Raw JSON spec
```
