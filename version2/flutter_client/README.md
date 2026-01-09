# Flutter demo client

Simple Flutter UI that consumes the FastAPI backend, plots Tamil Nadu warehouses on OpenStreetMap (Leaflet-compatible) via `flutter_map`.

## Run
1. Ensure the FastAPI backend is running locally on port 8000.
2. From this folder:
   ```powershell
   flutter pub get
   flutter run
   ```
3. The map centers on Tamil Nadu, showing generated warehouses. Tap **Refresh** to reload.

## Notes
- The API base is `http://localhost:8000` (edit `apiBase` in `lib/main.dart` for remote deployments).
- Uses OSM tiles; requires internet for tiles. No Docker required.
