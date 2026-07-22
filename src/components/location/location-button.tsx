"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, LoaderCircle, MapPin, MapPinned } from "lucide-react";
import { LocationMapModal } from "@/components/location/location-map-modal";
import { useLocation } from "@/providers/location-provider";
import {
  geolocationErrorMessage,
  getCurrentLocation,
  type GeocodeAddress,
  type SelectedLocation,
} from "@/lib/location";

export function LocationButton() {
  const {
    selectedLocation,
    setSelectedLocation,
    locationStatus,
    setLocationStatus,
    locationError,
    setLocationError,
    clearLocationError,
    setMapOpen,
  } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function selectCurrentLocation() {
    clearLocationError();
    setLocationStatus("loading");
    try {
      const position = await getCurrentLocation();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
      const address = (await response.json()) as GeocodeAddress;

      const next: SelectedLocation = {
        latitude,
        longitude,
        area: address.area || "Selected location",
        city: address.city,
        formattedAddress: address.formattedAddress || address.area || "Selected location",
        source: "current",
        radiusKm: selectedLocation.radiusKm || 10,
      };

      setSelectedLocation(next);
      setOpen(false);
    } catch (error) {
      setLocationError(geolocationErrorMessage(error));
    } finally {
      setLocationStatus("idle");
    }
  }

  return (
    <>
      <div className="relative shrink-0 max-[760px]:hidden" ref={rootRef}>
        <button
          type="button"
          onClick={() => {
            clearLocationError();
            setOpen((value) => !value);
          }}
          className="flex h-[43px] max-w-[220px] items-center justify-center gap-2 whitespace-nowrap rounded-[9px] border border-[#d5dde7] bg-white px-[13px] text-xs font-extrabold text-[#24344a] hover:border-[#8a9aa8] hover:shadow-[0_0_0_2px_#71869635]"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <MapPin size={15} className="shrink-0 text-orange" />
          <span className="truncate">{selectedLocation.area || "Location"}</span>
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+10px)] z-[120] w-[280px] overflow-hidden rounded-2xl border border-[#e1e6ec] bg-white shadow-[0_20px_48px_#04182f38]"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="m-0 text-xs font-extrabold tracking-[0.4px] text-muted uppercase">Location</p>
            </div>
            <button
              type="button"
              role="menuitem"
              disabled={locationStatus === "loading"}
              onClick={() => void selectCurrentLocation()}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-bold text-[#2c394c] hover:bg-[#f4f7f9] disabled:opacity-60"
            >
              {locationStatus === "loading" ? (
                <LoaderCircle className="animate-spin text-orange" size={18} />
              ) : (
                <Crosshair className="text-orange" size={18} />
              )}
              <span>
                {locationStatus === "loading" ? "Finding your location…" : "Use current location"}
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setMapOpen(true);
              }}
              className="flex w-full items-center gap-3 border-t border-line px-4 py-3.5 text-left text-sm font-bold text-[#2c394c] hover:bg-[#f4f7f9]"
            >
              <MapPinned className="text-orange" size={18} />
              <span>Choose location on map</span>
            </button>
            {locationError ? (
              <p className="m-0 border-t border-line bg-[#fff7f5] px-4 py-3 text-xs font-semibold text-[#b42318]">
                {locationError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <LocationMapModal />
    </>
  );
}
