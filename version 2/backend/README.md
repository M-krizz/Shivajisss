# Distributed Logistics Orchestrator – Backend (FastAPI)

A simulation-first backend for a distributed, checkpoint-based logistics network over Tamil Nadu. It synthesizes warehouses, driver profiles, and vehicle-aware routes, exposes quote/order APIs, and serves OpenStreetMap/Leaflet-friendly map config.

## Features
- Tamil Nadu–scoped synthetic network: 2 warehouses and 20 drivers (bike/auto/minivan/truck) per district.
- Vehicle-aware routing with cost vs. time priority, fuel-price (time-varying) multiplier, and hop-limited paths.
- Clear custody via checkpoint list and segment-by-segment driver/vehicle assignments.
- OpenStreetMap/Leaflet-ready map config endpoint (`/map/config`) and geo-friendly warehouse coordinates.
- Simple order lifecycle kept in-memory for demo purposes.

## API surface (FastAPI)
- `GET /health` – service liveness.
- `GET /catalog/districts` – static Tamil Nadu district catalog.
- `GET /catalog/warehouses` – generated hubs with coordinates.
- `GET /catalog/drivers` – generated driver profiles.
- `GET /map/config` – OSM tile URL + Tamil Nadu bounds for Leaflet/Map components.
- `POST /quote` – plan a route with payload:
  ```json
  {
    "origin_district": "chennai",
    "destination_district": "madurai",
    "package_type": "general",
    "priority": "cost", // or "time"
    "max_hops": 7
  }
  ```
  Response returns checkpoints, segments, ETA, cost, driver & vehicle per hop.
- `POST /orders` – create an order (wraps `/quote`) and returns `id` + plan.
- `GET /orders/{id}` – fetch a stored order.
- `GET /orders` – list all stored orders.

## Quickstart (no Docker)
1. From the repo root:
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
2. Open the docs at http://localhost:8000/docs.
3. Try a quote:
   ```powershell
   curl -X POST http://localhost:8000/quote -H "Content-Type: application/json" -d '{"origin_district":"chennai","destination_district":"madurai","priority":"time"}'
   ```

## Notes
- Data is generated deterministically at startup; tweak seeds in `app/data.py` and `app/synth.py` if desired.
- Costs fluctuate with a pseudo real-time fuel index (hour/day based) to mimic live pricing pressure.
- No persistence layer is wired yet; orders live in-memory only.
- Extendibility: swap the synthetic graph in `app/routing.py` with real GTFS/OSM edges, or pipe drivers from a DB/telemetry feed.
