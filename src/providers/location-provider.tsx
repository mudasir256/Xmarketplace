"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCATION,
  LOCATION_STORAGE_KEY,
  parseStoredLocation,
  type SelectedLocation,
} from "@/lib/location";

type LocationStatus = "idle" | "loading";

type LocationContextValue = {
  selectedLocation: SelectedLocation;
  locationStatus: LocationStatus;
  locationError: string | null;
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;
  setSelectedLocation: (location: SelectedLocation) => void;
  setLocationStatus: (status: LocationStatus) => void;
  setLocationError: (message: string | null) => void;
  clearLocationError: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<SelectedLocation>(DEFAULT_LOCATION);
  const [hydrated, setHydrated] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    const stored = parseStoredLocation(window.localStorage.getItem(LOCATION_STORAGE_KEY));
    if (stored) {
      setSelectedLocationState(stored);
      setHydrated(true);
      return;
    }

    // Prefer server profile location for logged-in users.
    void fetch("/api/account/location", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as { ok?: boolean; location?: SelectedLocation | null };
        return payload.ok ? payload.location ?? null : null;
      })
      .then((location) => {
        if (location) {
          setSelectedLocationState(location);
          window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  const setSelectedLocation = useCallback((location: SelectedLocation) => {
    setSelectedLocationState(location);
    setLocationError(null);
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));

    // Persist for logged-in users (best effort).
    void fetch("/api/account/location", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    }).catch(() => undefined);

    // Shareable URL params on marketplace browse pages.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const path = url.pathname;
      if (path === "/" || path.startsWith("/category")) {
        url.searchParams.set("lat", String(location.latitude));
        url.searchParams.set("lng", String(location.longitude));
        url.searchParams.set("radius", String(location.radiusKm));
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({
      selectedLocation,
      locationStatus,
      locationError,
      mapOpen,
      setMapOpen,
      setSelectedLocation,
      setLocationStatus,
      setLocationError,
      clearLocationError: () => setLocationError(null),
    }),
    [selectedLocation, locationStatus, locationError, mapOpen, setSelectedLocation],
  );

  // Avoid hydration mismatch flashing default vs stored location.
  if (!hydrated) {
    return (
      <LocationContext.Provider value={value}>
        {children}
      </LocationContext.Provider>
    );
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return ctx;
}
