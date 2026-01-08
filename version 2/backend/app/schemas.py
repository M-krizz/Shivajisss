from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

Priority = Literal["cost", "time"]


class WarehouseOut(BaseModel):
    id: str
    name: str
    district_code: str
    lat: float
    lon: float


class DriverOut(BaseModel):
    id: str
    name: str
    district_code: str
    vehicle_type: str
    warehouse_id: str


class RouteSegmentOut(BaseModel):
    from_: WarehouseOut = Field(..., alias="from")
    to: WarehouseOut
    vehicle_type: str
    driver: DriverOut
    distance_km: float
    eta_minutes: float
    cost_inr: float
    handoff_checkpoint: str

    class Config:
        populate_by_name = True


class RoutePlanOut(BaseModel):
    priority: Priority
    fuel_index: float
    total_cost_inr: float
    total_eta_minutes: float
    total_distance_km: float
    checkpoints: list[str]
    segments: list[RouteSegmentOut]


class QuoteRequest(BaseModel):
    origin_district: str
    destination_district: str
    package_type: str = "general"
    priority: Priority = "cost"
    preferred_vehicle: Optional[str] = None
    max_hops: int = 7
    seed: Optional[int] = None


class OrderRequest(QuoteRequest):
    customer_name: str = "Walk-in"
    notes: Optional[str] = None


class OrderOut(BaseModel):
    id: str
    status: Literal["created", "in_progress", "delivered"] = "created"
    request: OrderRequest
    plan: RoutePlanOut
