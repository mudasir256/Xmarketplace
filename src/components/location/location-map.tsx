"use client";

import { useEffect, useRef, useState } from "react";
import type { GeocodeAddress } from "@/lib/location";

type LocationMapProps = {
  latitude: number;
  longitude: number;
  onPick: (coords: { latitude: number; longitude: number }, address: GeocodeAddress) => void;
};

async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodeAddress> {
  try {
    const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
    const payload = (await response.json()) as GeocodeAddress & { message?: string };
    if (!response.ok) {
      return {
        area: "Selected location",
        formattedAddress: "Selected location",
      };
    }
    return {
      area: payload.area || "Selected location",
      city: payload.city,
      formattedAddress: payload.formattedAddress || payload.area || "Selected location",
    };
  } catch {
    return {
      area: "Selected location",
      formattedAddress: "Selected location",
    };
  }
}

export function LocationMap({ latitude, longitude, onPick }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "location-map-marker",
        html: `<div style="width:28px;height:28px;border-radius:999px;background:#ff4d12;border:3px solid #fff;box-shadow:0 6px 16px #04182f40;"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([latitude, longitude], { draggable: true, icon }).addTo(map);

      async function updateFromLatLng(lat: number, lng: number) {
        marker.setLatLng([lat, lng]);
        const address = await reverseGeocode(lat, lng);
        onPick({ latitude: lat, longitude: lng }, address);
      }

      marker.on("dragend", async () => {
        const { lat, lng } = marker.getLatLng();
        await updateFromLatLng(lat, lng);
      });

      map.on("click", async (event) => {
        await updateFromLatLng(event.latlng.lat, event.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 50);
    }

    void setup();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Intentionally mount once with initial coords.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
  }, [latitude, longitude]);

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-xl border border-line bg-[#e8eef5]">
      <div ref={containerRef} className="h-full w-full" />
      {!ready ? (
        <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-muted">
          Loading map…
        </div>
      ) : null}
    </div>
  );
}
