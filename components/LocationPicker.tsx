"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Props {
  initialLat?: number | null;
  initialLng?: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ initialLat, initialLng, onChange }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [hasLocation, setHasLocation] = useState(!!(initialLat && initialLng));

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const defaultCenter: [number, number] =
      initialLng && initialLat ? [initialLng, initialLat] : [-4.5, 37.0];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: defaultCenter,
      zoom: initialLat ? 13 : 6,
    });

    mapRef.current = map;

    if (initialLat && initialLng) {
      const marker = new mapboxgl.Marker({ color: "#f97316", draggable: true })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      marker.on("dragend", () => {
        const { lng, lat } = marker.getLngLat();
        onChange(lat, lng);
      });

      markerRef.current = marker;
    }

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        const marker = new mapboxgl.Marker({ color: "#f97316", draggable: true })
          .setLngLat([lng, lat])
          .addTo(map);

        marker.on("dragend", () => {
          const { lng: dLng, lat: dLat } = marker.getLngLat();
          onChange(dLat, dLng);
        });

        markerRef.current = marker;
      }

      setHasLocation(true);
      onChange(lat, lng);
    });

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const map = mapRef.current;
        if (!map) return;

        map.flyTo({ center: [lng, lat], zoom: 15 });

        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          const marker = new mapboxgl.Marker({ color: "#f97316", draggable: true })
            .setLngLat([lng, lat])
            .addTo(map);

          marker.on("dragend", () => {
            const { lng: dLng, lat: dLat } = marker.getLngLat();
            onChange(dLat, dLng);
          });

          markerRef.current = marker;
        }

        setHasLocation(true);
        onChange(lat, lng);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  }

  function clearLocation() {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    setHasLocation(false);
    onChange(0, 0);
  }

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-xl overflow-hidden border border-gray-200"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 active:bg-gray-50 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <circle cx="12" cy="12" r="3" />
            <path strokeLinecap="round" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          {locating ? "Locating…" : "Use my location"}
        </button>
        {hasLocation && (
          <button
            type="button"
            onClick={clearLocation}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-red-500 active:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400">Tap the map to set a pin, or drag the pin to adjust.</p>
    </div>
  );
}
