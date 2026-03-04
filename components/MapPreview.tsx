"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export default function MapPreview({ lat, lng, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 14,
      interactive: false,
    });

    new mapboxgl.Marker({ color: "#f97316" })
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ closeButton: false }).setText(title))
      .addTo(map);

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full h-48 rounded-xl overflow-hidden border border-gray-200"
    />
  );
}
