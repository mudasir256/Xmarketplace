export const LOCATION_STORAGE_KEY = "selectedLocation";

export const DEFAULT_LOCATION = {
  latitude: 24.9207,
  longitude: 67.0931,
  area: "Gulshan-e-Iqbal",
  city: "Karachi",
  formattedAddress: "Gulshan-e-Iqbal, Karachi",
  source: "custom" as const,
  radiusKm: 10,
};

export const LOCATION_RADIUS_OPTIONS = [10, 25, 50] as const;

export type SelectedLocation = {
  latitude: number;
  longitude: number;
  area: string;
  city?: string;
  formattedAddress?: string;
  source: "current" | "custom";
  radiusKm: number;
};

export type GeocodeAddress = {
  area: string;
  city?: string;
  formattedAddress?: string;
};

export function isSelectedLocation(value: unknown): value is SelectedLocation {
  if (!value || typeof value !== "object") return false;
  const loc = value as Record<string, unknown>;
  return (
    typeof loc.latitude === "number" &&
    Number.isFinite(loc.latitude) &&
    typeof loc.longitude === "number" &&
    Number.isFinite(loc.longitude) &&
    typeof loc.area === "string" &&
    loc.area.trim().length > 0 &&
    (loc.source === "current" || loc.source === "custom") &&
    typeof loc.radiusKm === "number" &&
    Number.isFinite(loc.radiusKm)
  );
}

export function parseStoredLocation(raw: string | null): SelectedLocation | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isSelectedLocation(parsed)) return null;
    return {
      ...parsed,
      radiusKm: LOCATION_RADIUS_OPTIONS.includes(parsed.radiusKm as (typeof LOCATION_RADIUS_OPTIONS)[number])
        ? parsed.radiusKm
        : 10,
    };
  } catch {
    return null;
  }
}

export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 60_000,
    });
  });
}

export function geolocationErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = Number((error as GeolocationPositionError).code);
    if (code === 1) {
      return "Location permission was denied. Choose your location on the map instead.";
    }
    if (code === 2) {
      return "Location unavailable. Choose your location on the map instead.";
    }
    if (code === 3) {
      return "Location request timed out. Try again or choose on the map.";
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Unable to get your location. Choose it on the map instead.";
}

export function cityCenter(city?: string | null) {
  const key = (city || "").trim().toLowerCase();
  const centers: Record<string, { latitude: number; longitude: number; area: string; city: string }> = {
    karachi: { latitude: 24.8607, longitude: 67.0011, area: "Karachi", city: "Karachi" },
    lahore: { latitude: 31.5204, longitude: 74.3587, area: "Lahore", city: "Lahore" },
    islamabad: { latitude: 33.6844, longitude: 73.0479, area: "Islamabad", city: "Islamabad" },
    rawalpindi: { latitude: 33.5651, longitude: 73.0169, area: "Rawalpindi", city: "Rawalpindi" },
    faisalabad: { latitude: 31.4504, longitude: 73.135, area: "Faisalabad", city: "Faisalabad" },
    multan: { latitude: 30.1575, longitude: 71.5249, area: "Multan", city: "Multan" },
    peshawar: { latitude: 34.0151, longitude: 71.5249, area: "Peshawar", city: "Peshawar" },
    quetta: { latitude: 30.1798, longitude: 66.975, area: "Quetta", city: "Quetta" },
    sialkot: { latitude: 32.4945, longitude: 74.5229, area: "Sialkot", city: "Sialkot" },
    gujranwala: { latitude: 32.1877, longitude: 74.1945, area: "Gujranwala", city: "Gujranwala" },
  };
  return centers[key] ?? {
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    area: DEFAULT_LOCATION.area,
    city: DEFAULT_LOCATION.city,
  };
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
