# 📦 Multi-Modal Logistics Platform

## Distributed Logistics Orchestrator for Tamil Nadu

A comprehensive, simulation-first logistics platform that enables multi-hop parcel delivery across Tamil Nadu's 38 districts. The platform connects **Requesters** (who need deliveries), **Providers** (who fulfill deliveries), and **Administrators** (who manage the platform).

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Getting Started](#getting-started)
6. [User Roles](#user-roles)
7. [API Reference](#api-reference)
8. [Data Models](#data-models)
9. [Routing Algorithm](#routing-algorithm)
10. [Real-Time Updates](#real-time-updates)
11. [Project Structure](#project-structure)
12. [Configuration](#configuration)
13. [Deployment](#deployment)
14. [Future Roadmap](#future-roadmap)

---

## 🎯 Overview

### What is this?

The **Multi-Modal Logistics Platform** is a distributed delivery orchestration system designed to simulate and manage parcel logistics across Tamil Nadu. It provides:

- **Intelligent Route Planning**: Uses graph-based algorithms to find optimal multi-hop routes
- **Multi-Modal Transport**: Supports bikes, autos, minivans, and trucks with different cost/speed profiles
- **Real-Time Tracking**: WebSocket-based live updates for order status and custody changes
- **Checkpoint Network**: 2 warehouses per district forming a connected delivery network
- **Dynamic Pricing**: Fuel price index that fluctuates based on time/demand

### Problem Statement

Traditional logistics systems often:
- Lack transparency in the delivery chain
- Don't optimize for multi-modal transport
- Have limited real-time visibility
- Cannot handle custody handoffs between multiple providers

This platform solves these issues by providing a unified system for planning, tracking, and managing distributed deliveries.

---

## ✨ Key Features

### For Requesters (Customers)
| Feature | Description |
|---------|-------------|
| **Create Orders** | Specify origin, destination, parcel details, and delivery preference (FAST/COST) |
| **Route Options** | View multiple route options with different cost/time tradeoffs |
| **Real-Time Tracking** | Track parcel location through custody timeline |
| **Order History** | View past and active orders with full details |

### For Providers (Delivery Partners)
| Feature | Description |
|---------|-------------|
| **Available Segments** | Browse and accept delivery segments in their area |
| **Active Deliveries** | Manage current assignments with pickup/dropoff details |
| **Custody Handoff** | Transfer parcel custody at checkpoints |
| **Delivery History** | Track completed deliveries and earnings |

### For Administrators
| Feature | Description |
|---------|-------------|
| **Dashboard Analytics** | Real-time stats on orders, providers, and performance |
| **Order Management** | View and manage all orders in the system |
| **Provider Management** | Monitor and manage delivery providers |
| **Checkpoint Monitoring** | Track warehouse and checkpoint status |
| **Failure Resolution** | Handle delivery failures and stashed parcels |
| **System Settings** | Configure platform parameters |

### Platform Features
| Feature | Description |
|---------|-------------|
| **Multi-Hop Routing** | Automatic route planning with up to 7 hops |
| **Vehicle-Aware Planning** | Matches vehicle capabilities to segment distances |
| **Dynamic Fuel Pricing** | Time-based cost fluctuations |
| **WebSocket Updates** | Real-time push notifications |
| **Responsive Design** | Works on desktop and mobile |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   Requester     │     Admin       │    Provider     │    Flutter App        │
│   (Next.js)     │   (Next.js)     │   (Next.js)     │    (Mobile)           │
└────────┬────────┴────────┬────────┴────────┬────────┴───────────┬───────────┘
         │                 │                 │                     │
         └─────────────────┴─────────────────┴─────────────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │       HTTPS / WebSocket     │
                     └──────────────┬──────────────┘
                                    │
┌───────────────────────────────────┴─────────────────────────────────────────┐
│                            BACKEND LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    FastAPI Server (Port 8001)                        │    │
│  ├─────────────────────┬─────────────────────┬─────────────────────────┤    │
│  │   REST API          │   WebSocket         │   Background Tasks      │    │
│  │   Endpoints         │   Handler           │   (Future)              │    │
│  └─────────────────────┴─────────────────────┴─────────────────────────┘    │
│                                    │                                         │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐  │
│  │                         CORE MODULES                                   │  │
│  ├─────────────────┬─────────────────┬─────────────────┬────────────────┤  │
│  │  Routing Engine │   Data Store    │   Synth Engine  │   Schemas      │  │
│  │  (NetworkX)     │   (In-Memory)   │   (Generation)  │   (Pydantic)   │  │
│  └─────────────────┴─────────────────┴─────────────────┴────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴─────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                          Google Maps API                                     │
│                    (Geocoding & Map Visualization)                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 16 (App Router) | Web interface for all user roles |
| Backend | FastAPI | REST API + WebSocket server |
| Routing | NetworkX | Graph-based route planning |
| Validation | Pydantic | Request/response schema validation |
| UI Components | shadcn/ui + Radix | Modern, accessible component library |
| Maps | Google Maps API | Route visualization |
| State | In-Memory (Dict) | Order and driver storage |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.10 | React framework with App Router |
| React | 19.0.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| shadcn/ui | Latest | Component library |
| Radix UI | Various | Accessible primitives |
| Lucide React | 0.454.0 | Icon library |
| Recharts | 2.15.0 | Charts and visualizations |
| date-fns | 4.1.0 | Date manipulation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Runtime |
| FastAPI | 0.115.2 | Web framework |
| Uvicorn | 0.30.1 | ASGI server |
| NetworkX | 3.2.1 | Graph algorithms |
| Pydantic | 2.9.2 | Data validation |

### Mobile (Planned)
| Technology | Purpose |
|------------|---------|
| Flutter | Cross-platform mobile app |
| Dart | Flutter programming language |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.10+ (for backend)
- **pnpm** (recommended) or npm (for package management)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd "version 2"
```

#### 2. Backend Setup
```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows)
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8001
```

#### 3. Frontend Setup
```powershell
# From project root
cd "version 2"

# Install dependencies
pnpm install

# Create environment file
echo "NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001" > .env.local
echo "NEXT_PUBLIC_WS_BASE=ws://127.0.0.1:8001" >> .env.local

# Start development server
pnpm dev
```

#### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8001/docs
- **Backend OpenAPI**: http://localhost:8001/openapi.json

---

## 👥 User Roles

### 1. Requester (Customer)
Users who need to send parcels from one location to another.

**Access**: `/requester/*`

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/requester` | Overview of active orders and quick actions |
| Create Order | `/requester/create` | Form to create new delivery orders |
| My Orders | `/requester/orders` | List of all orders with status |
| Track Parcel | `/requester/track` | Real-time tracking by order ID |

### 2. Provider (Delivery Partner)
Delivery partners who fulfill segments of deliveries.

**Access**: `/provider/*`

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/provider` | Provider overview and stats |
| Available | `/provider/available` | Segments available for pickup |
| Deliveries | `/provider/deliveries` | Current active deliveries |
| History | `/provider/history` | Completed delivery history |

### 3. Administrator
Platform administrators who manage the entire system.

**Access**: `/admin/*`

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | System-wide analytics and KPIs |
| Orders | `/admin/orders` | All orders management |
| Providers | `/admin/providers` | Provider management |
| Checkpoints | `/admin/checkpoints` | Warehouse/checkpoint status |
| Failures | `/admin/failures` | Failure resolution queue |
| Settings | `/admin/settings` | Platform configuration |

---

## 📡 API Reference

### Base URL
```
http://localhost:8001
```

### Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

#### List Districts
```http
GET /catalog/districts
```
**Response:** Array of 38 Tamil Nadu districts with coordinates.

#### List Warehouses
```http
GET /catalog/warehouses
```
**Response:** Array of all warehouses with location and capacity.

#### List Drivers
```http
GET /catalog/drivers
```
**Response:** Array of all generated drivers with vehicle info.

#### Get Map Configuration
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

#### Get Route Quote
```http
POST /quote
Content-Type: application/json

{
  "origin_district": "chennai",
  "destination_district": "madurai",
  "package_type": "general",
  "priority": "cost",
  "max_hops": 7
}
```
**Response:** Route plan with checkpoints, segments, ETA, and cost.

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "origin_district": "chennai",
  "destination_district": "coimbatore",
  "priority": "time"
}
```
**Response:** Created order with ID and route plan.

#### Get Order
```http
GET /orders/{order_id}
```

#### List All Orders
```http
GET /orders
```

#### Update Order Status
```http
PATCH /orders/{order_id}/status?status=in_transit
```

#### WebSocket Connection
```
WS /ws
```
Connects to real-time update stream.

---

## 📊 Data Models

### Order
```typescript
interface Order {
  id: string;
  requesterId: string;
  requesterName: string;
  origin: Checkpoint;
  destination: Checkpoint;
  parcel: Parcel;
  preference: "FAST" | "COST";
  status: "pending" | "route_planning" | "in_transit" | "delivered" | "failed";
  estimatedCost: number;
  actualCost: number;
  estimatedDelivery: string;
  createdAt: string;
  segments: Segment[];
}
```

### Segment
```typescript
interface Segment {
  id: string;
  orderId: string;
  sequence: number;
  from: Checkpoint;
  to: Checkpoint;
  distance: number;      // km
  estimatedDuration: number;  // minutes
  price: number;
  status: "pending" | "assigned" | "in_progress" | "completed" | "failed";
  providerId: string | null;
  providerName: string | null;
  startedAt: string | null;
  completedAt: string | null;
}
```

### Checkpoint
```typescript
interface Checkpoint {
  id: string;
  name: string;
  type: "warehouse" | "dropbox" | "partner_store" | "locker" | "gas_station";
  lat: number;
  lng: number;
  city: string;
  capacity: number;
  available: boolean;
}
```

### Provider
```typescript
interface Provider {
  id: string;
  name: string;
  rating: number;
  completedSegments: number;
  activeSegments: number;
  vehicleType: "bike" | "car" | "van" | "truck";
  availableCapacity: number;
  currentLocation: { lat: number; lng: number } | null;
  isOnline: boolean;
}
```

### Vehicle Types
| Type | Speed (km/h) | Cost (₹/km) | Max Distance (km) | Handling Time (min) |
|------|--------------|-------------|-------------------|---------------------|
| Bike | 35 | ₹4.00 | 80 | 8 |
| Auto | 40 | ₹6.00 | 120 | 10 |
| Minivan | 55 | ₹8.50 | 220 | 12 |
| Truck | 45 | ₹12.00 | 400+ | 15 |

---

## 🧮 Routing Algorithm

### Overview
The routing engine uses **NetworkX** to build a sparse graph of warehouses and find optimal multi-hop paths.

### Graph Construction
1. Each district has 2 warehouses (nodes)
2. Edges connect to k-nearest neighbors (k=6)
3. Edge weights based on Haversine distance
4. Seed-based variation for different route options

### Path Finding
```python
def plan_route(
    graph: nx.Graph,
    warehouses: List[Warehouse],
    drivers: List[Driver],
    priority: Priority,        # "cost" or "time"
    origin_district: str,
    destination_district: str,
    max_hops: int = 7,
    seed: int = 2025,
    preferred_vehicle: Optional[str] = None,
) -> Dict:
```

### Cost Calculation
```
segment_cost = distance_km × vehicle_cost_per_km × fuel_index + base_handling_fee
```

### Fuel Price Index
Fluctuates based on:
- Hour of day (sinusoidal oscillation)
- Day of year (seasonal variation)
- Random demand noise

---

## 🔄 Real-Time Updates

### WebSocket Events

| Event Type | Description | Payload |
|------------|-------------|---------|
| `connected` | Initial connection | `{ orders_count, drivers_count, warehouses_count }` |
| `order_created` | New order placed | `{ order_id, origin, destination, total_cost, segments }` |
| `order_status_changed` | Status update | `{ order_id, status }` |
| `pong` | Heartbeat response | `{ timestamp }` |
| `subscribed` | Topic subscription confirmed | `{ topic }` |

### Frontend Hook
```typescript
import { useRealtime } from '@/hooks/use-realtime';

function MyComponent() {
  const { isConnected, lastUpdate, connectionType } = useRealtime({
    onOrderCreated: (data) => console.log('New order:', data),
    onOrderStatusChanged: (data) => console.log('Status changed:', data),
    enablePolling: true,
    pollingInterval: 30000,
  });
}
```

---

## 📁 Project Structure

```
version 2/
├── app/                          # Next.js App Router pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── admin/                    # Admin portal
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── checkpoints/          # Checkpoint management
│   │   ├── failures/             # Failure resolution
│   │   ├── orders/               # Order management
│   │   ├── providers/            # Provider management
│   │   └── settings/             # System settings
│   ├── provider/                 # Provider portal
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── available/            # Available segments
│   │   ├── deliveries/           # Active deliveries
│   │   └── history/              # Delivery history
│   └── requester/                # Requester portal
│       ├── layout.tsx
│       ├── page.tsx              # Dashboard
│       ├── create/               # Create order
│       ├── orders/               # Order list
│       └── track/                # Parcel tracking
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app & endpoints
│   │   ├── data.py               # Static data (districts, vehicles)
│   │   ├── routing.py            # Route planning algorithm
│   │   ├── schemas.py            # Pydantic models
│   │   └── synth.py              # Data generation
│   ├── requirements.txt
│   └── README.md
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── admin/                    # Admin-specific components
│   ├── dashboard/                # Dashboard components
│   ├── orders/                   # Order-related components
│   ├── provider/                 # Provider components
│   ├── tracking/                 # Tracking components
│   └── visualizations/           # Charts and maps
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts
│   ├── use-realtime.ts
│   └── use-toast.ts
├── lib/                          # Utilities
│   ├── mock-data.ts              # Frontend mock data
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
├── styles/                       # Additional styles
├── flutter_client/               # Mobile app (planned)
├── docs/                         # Documentation
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.ts
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001
NEXT_PUBLIC_WS_BASE=ws://127.0.0.1:8001

# Google Maps (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Backend Configuration

Edit `backend/app/data.py`:

```python
DEFAULT_WAREHOUSES_PER_DISTRICT = 2
DEFAULT_DRIVERS_PER_DISTRICT = 20
```

---

## 🚢 Deployment

### Production Build

#### Frontend
```bash
pnpm build
pnpm start
```

#### Backend
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
```

### Docker (Future)
```dockerfile
# Dockerfile examples to be added
```

### Environment Recommendations
- **Frontend**: Vercel, Netlify, or any Node.js hosting
- **Backend**: AWS EC2, Google Cloud Run, or Railway
- **Database**: PostgreSQL (when persistent storage is needed)
- **Cache**: Redis (for session management)

---

## 🗺️ Future Roadmap

### Phase 1: Core Enhancements
- [ ] PostgreSQL database integration
- [ ] User authentication (NextAuth.js)
- [ ] Provider mobile app (Flutter)
- [ ] Push notifications

### Phase 2: Advanced Features
- [ ] Real GPS tracking integration
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

### Phase 3: Scale & Optimization
- [ ] Redis caching layer
- [ ] Microservices architecture
- [ ] Machine learning for route optimization
- [ ] Multi-tenant support

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 👥 Contributors

- **Development Team** - Full-stack implementation

---

## 📞 Support

For issues and feature requests, please create an issue in the repository.
