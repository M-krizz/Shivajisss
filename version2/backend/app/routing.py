from __future__ import annotations

import math
import random
from datetime import datetime
from typing import Dict, List, Literal, Optional, Tuple

import networkx as nx

from .data import DISTRICTS, VEHICLE_TYPES
from .synth import Driver, Warehouse, compute_vehicle_availability, haversine_km

Priority = Literal["cost", "time"]


class NoVehicleAvailable(Exception):
    pass


class RouteNotFound(Exception):
    pass


def fuel_price_index(now: Optional[datetime] = None, seed: Optional[int] = None) -> float:
    """Pseudo real-time multiplier that fluctuates by hour/day to mimic fuel price/demand."""
    now = now or datetime.utcnow()
    # base oscillation by hour and day of year
    hour_term = 0.05 * math.sin(2 * math.pi * (now.hour / 24))
    seasonal_term = 0.02 * math.sin(2 * math.pi * (now.timetuple().tm_yday / 365))
    # Use seed for variation if provided
    rng_seed = seed if seed else (now.hour + now.day)
    demand_noise = random.Random(rng_seed).uniform(-0.03, 0.05)
    return round(1.0 + hour_term + seasonal_term + demand_noise, 3)


def build_graph(warehouses: List[Warehouse], k_nearest: int = 6, seed: Optional[int] = None) -> nx.Graph:
    """Sparse k-nearest graph to encourage multi-hop routes. Seed affects edge selection."""
    g = nx.Graph()
    rng = random.Random(seed) if seed else random.Random()
    for wh in warehouses:
        g.add_node(wh.id, warehouse=wh)
    for a in warehouses:
        neighbors = sorted(
            ((b, haversine_km((a.lat, a.lon), (b.lat, b.lon))) for b in warehouses if b.id != a.id),
            key=lambda x: x[1],
        )
        # Add some randomness to which neighbors are selected
        k_actual = k_nearest
        if seed:
            # Vary k between k_nearest-1 and k_nearest+2 based on seed
            k_actual = k_nearest + rng.randint(-1, 2)
            k_actual = max(3, min(k_actual, len(neighbors)))
        for b, distance in neighbors[:k_actual]:
            # Add edge weight variation based on seed
            weight_factor = 1.0 + (rng.uniform(-0.1, 0.15) if seed else 0)
            if not g.has_edge(a.id, b.id):
                g.add_edge(a.id, b.id, distance_km=distance * weight_factor)
    return g


def best_vehicle_for_edge(
    origin_district: str,
    distance_km: float,
    availability: Dict[str, int],
    priority: Priority,
    fuel_index: float,
    preferred_vehicle: Optional[str] = None,
) -> Tuple[str, float, float]:
    """Return (vehicle_type, cost_inr, eta_minutes) for the cheapest/fastest choice."""
    candidates: List[Tuple[str, float, float]] = []

    if preferred_vehicle:
        vehicle = VEHICLE_TYPES.get(preferred_vehicle)
        if vehicle and availability.get(preferred_vehicle, 0) > 0 and distance_km <= vehicle["max_distance_km"]:
            travel_hours = distance_km / vehicle["speed_kmph"]
            eta_min = travel_hours * 60 + vehicle["handling_time_min"]
            cost = distance_km * vehicle["cost_per_km"] * fuel_index + 30.0
            return preferred_vehicle, cost, eta_min

    for v_type, vehicle in VEHICLE_TYPES.items():
        if availability.get(v_type, 0) <= 0:
            continue
        if distance_km > vehicle["max_distance_km"]:
            continue
        travel_hours = distance_km / vehicle["speed_kmph"]
        eta_min = travel_hours * 60 + vehicle["handling_time_min"]
        cost = distance_km * vehicle["cost_per_km"] * fuel_index + 30.0
        candidates.append((v_type, cost, eta_min))
    if not candidates:
        raise NoVehicleAvailable(f"No vehicles available in {origin_district} for {distance_km:.1f} km")
    if priority == "cost":
        return min(candidates, key=lambda x: x[1])
    return min(candidates, key=lambda x: x[2])


def select_driver(drivers: List[Driver], district_code: str, vehicle_type: str, rng: random.Random) -> Driver:
    pool = [d for d in drivers if d.district_code == district_code and d.vehicle_type == vehicle_type]
    if not pool:
        raise NoVehicleAvailable(f"No driver with {vehicle_type} in {district_code}")
    return rng.choice(pool)


