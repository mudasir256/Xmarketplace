"use client";

import { useEffect, useMemo, useState } from "react";
import { Crosshair, LoaderCircle, MapPinned, X } from "lucide-react";
import { LocationMap } from "@/components/location/location-map";
import { useLocation } from "@/providers/location-provider";
import {
  cityCenter,
  DEFAULT_LOCATION,
  getCurrentLocation,
  LOCATION_RADIUS_OPTIONS,
  type GeocodeAddress,
  type SelectedLocation,
} from "@/lib/location";

export function LocationMapModal() {
  const { mapOpen, setMapOpen, selectedLocation, setSelectedLocation } = useLocation();
  const initial = useMemo(() => selectedLocation || DEFAULT_LOCATION, [selectedLocation]);

  const [pendingCoords, setPendingCoords] = useState({
    latitude: initial.latitude,
    longitude: initial.longitude,
  });
  const [pendingAddress, setPendingAddress] = useState<GeocodeAddress>({
    area: initial.area,
    city: initial.city,
    formattedAddress: initial.formattedAddress,
  });
  const [radiusKm, setRadiusKm] = useState(initial.radiusKm || 10);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!mapOpen) return;
    setPendingCoords({ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude });
    setPendingAddress({
      area: selectedLocation.area,
      city: selectedLocation.city,
      formattedAddress: selectedLocation.formattedAddress,
    });
    setRadiusKm(selectedLocation.radiusKm || 10);
  }, [mapOpen, selectedLocation]);

  if (!mapOpen) return null;

  function confirmCustomLocation() {
    const next: SelectedLocation = {
      latitude: pendingCoords.latitude,
      longitude: pendingCoords.longitude,
      area: pendingAddress.area || "Selected location",
      city: pendingAddress.city,
      formattedAddress: pendingAddress.formattedAddress,
      source: "custom",
      radiusKm,
    };
    setSelectedLocation(next);
    setMapOpen(false);
  }

  async function useBrowserLocationInModal() {
    setLocating(true);
    try {
      const position = await getCurrentLocation();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
      const address = (await response.json()) as GeocodeAddress;
      setPendingCoords({ latitude, longitude });
      setPendingAddress({
        area: address.area || "Selected location",
        city: address.city,
        formattedAddress: address.formattedAddress || address.area || "Selected location",
      });
    } catch {
      const fallback = cityCenter(selectedLocation.city);
      setPendingCoords({ latitude: fallback.latitude, longitude: fallback.longitude });
      setPendingAddress({
        area: fallback.area,
        city: fallback.city,
        formattedAddress: `${fallback.area}, ${fallback.city}`,
      });
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-[#04182f73] p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select your location"
        className="w-full max-w-[560px] rounded-2xl border border-line bg-white p-4 shadow-[0_24px_60px_#04182f40]"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="m-0 text-base font-extrabold text-navy">Select your location</h2>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border border-line text-muted"
            aria-label="Close"
            onClick={() => setMapOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <LocationMap
          latitude={pendingCoords.latitude}
          longitude={pendingCoords.longitude}
          onPick={(coords, address) => {
            setPendingCoords(coords);
            setPendingAddress(address);
          }}
        />

        <p className="mt-3 mb-1 text-sm font-extrabold text-navy">
          {pendingAddress.formattedAddress ||
            [pendingAddress.area, pendingAddress.city].filter(Boolean).join(", ") ||
            "Selected location"}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-extrabold text-[#526177]">
            Search within
            <select
              value={radiusKm}
              onChange={(event) => setRadiusKm(Number(event.target.value))}
              className="rounded-lg border border-line bg-white px-2.5 py-2 text-xs font-extrabold text-navy outline-none"
            >
              {LOCATION_RADIUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value} km
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => void useBrowserLocationInModal()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-[#f7f9fc] px-3 py-2 text-xs font-extrabold text-navy"
          >
            {locating ? <LoaderCircle className="animate-spin" size={14} /> : <Crosshair size={14} />}
            Current location
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setMapOpen(false)}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-xs font-extrabold text-navy"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmCustomLocation}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange px-4 py-2.5 text-xs font-extrabold text-white"
          >
            <MapPinned size={14} /> Confirm location
          </button>
        </div>
      </div>
    </div>
  );
}
