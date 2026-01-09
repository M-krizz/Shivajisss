from __future__ import annotations

from typing import Dict, List, TypedDict

# Approximate centroids for Tamil Nadu districts (lat, lon)
# These are coarse and sufficient for simulation purposes.
District = TypedDict("District", {"code": str, "name": str, "lat": float, "lon": float})

DISTRICTS: List[District] = [
    {"code": "chennai", "name": "Chennai", "lat": 13.0827, "lon": 80.2707},
    {"code": "coimbatore", "name": "Coimbatore", "lat": 11.0168, "lon": 76.9558},
    {"code": "madurai", "name": "Madurai", "lat": 9.9252, "lon": 78.1198},
    {"code": "tiruchirappalli", "name": "Tiruchirappalli", "lat": 10.7905, "lon": 78.7047},
    {"code": "tirunelveli", "name": "Tirunelveli", "lat": 8.7139, "lon": 77.7567},
    {"code": "salem", "name": "Salem", "lat": 11.6643, "lon": 78.1460},
    {"code": "erode", "name": "Erode", "lat": 11.3410, "lon": 77.7172},
    {"code": "vellore", "name": "Vellore", "lat": 12.9165, "lon": 79.1325},
    {"code": "cuddalore", "name": "Cuddalore", "lat": 11.7480, "lon": 79.7714},
    {"code": "thanjavur", "name": "Thanjavur", "lat": 10.7870, "lon": 79.1378},
    {"code": "dindigul", "name": "Dindigul", "lat": 10.3624, "lon": 77.9695},
    {"code": "sivaganga", "name": "Sivaganga", "lat": 9.8470, "lon": 78.4800},
    {"code": "ramanathapuram", "name": "Ramanathapuram", "lat": 9.3716, "lon": 78.8308},
    {"code": "thoothukudi", "name": "Thoothukudi", "lat": 8.7642, "lon": 78.1348},
    {"code": "kanyakumari", "name": "Kanyakumari", "lat": 8.0883, "lon": 77.5385},
    {"code": "virudhunagar", "name": "Virudhunagar", "lat": 9.5680, "lon": 77.9624},
    {"code": "theni", "name": "Theni", "lat": 10.0104, "lon": 77.4768},
    {"code": "karur", "name": "Karur", "lat": 10.9601, "lon": 78.0766},
    {"code": "namakkal", "name": "Namakkal", "lat": 11.2180, "lon": 78.1674},
    {"code": "dharmapuri", "name": "Dharmapuri", "lat": 12.1274, "lon": 78.1570},
    {"code": "krishnagiri", "name": "Krishnagiri", "lat": 12.5309, "lon": 78.2137},
    {"code": "tiruppur", "name": "Tiruppur", "lat": 11.1085, "lon": 77.3411},
    {"code": "perambalur", "name": "Perambalur", "lat": 11.2360, "lon": 78.8801},
    {"code": "ariyalur", "name": "Ariyalur", "lat": 11.1385, "lon": 79.0756},
    {"code": "pudukkottai", "name": "Pudukkottai", "lat": 10.3810, "lon": 78.8210},
    {"code": "nagapattinam", "name": "Nagapattinam", "lat": 10.7650, "lon": 79.8424},
    {"code": "tiruvarur", "name": "Tiruvarur", "lat": 10.7720, "lon": 79.6368},
    {"code": "tiruvannamalai", "name": "Tiruvannamalai", "lat": 12.2253, "lon": 79.0747},
    {"code": "kancheepuram", "name": "Kancheepuram", "lat": 12.8376, "lon": 79.7016},
    {"code": "tiruvallur", "name": "Tiruvallur", "lat": 13.1437, "lon": 79.9096},
    {"code": "nilgiris", "name": "The Nilgiris", "lat": 11.4916, "lon": 76.7337},
    {"code": "villupuram", "name": "Villupuram", "lat": 11.9395, "lon": 79.4924},
    {"code": "ranipet", "name": "Ranipet", "lat": 12.9397, "lon": 79.3334},
    {"code": "chengalpattu", "name": "Chengalpattu", "lat": 12.6920, "lon": 79.9773},
    {"code": "tenkasi", "name": "Tenkasi", "lat": 8.9591, "lon": 77.3152},
    {"code": "kallakurichi", "name": "Kallakurichi", "lat": 11.7380, "lon": 78.9629},
    {"code": "mayiladuthurai", "name": "Mayiladuthurai", "lat": 11.1010, "lon": 79.6520},
]

# Vehicle capability profile.
VehicleProfile = TypedDict(
    "VehicleProfile",
    {
        "speed_kmph": float,
        "cost_per_km": float,
        "handling_time_min": float,
        "max_distance_km": float,
        "emission_factor": float,
    },
)

VEHICLE_TYPES: Dict[str, VehicleProfile] = {
    "bike": {
        "speed_kmph": 35.0,
        "cost_per_km": 4.0,
        "handling_time_min": 8.0,
        "max_distance_km": 80.0,
        "emission_factor": 0.6,
    },
    "auto": {
        "speed_kmph": 40.0,
        "cost_per_km": 6.0,
        "handling_time_min": 10.0,
        "max_distance_km": 120.0,
        "emission_factor": 0.8,
    },
    "minivan": {
        "speed_kmph": 55.0,
        "cost_per_km": 8.5,
        "handling_time_min": 12.0,
        "max_distance_km": 220.0,
        "emission_factor": 1.0,
    },
    "truck": {
        "speed_kmph": 60.0,
        "cost_per_km": 12.0,
        "handling_time_min": 15.0,
        "max_distance_km": 750.0,
        "emission_factor": 1.5,
    },
}

TAMIL_NADU_BOUNDS = {
    "min_lat": 8.0,
    "max_lat": 13.5,
    "min_lon": 76.2,
    "max_lon": 80.4,
}

OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
OSM_ATTRIBUTION = "© OpenStreetMap contributors"

DEFAULT_WAREHOUSES_PER_DISTRICT = 3
DEFAULT_DRIVERS_PER_DISTRICT = 8
DEFAULT_RANDOM_SEED = 42

