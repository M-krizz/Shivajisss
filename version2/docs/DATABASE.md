# 🗄️ Database Schema Documentation

## Multi-Modal Logistics Platform - Data Models

This document describes the data models used in the platform. Currently, data is stored in-memory. This schema serves as the blueprint for future database implementation.

---

## Table of Contents

1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Core Entities](#core-entities)
3. [Supporting Entities](#supporting-entities)
4. [Enumerations](#enumerations)
5. [Indexes & Constraints](#indexes--constraints)
6. [Sample Data](#sample-data)

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   District  │       │  Warehouse  │       │   Driver    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ code (PK)   │◄──────│ district_   │◄──────│ district_   │
│ name        │       │   code (FK) │       │   code (FK) │
│ lat         │       │ id (PK)     │       │ id (PK)     │
│ lon         │       │ name        │       │ name        │
└─────────────┘       │ lat, lon    │       │ vehicle_type│
                      │ capacity    │       │ rating      │
                      └──────┬──────┘       └──────┬──────┘
                             │                     │
                             ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Order    │       │   Segment   │       │ CustodyEvent│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ order_id(FK)│◄──────│ order_id(FK)│
│ requester_id│       │ id (PK)     │       │ segment_id  │
│ status      │       │ from_id(FK) │       │ id (PK)     │
│ origin_id   │───────│ to_id (FK)  │       │ type        │
│ dest_id     │       │ provider_id │───────│ timestamp   │
│ preference  │       │ status      │       │ checkpoint  │
│ created_at  │       │ distance    │       │ verified    │
└─────────────┘       └─────────────┘       └─────────────┘
       │
       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Parcel    │       │RouteOption  │       │FailureEvent │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ order_id(FK)│       │ order_id(FK)│       │ order_id(FK)│
│ description │       │ hops        │       │ segment_id  │
│ weight      │       │ total_dist  │       │ type        │
│ dimensions  │       │ est_cost    │       │ description │
└─────────────┘       └─────────────┘       │ resolved    │
                                            └─────────────┘
```

---

## Core Entities

### 1. District

Represents a Tamil Nadu district as a geographic unit.

```sql
CREATE TABLE districts (
    code        VARCHAR(50) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    lat         DECIMAL(10, 6) NOT NULL,
    lon         DECIMAL(10, 6) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**TypeScript Interface:**
```typescript
interface District {
  code: string;      // "chennai"
  name: string;      // "Chennai"
  lat: number;       // 13.0827
  lon: number;       // 80.2707
}
```

**Sample Data:**
| code | name | lat | lon |
|------|------|-----|-----|
| chennai | Chennai | 13.0827 | 80.2707 |
| coimbatore | Coimbatore | 11.0168 | 76.9558 |
| madurai | Madurai | 9.9252 | 78.1198 |

---

### 2. Warehouse (Checkpoint)

Physical locations for parcel handoffs.

```sql
CREATE TABLE warehouses (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    district_code   VARCHAR(50) REFERENCES districts(code),
    type            VARCHAR(50) DEFAULT 'warehouse',
    lat             DECIMAL(10, 6) NOT NULL,
    lon             DECIMAL(10, 6) NOT NULL,
    capacity        INTEGER DEFAULT 500,
    available       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouse_district ON warehouses(district_code);
CREATE INDEX idx_warehouse_available ON warehouses(available);
```

**TypeScript Interface:**
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

**Checkpoint Types:**
| Type | Description |
|------|-------------|
| warehouse | Main storage facility |
| dropbox | Self-service parcel locker |
| partner_store | Third-party retail location |
| locker | Automated pickup locker |
| gas_station | Fuel station pickup point |

---

### 3. Driver (Provider)

Delivery partners with vehicles.

```sql
CREATE TABLE drivers (
    id                  VARCHAR(50) PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    district_code       VARCHAR(50) REFERENCES districts(code),
    vehicle_type        VARCHAR(20) NOT NULL,
    rating              DECIMAL(2, 1) DEFAULT 4.0,
    completed_trips     INTEGER DEFAULT 0,
    is_available        BOOLEAN DEFAULT TRUE,
    current_warehouse_id VARCHAR(50) REFERENCES warehouses(id),
    phone               VARCHAR(20),
    email               VARCHAR(100),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_driver_district ON drivers(district_code);
CREATE INDEX idx_driver_vehicle ON drivers(vehicle_type);
CREATE INDEX idx_driver_available ON drivers(is_available);
```

**TypeScript Interface:**
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

---

### 4. Order

A delivery request from requester.

```sql
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id        VARCHAR(50) NOT NULL,
    requester_name      VARCHAR(200),
    origin_id           VARCHAR(50) REFERENCES warehouses(id),
    destination_id      VARCHAR(50) REFERENCES warehouses(id),
    origin_district     VARCHAR(50) REFERENCES districts(code),
    destination_district VARCHAR(50) REFERENCES districts(code),
    preference          VARCHAR(10) DEFAULT 'COST',
    status              VARCHAR(20) DEFAULT 'pending',
    estimated_cost      DECIMAL(10, 2),
    actual_cost         DECIMAL(10, 2),
    estimated_delivery  TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_requester ON orders(requester_id);
CREATE INDEX idx_order_created ON orders(created_at DESC);
```

**TypeScript Interface:**
```typescript
interface Order {
  id: string;
  requesterId: string;
  requesterName: string;
  origin: Checkpoint;
  destination: Checkpoint;
  parcel: Parcel;
  preference: "FAST" | "COST";
  status: OrderStatus;
  estimatedCost: number;
  actualCost: number;
  estimatedDelivery: string;
  createdAt: string;
  segments: Segment[];
}
```

---

### 5. Parcel

Physical item being delivered.

```sql
CREATE TABLE parcels (
    id              VARCHAR(50) PRIMARY KEY,
    order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
    description     VARCHAR(500),
    weight_kg       DECIMAL(6, 2) NOT NULL,
    length_cm       DECIMAL(6, 2),
    width_cm        DECIMAL(6, 2),
    height_cm       DECIMAL(6, 2),
    fragile         BOOLEAN DEFAULT FALSE,
    value_inr       DECIMAL(12, 2),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parcel_order ON parcels(order_id);
```

**TypeScript Interface:**
```typescript
interface Parcel {
  id: string;
  orderId: string;
  description: string;
  weight: number;
  dimensions: { l: number; w: number; h: number };
}
```

---

### 6. Segment

A single hop in the delivery route.

```sql
CREATE TABLE segments (
    id                  VARCHAR(50) PRIMARY KEY,
    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,
    sequence            INTEGER NOT NULL,
    from_checkpoint_id  VARCHAR(50) REFERENCES warehouses(id),
    to_checkpoint_id    VARCHAR(50) REFERENCES warehouses(id),
    distance_km         DECIMAL(8, 2) NOT NULL,
    estimated_duration  INTEGER NOT NULL, -- minutes
    price_inr           DECIMAL(10, 2) NOT NULL,
    vehicle_type        VARCHAR(20),
    status              VARCHAR(20) DEFAULT 'pending',
    provider_id         VARCHAR(50) REFERENCES drivers(id),
    provider_name       VARCHAR(200),
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_segment_order ON segments(order_id);
CREATE INDEX idx_segment_provider ON segments(provider_id);
CREATE INDEX idx_segment_status ON segments(status);
```

**TypeScript Interface:**
```typescript
interface Segment {
  id: string;
  orderId: string;
  sequence: number;
  from: Checkpoint;
  to: Checkpoint;
  distance: number;
  estimatedDuration: number;
  price: number;
  status: SegmentStatus;
  providerId: string | null;
  providerName: string | null;
  startedAt: string | null;
  completedAt: string | null;
}
```

---

## Supporting Entities

### 7. Custody Event

Tracks parcel handoffs between entities.

```sql
CREATE TABLE custody_events (
    id                  VARCHAR(50) PRIMARY KEY,
    order_id            UUID REFERENCES orders(id),
    segment_id          VARCHAR(50) REFERENCES segments(id),
    parcel_id           VARCHAR(50) REFERENCES parcels(id),
    type                VARCHAR(20) NOT NULL,
    from_entity_id      VARCHAR(50),
    from_entity_name    VARCHAR(200),
    to_entity_id        VARCHAR(50) NOT NULL,
    to_entity_name      VARCHAR(200) NOT NULL,
    checkpoint_id       VARCHAR(50) REFERENCES warehouses(id),
    timestamp           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes               TEXT,
    verified            BOOLEAN DEFAULT FALSE,
    photo_url           VARCHAR(500)
);

CREATE INDEX idx_custody_order ON custody_events(order_id);
CREATE INDEX idx_custody_timestamp ON custody_events(timestamp DESC);
```

**Custody Event Types:**
| Type | Description |
|------|-------------|
| pickup | Initial pickup from origin |
| handoff | Transfer between providers |
| stash | Emergency storage at checkpoint |
| recovery | Retrieval from stash |
| delivery | Final delivery to recipient |

---

### 8. Failure Event

Records delivery failures for resolution.

```sql
CREATE TABLE failure_events (
    id              VARCHAR(50) PRIMARY KEY,
    order_id        UUID REFERENCES orders(id),
    segment_id      VARCHAR(50) REFERENCES segments(id),
    type            VARCHAR(50) NOT NULL,
    description     TEXT,
    timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved        BOOLEAN DEFAULT FALSE,
    resolution      TEXT,
    stashed_at_id   VARCHAR(50) REFERENCES warehouses(id),
    recovered_at    TIMESTAMP,
    resolved_by     VARCHAR(50),
    resolved_at     TIMESTAMP
);

CREATE INDEX idx_failure_order ON failure_events(order_id);
CREATE INDEX idx_failure_resolved ON failure_events(resolved);
```

**Failure Types:**
| Type | Description |
|------|-------------|
| provider_unavailable | No provider for segment |
| vehicle_breakdown | Vehicle mechanical issue |
| weather | Adverse weather conditions |
| checkpoint_closed | Destination closed |
| address_not_found | Invalid address |
| recipient_unavailable | Recipient not present |
| other | Miscellaneous issues |

---

### 9. Route Option

Stores calculated route alternatives.

```sql
CREATE TABLE route_options (
    id              VARCHAR(50) PRIMARY KEY,
    order_id        UUID REFERENCES orders(id),
    hops            INTEGER NOT NULL,
    total_distance  DECIMAL(10, 2) NOT NULL,
    total_duration  INTEGER NOT NULL, -- minutes
    estimated_cost  DECIMAL(10, 2) NOT NULL,
    recommendation  VARCHAR(10), -- FAST or COST
    selected        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_route_order ON route_options(order_id);
```

---

### 10. Vehicle Profile

Vehicle capabilities reference table.

```sql
CREATE TABLE vehicle_profiles (
    type                VARCHAR(20) PRIMARY KEY,
    speed_kmph          DECIMAL(5, 2) NOT NULL,
    cost_per_km         DECIMAL(6, 2) NOT NULL,
    handling_time_min   DECIMAL(5, 2) NOT NULL,
    max_distance_km     DECIMAL(8, 2) NOT NULL,
    emission_factor     DECIMAL(4, 2) NOT NULL,
    max_weight_kg       DECIMAL(8, 2),
    description         VARCHAR(200)
);
```

**Default Data:**
| type | speed_kmph | cost_per_km | max_distance_km |
|------|------------|-------------|-----------------|
| bike | 35.0 | 4.00 | 80 |
| auto | 40.0 | 6.00 | 120 |
| minivan | 55.0 | 8.50 | 220 |
| truck | 45.0 | 12.00 | 400 |

---

## Enumerations

### Order Status
```typescript
type OrderStatus = 
  | "pending"        // Order created, awaiting processing
  | "route_planning" // Calculating optimal route
  | "in_transit"     // Parcel in transit
  | "delivered"      // Successfully delivered
  | "failed";        // Delivery failed
```

### Segment Status
```typescript
type SegmentStatus = 
  | "pending"     // Not yet started
  | "assigned"    // Provider assigned
  | "in_progress" // Currently in transit
  | "completed"   // Successfully completed
  | "failed";     // Segment failed
```

### Delivery Preference
```typescript
type DeliveryPreference = 
  | "FAST"  // Optimize for speed
  | "COST"; // Optimize for cost
```

### Vehicle Type
```typescript
type VehicleType = 
  | "bike"    // Two-wheeler
  | "auto"    // Three-wheeler
  | "minivan" // Small cargo van
  | "truck";  // Large truck
```

---

## Indexes & Constraints

### Performance Indexes

```sql
-- Order queries
CREATE INDEX idx_order_status_date ON orders(status, created_at DESC);
CREATE INDEX idx_order_districts ON orders(origin_district, destination_district);

-- Segment queries
CREATE INDEX idx_segment_order_seq ON segments(order_id, sequence);
CREATE INDEX idx_segment_provider_status ON segments(provider_id, status);

-- Driver availability
CREATE INDEX idx_driver_available_district ON drivers(is_available, district_code);

-- Warehouse location
CREATE INDEX idx_warehouse_location ON warehouses USING GIST (
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)
);  -- PostGIS extension
```

### Foreign Key Constraints

All foreign keys use `ON DELETE CASCADE` for order-related tables to maintain data integrity when orders are removed.

### Unique Constraints

```sql
ALTER TABLE segments 
    ADD CONSTRAINT unique_segment_order_seq 
    UNIQUE (order_id, sequence);

ALTER TABLE parcels 
    ADD CONSTRAINT unique_parcel_order 
    UNIQUE (order_id);
```

---

## Sample Data

### Sample Order Flow

```sql
-- 1. Create order
INSERT INTO orders (id, requester_id, origin_district, destination_district, preference, status)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'REQ-001', 'chennai', 'madurai', 'COST', 'pending');

-- 2. Create parcel
INSERT INTO parcels (id, order_id, description, weight_kg)
VALUES ('PCL-001', '550e8400-e29b-41d4-a716-446655440000', 'Electronics', 2.5);

-- 3. Create segments
INSERT INTO segments (id, order_id, sequence, from_checkpoint_id, to_checkpoint_id, distance_km, estimated_duration, price_inr)
VALUES 
    ('SEG-001', '550e8400-e29b-41d4-a716-446655440000', 1, 'wh-chennai-001', 'wh-trichy-001', 326.4, 356, 2842.50),
    ('SEG-002', '550e8400-e29b-41d4-a716-446655440000', 2, 'wh-trichy-001', 'wh-madurai-001', 142.8, 178, 1248.30);

-- 4. Create custody events
INSERT INTO custody_events (id, order_id, segment_id, type, to_entity_id, to_entity_name, checkpoint_id)
VALUES 
    ('CUS-001', '550e8400-e29b-41d4-a716-446655440000', 'SEG-001', 'pickup', 'DRV-001', 'Rajesh Kumar', 'wh-chennai-001');
```

---

## Migration Notes

When migrating from in-memory to PostgreSQL:

1. **UUID Generation**: Use `gen_random_uuid()` for order IDs
2. **Timestamps**: Use `TIMESTAMP WITH TIME ZONE` for consistency
3. **Geospatial**: Consider PostGIS extension for distance calculations
4. **Indexing**: Add indexes based on query patterns
5. **Partitioning**: Consider partitioning orders table by `created_at` for large datasets
