from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Dict, List, Tuple

from .data import (
    DEFAULT_DRIVERS_PER_DISTRICT,
    DEFAULT_RANDOM_SEED,
    DEFAULT_WAREHOUSES_PER_DISTRICT,
    DISTRICTS,
    VEHICLE_TYPES,
)


@dataclass
class Warehouse:
    id: str
    name: str
    district_code: str
    lat: float
    lon: float


@dataclass
class Driver:
    id: str
    name: str
    district_code: str
    vehicle_type: str
    warehouse_id: str


@dataclass
class VehicleAvailability:
    district_code: str
    counts: Dict[str, int]


def haversine_km(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    """Compute the great-circle distance between two points (lat, lon)."""
    lat1, lon1 = a
    lat2, lon2 = b
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)

    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(h))


def _rand_offset(rng: random.Random) -> Tuple[float, float]:
    # Small jitter ~11km max each axis (0.1 degrees roughly)
    return rng.uniform(-0.12, 0.12), rng.uniform(-0.12, 0.12)


def generate_warehouses(
    seed: int = DEFAULT_RANDOM_SEED, per_district: int = DEFAULT_WAREHOUSES_PER_DISTRICT
) -> List[Warehouse]:
    rng = random.Random(seed)
    warehouses: List[Warehouse] = []
    for district in DISTRICTS:
        for i in range(per_district):
            lat_off, lon_off = _rand_offset(rng)
            warehouses.append(
                Warehouse(
                    id=f"WH-{district['code']}-{i+1}",
                    name=f"{district['name']} Hub {i+1}",
                    district_code=district["code"],
                    lat=district["lat"] + lat_off,
                    lon=district["lon"] + lon_off,
                )
            )
    return warehouses


def generate_drivers(
    warehouses: List[Warehouse],
    seed: int = DEFAULT_RANDOM_SEED + 99,
    per_district: int = DEFAULT_DRIVERS_PER_DISTRICT,
) -> List[Driver]:
    rng = random.Random(seed)
    drivers: List[Driver] = []
    warehouses_by_district: Dict[str, List[Warehouse]] = {}
    for wh in warehouses:
        warehouses_by_district.setdefault(wh.district_code, []).append(wh)

    vehicle_types = list(VEHICLE_TYPES.keys())
    weights = [0.28, 0.26, 0.26, 0.20]  # bike, auto, minivan, truck

    for district in DISTRICTS:
        wh_list = warehouses_by_district[district["code"]]

        # Guarantee every district can service long-haul hops.
        mandatory: List[str] = ["truck", "minivan"]
        local_drivers: List[Driver] = []

        for idx, vehicle in enumerate(mandatory, start=1):
            home_wh = rng.choice(wh_list)
            local_drivers.append(
                Driver(
                    id=f"DRV-{district['code']}-{idx}",
                    name=f"{district['name']} Driver {idx}",
                    district_code=district["code"],
                    vehicle_type=vehicle,
                    warehouse_id=home_wh.id,
                )
            )

        remaining = max(per_district - len(mandatory), 0)
        for i in range(remaining):
            vehicle = rng.choices(vehicle_types, weights=weights, k=1)[0]
            home_wh = rng.choice(wh_list)
            idx = len(local_drivers) + 1
            local_drivers.append(
                Driver(
                    id=f"DRV-{district['code']}-{idx}",
                    name=f"{district['name']} Driver {idx}",
                    district_code=district["code"],
                    vehicle_type=vehicle,
                    warehouse_id=home_wh.id,
                )
            )

        drivers.extend(local_drivers)
    return drivers


def compute_vehicle_availability(drivers: List[Driver]) -> Dict[str, VehicleAvailability]:
    availability: Dict[str, VehicleAvailability] = {}
    for drv in drivers:
        if drv.district_code not in availability:
            availability[drv.district_code] = VehicleAvailability(district_code=drv.district_code, counts={})
        counts = availability[drv.district_code].counts
        counts[drv.vehicle_type] = counts.get(drv.vehicle_type, 0) + 1
    return availability
