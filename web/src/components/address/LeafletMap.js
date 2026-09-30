"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

// react-leaflet's bundled marker icon URLs break under most bundlers —
// point at the CDN copies instead of relying on webpack asset resolution.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

/**
 * Interactive OpenStreetMap with a draggable pin. Tapping the map or
 * dragging the pin reports the new lat/lng via `onSelect`; the caller
 * reverse-geocodes it into address fields.
 */
export default function LeafletMap({ center, onSelect }) {
  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom
      style={{ height: "260px", width: "100%", borderRadius: "12px" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={center}
        icon={markerIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            onSelect(lat, lng);
          },
        }}
      />
      <ClickHandler onSelect={onSelect} />
      <RecenterOnChange center={center} />
    </MapContainer>
  );
}
