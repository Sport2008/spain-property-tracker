"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Property } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  New:              "#0ea5e9", // sky-500
  Interested:       "#d97706", // amber-600
  "Second viewing": "#ea580c", // orange-600
  Offer:            "#059669", // emerald-600
  Rejected:         "#e11d48", // rose-600
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
      const color = STATUS_COLORS[property.status] ?? "#c2714f";

      const el = document.createElement("div");
      el.className = "property-marker";
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 3px solid white; box-shadow: 0 2px 8px rgba(101,76,55,0.25);
        cursor: pointer;
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="font-family: sans-serif; min-width: 160px;">
            <div style="font-weight: 600; font-size: 14px; color: #1c1917;">${property.title}</div>
            <div style="color: #78716c; font-size: 12px; margin-top: 2px;">${property.area}</div>
            ${property.asking_price ? `<div style="color: #c2714f; font-weight: 700; margin-top: 4px;">€${property.asking_price.toLocaleString("nl-NL")}</div>` : ""}
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
          <p className="bg-white/90 rounded-xl px-4 py-2 text-sm text-stone-500 shadow-warm">
            Nog geen huizen met een locatie.
          </p>
        </div>
      )}
    </div>
  );
}
