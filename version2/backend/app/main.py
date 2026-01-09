from fastapi import FastAPI, WebSocket, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from . import schemas

app = FastAPI()

# In-memory user store (replace with DB in production)
users_db = {}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

SECRET_KEY = "supersecretkey"  # Change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(email: str, password: str):
    user = users_db.get(email)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = users_db.get(email)
    if user is None:
        raise credentials_exception
    return user

# --- AUTH ENDPOINTS ---
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_id = len(users_db) + 1
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "role": user.role,
        "hashed_password": hashed_password,
    }
    return {"id": user_id, "email": user.email, "role": user.role}

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}
from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Set

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from . import synth
from .data import (
    DEFAULT_DRIVERS_PER_DISTRICT,
    DEFAULT_WAREHOUSES_PER_DISTRICT,
    DISTRICTS,
    OSM_ATTRIBUTION,
    OSM_TILE_URL,
    TAMIL_NADU_BOUNDS,
)
from .routing import RouteNotFound, build_graph, plan_route
from .schemas import OrderOut, OrderRequest, QuoteRequest, RoutePlanOut, WarehouseOut

app = FastAPI(title="Distributed Logistics Orchestrator", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- In-memory state -------------------------------------------------
WAREHOUSES = synth.generate_warehouses(per_district=DEFAULT_WAREHOUSES_PER_DISTRICT)
DRIVERS = synth.generate_drivers(WAREHOUSES, per_district=DEFAULT_DRIVERS_PER_DISTRICT)
GRAPH = build_graph(WAREHOUSES)
ORDERS: Dict[str, OrderOut] = {}

# ---------- WebSocket connections for real-time updates ---------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)
        for conn in disconnected:
            self.active_connections.discard(conn)


manager = ConnectionManager()


async def broadcast_update(event_type: str, data: dict):
    """Broadcast an update to all connected clients."""
    await manager.broadcast({
        "type": event_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    })


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/catalog/districts")
def list_districts() -> List[Dict]:
    return DISTRICTS


@app.get("/catalog/warehouses", response_model=List[WarehouseOut])
def list_warehouses() -> List[WarehouseOut]:
    return [WarehouseOut(**w.__dict__) for w in WAREHOUSES]


@app.get("/catalog/drivers")
def list_drivers():
    return [d.__dict__ for d in DRIVERS]


@app.get("/map/config")
def map_config():
    return {
        "tile_url": OSM_TILE_URL,
        "attribution": OSM_ATTRIBUTION,
        "bounds": TAMIL_NADU_BOUNDS,
        "default_zoom": 7,
    }


@app.post("/quote", response_model=RoutePlanOut)
def quote(payload: QuoteRequest):
    try:
        plan = plan_route(
            graph=GRAPH,
            warehouses=WAREHOUSES,
            drivers=DRIVERS,
            priority=payload.priority,
            origin_district=payload.origin_district,
            destination_district=payload.destination_district,
            max_hops=payload.max_hops,
            seed=payload.seed or 2025,
            preferred_vehicle=payload.preferred_vehicle,
        )
    except RouteNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=str(exc))

    return plan


@app.post("/orders", response_model=OrderOut)
async def create_order(payload: OrderRequest):
    plan = quote(QuoteRequest(**payload.dict()))
    order_id = str(uuid.uuid4())
    order = OrderOut(id=order_id, request=payload, plan=plan)
    ORDERS[order_id] = order
    # Broadcast new order event - plan is a dict from plan_route()
    await broadcast_update("order_created", {
        "order_id": order_id,
        "origin": payload.origin_district,
        "destination": payload.destination_district,
        "total_cost": plan["total_cost_inr"],
        "segments": len(plan["segments"])
    })
    return order


@app.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: str):
    if order_id not in ORDERS:
        raise HTTPException(status_code=404, detail="Order not found")
    return ORDERS[order_id]


@app.get("/orders")
def list_orders():
    return list(ORDERS.values())


@app.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    """Update order status and broadcast the change."""
    if order_id not in ORDERS:
        raise HTTPException(status_code=404, detail="Order not found")
    order = ORDERS[order_id]
    order.status = status
    await broadcast_update("order_status_changed", {
        "order_id": order_id,
        "status": status
    })
    return {"message": "Status updated", "order_id": order_id, "status": status}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await manager.connect(websocket)
    try:
        # Send initial state
        await websocket.send_json({
            "type": "connected",
            "data": {
                "orders_count": len(ORDERS),
                "drivers_count": len(DRIVERS),
                "warehouses_count": len(WAREHOUSES)
            },
            "timestamp": datetime.utcnow().isoformat()
        })
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
            elif message.get("type") == "subscribe":
                # Client can subscribe to specific events
                await websocket.send_json({
                    "type": "subscribed",
                    "data": {"topic": message.get("topic", "all")},
                    "timestamp": datetime.utcnow().isoformat()
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