def plan_route(
    graph: nx.Graph,
    warehouses: List[Warehouse],
    drivers: List[Driver],
    priority: Priority,
    origin_district: str,
    destination_district: str,
    max_hops: int = 7,
    seed: int = 2025,
    preferred_vehicle: Optional[str] = None,
) -> Dict:
    """Plan a multi-hop route between districts using available vehicles and warehouses."""
    if origin_district == destination_district:
        raise RouteNotFound("Origin and destination are the same district.")

    warehouses_by_district: Dict[str, List[Warehouse]] = {}
    for wh in warehouses:
        warehouses_by_district.setdefault(wh.district_code, []).append(wh)

    if origin_district not in warehouses_by_district or destination_district not in warehouses_by_district:
        raise RouteNotFound("Unknown origin/destination district")

    availability = compute_vehicle_availability(drivers)
    availability_counts = {k: v.counts for k, v in availability.items()}
    fuel_index = fuel_price_index(seed=seed)

    # Build a seed-specific graph for route variation
    seed_graph = build_graph(warehouses, k_nearest=6, seed=seed)

    start_nodes = [wh.id for wh in warehouses_by_district[origin_district]]
    goal_nodes = set(wh.id for wh in warehouses_by_district[destination_district])

    rng = random.Random(seed)
    
    # Shuffle start nodes based on seed to vary route selection
    shuffled_starts = start_nodes.copy()
    rng.shuffle(shuffled_starts)
    
    # Add randomness factor to weight calculation based on seed
    noise_factor = rng.uniform(0.9, 1.1)

    def weight(u: str, v: str, edge_data: Dict) -> float:
        origin_wh: Warehouse = seed_graph.nodes[u]["warehouse"]
        distance_km = edge_data["distance_km"]
        avail = availability_counts.get(origin_wh.district_code, {})
        vehicle, cost, eta = best_vehicle_for_edge(
            origin_wh.district_code, distance_km, avail, priority, fuel_index, preferred_vehicle
        )
        base_score = cost if priority == "cost" else eta
        # Add seed-based variation to weights
        return base_score * noise_factor

    best_path: Optional[List[str]] = None
    best_score: float = float("inf")
    
    # Try multiple path-finding strategies based on seed
    # Strategy 1: Use shuffled starts for variety
    for start in shuffled_starts:
        shuffled_goals = list(goal_nodes)
        rng.shuffle(shuffled_goals)
        for target in shuffled_goals:
            try:
                candidate_path = nx.shortest_path(seed_graph, source=start, target=target, weight=weight)
                score = path_cost(seed_graph, candidate_path, priority, availability_counts, fuel_index, preferred_vehicle)
                if len(candidate_path) - 1 <= max_hops and score < best_score:
                    best_path = candidate_path
                    best_score = score
                    # For different seeds, accept first valid path to get variety
                    if seed != 2025:
                        break
            except NoVehicleAvailable:
                continue
            except nx.NetworkXNoPath:
                continue
        if best_path and seed != 2025:
            break

    if not best_path:
        raise RouteNotFound("No viable path found with current vehicles/hops.")

    segments: List[Dict] = []
    total_cost = 0.0
    total_eta = 0.0
    total_distance = 0.0
    for idx in range(len(best_path) - 1):
        a, b = best_path[idx], best_path[idx + 1]
        edge = seed_graph[a][b]
        distance_km = edge["distance_km"]
        origin_wh: Warehouse = seed_graph.nodes[a]["warehouse"]
        avail = availability_counts.get(origin_wh.district_code, {})
        vehicle, cost, eta = best_vehicle_for_edge(
            origin_wh.district_code, distance_km, avail, priority, fuel_index, preferred_vehicle
        )
        driver = select_driver(drivers, origin_wh.district_code, vehicle, rng)
        total_cost += cost
        total_eta += eta
        total_distance += distance_km
        segments.append(
            {
                "from": seed_graph.nodes[a]["warehouse"].__dict__,
                "to": seed_graph.nodes[b]["warehouse"].__dict__,
                "vehicle_type": vehicle,
                "driver": driver.__dict__,
                "distance_km": round(distance_km, 2),
                "eta_minutes": round(eta, 1),
                "cost_inr": round(cost, 1),
                "handoff_checkpoint": seed_graph.nodes[b]["warehouse"].name,
            }
        )

    return {
        "segments": segments,
        "fuel_index": fuel_index,
        "priority": priority,
        "total_cost_inr": round(total_cost, 1),
        "total_eta_minutes": round(total_eta, 1),
        "total_distance_km": round(total_distance, 1),
        "checkpoints": [seed_graph.nodes[n]["warehouse"].name for n in best_path],
    }


def path_cost(
    graph: nx.Graph,
    path: List[str],
    priority: Priority,
    availability_counts: Dict[str, Dict[str, int]],
    fuel_index: float,
    preferred_vehicle: Optional[str] = None,
) -> float:
    score = 0.0
    for idx in range(len(path) - 1):
        a, b = path[idx], path[idx + 1]
        edge = graph[a][b]
        distance = edge["distance_km"]
        origin_wh: Warehouse = graph.nodes[a]["warehouse"]
        avail = availability_counts.get(origin_wh.district_code, {})
        vehicle, cost, eta = best_vehicle_for_edge(
            origin_wh.district_code, distance, avail, priority, fuel_index, preferred_vehicle
        )
        score += cost if priority == "cost" else eta
    return score
