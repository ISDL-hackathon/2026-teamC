"use client";

import {
  useEffect,
  useRef,
} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type EventMapProps = {
  latitude: number;
  longitude: number;
};

export default function EventMap({
  latitude,
  longitude,
}: EventMapProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          openStreetMap: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "openStreetMap",
            type: "raster",
            source: "openStreetMap",
          },
        ],
      },
      center: [
        longitude,
        latitude,
      ],
      zoom: 15,
    });

    new maplibregl.Marker()
      .setLngLat([
        longitude,
        latitude,
      ])
      .addTo(map);

    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right",
    );

    return () => {
      map.remove();
    };
  }, [
    latitude,
    longitude,
  ]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "220px",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    />
  );
}