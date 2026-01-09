import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';

void main() {
  runApp(const LogisticsApp());
}

class LogisticsApp extends StatelessWidget {
  const LogisticsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Logistics Orchestrator',
      theme: ThemeData(primarySwatch: Colors.indigo),
      home: const WarehouseMapPage(),
    );
  }
}

class WarehouseMapPage extends StatefulWidget {
  const WarehouseMapPage({super.key});

  @override
  State<WarehouseMapPage> createState() => _WarehouseMapPageState();
}

class _WarehouseMapPageState extends State<WarehouseMapPage> {
  final String apiBase = 'http://localhost:8000';
  List<Marker> markers = [];
  Map<String, dynamic>? mapConfig;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final configResp = await http.get(Uri.parse('$apiBase/map/config'));
      final warehousesResp = await http.get(Uri.parse('$apiBase/catalog/warehouses'));
      if (configResp.statusCode == 200 && warehousesResp.statusCode == 200) {
        final cfg = jsonDecode(configResp.body) as Map<String, dynamic>;
        final List<dynamic> data = jsonDecode(warehousesResp.body);
        final mks = data.map((w) {
          final lat = (w['lat'] as num).toDouble();
          final lon = (w['lon'] as num).toDouble();
          return Marker(
            width: 36,
            height: 36,
            point: LatLng(lat, lon),
            builder: (ctx) => const Icon(Icons.location_on, color: Colors.red),
          );
        }).toList();
        setState(() {
          mapConfig = cfg;
          markers = List<Marker>.from(mks);
          loading = false;
        });
      }
    } catch (e) {
      setState(() => loading = false);
      debugPrint('Failed to load map data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (mapConfig == null) {
      return const Scaffold(body: Center(child: Text('Map config unavailable')));
    }

    final bounds = mapConfig!['bounds'] as Map<String, dynamic>;
    final center = LatLng(
      ((bounds['min_lat'] + bounds['max_lat']) / 2).toDouble(),
      ((bounds['min_lon'] + bounds['max_lon']) / 2).toDouble(),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('TN logistics network'),
      ),
      body: FlutterMap(
        options: MapOptions(
          initialCenter: center,
          initialZoom: (mapConfig!['default_zoom'] as num?)?.toDouble() ?? 7,
          maxZoom: 16,
          minZoom: 5,
        ),
        children: [
          TileLayer(
            urlTemplate: mapConfig!['tile_url'] as String,
            subdomains: const ['a', 'b', 'c'],
            userAgentPackageName: 'logistics_orchestrator_client',
            tileProvider: const NetworkTileProvider(),
          ),
          MarkerLayer(markers: markers),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _load,
        label: const Text('Refresh'),
        icon: const Icon(Icons.refresh),
      ),
    );
  }
}
