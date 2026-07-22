import { NextResponse } from "next/server";
import type { GeocodeAddress } from "@/lib/location";

type NominatimResult = {
  display_name?: string;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city_district?: string;
    residential?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
  };
};

function pickArea(result: NominatimResult) {
  const address = result.address ?? {};
  return (
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.city_district ||
    address.residential ||
    address.village ||
    address.town ||
    address.city ||
    "Selected location"
  );
}

function pickCity(result: NominatimResult) {
  const address = result.address ?? {};
  return address.city || address.town || address.county || address.state || undefined;
}

export async function reverseGeocodeServer(latitude: number, longitude: number): Promise<GeocodeAddress> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "16");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "XMarketplace/1.0 (location search)",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("Unable to identify this location");
  }

  const result = (await response.json()) as NominatimResult;
  const area = pickArea(result);
  const city = pickCity(result);
  const formattedAddress =
    result.display_name || [area, city].filter(Boolean).join(", ") || "Selected location";

  return { area, city, formattedAddress };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ ok: false, message: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const address = await reverseGeocodeServer(lat, lng);
    return NextResponse.json(address);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to identify this location",
        area: "Selected location",
        formattedAddress: "Selected location",
      },
      { status: 502 },
    );
  }
}
