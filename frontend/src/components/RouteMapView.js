import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { decodePolyline } from "../utils/decodePolyline";

function parseLngLatPair(pairStr) {
  if (!pairStr || typeof pairStr !== "string") return null;
  const parts = pairStr.split(",").map((p) => p.trim());
  if (parts.length !== 2) return null;
  const lng = Number(parts[0]);
  const lat = Number(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lat, lng];
}

function divIcon(label, background) {
  return L.divIcon({
    className: "sr-leaflet-marker",
    html: `<span class="sr-leaflet-marker-inner" style="background:${background}">${label}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

export default function RouteMapView({ encodedPolyline, sourceLngLat, destLngLat, height = 360 }) {
  const start = useMemo(() => parseLngLatPair(sourceLngLat), [sourceLngLat]);
  const end = useMemo(() => parseLngLatPair(destLngLat), [destLngLat]);
  const latlngs = useMemo(() => {
    const decoded = encodedPolyline ? decodePolyline(encodedPolyline, 5) : [];
    if (decoded.length >= 2) return decoded;
    if (start && end) return [start, end];
    return [];
  }, [encodedPolyline, start, end]);

  if (!start || !end || latlngs.length < 2) {
    return (
      <p className="error" role="alert">
        Route map data is incomplete.
      </p>
    );
  }

  return (
    <div
      className="route-map-wrap"
      style={{ height }}
      role="application"
      aria-label="Route map"
    >
      <MapContainer
        center={start}
        zoom={13}
        className="route-leaflet-map"
        scrollWheelZoom
      >
        <MapViewport positions={latlngs} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Polyline positions={latlngs} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.85 }} />
        <Marker position={start} icon={divIcon("A", "#22c55e")} />
        <Marker position={end} icon={divIcon("B", "#ef4444")} />
      </MapContainer>
    </div>
  );
}

function MapViewport({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions?.length) return;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds.pad(0.12));
  }, [map, positions]);

  return null;
}
