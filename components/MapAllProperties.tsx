"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Property } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  New: "#3b82f6",
  Interested: "#eab308",
  "Second viewing": "#f97316",
  Offer: "#22c55e",
  Rejected: "#ef4444",
};

interface Props {
  properties: Property[];
}

export default function MapAllProperties({ properties }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const located = properties.filter((p) => p.latitude && p.longitude);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: located.length > 0 ? [located[0].longitude!, located[0].latitude!] : [-4.5, 37.0],
      zoom: located.length > 0 ? 9 : 6,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    located.forEach((property) => {
      const color = STATUS_COLORS[property.status] ?? "#f97316";

      const el = document.createElement("div");
      el.className = "property-marker";
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="font-family: sans-serif; min-width: 160px;">
            <div style="font-weight: 600; font-size: 14px; color: #111;">${property.title}</div>
            <div style="color: #666; font-size: 12px; margin-top: 2px;">${property.area}</div>
            ${property.asking_price ? `<div style="color: #f97316; font-weight: 700; margin-top: 4px;">€${property.asking_price.toLocaleString("nl-NL")}</div>` : ""}
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.longitude!, property.latitude!])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => {
        marker.togglePopup();
      });

      el.addEventListener("dblclick", () => {
        router.push(`/properties/${property.id}`);
      });
    });

    // Fit bounds to all markers
    if (located.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      located.forEach((p) => bounds.extend([p.longitude!, p.latitude!]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 13 });
    }

    return () => map.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {located.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="bg-white/90 rounded-xl px-4 py-2 text-sm text-gray-500 shadow">
            No properties with a location yet.
          </p>
        </div>
      )}
    </div>
  );
}
