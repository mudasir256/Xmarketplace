import { getMarketplaceListings } from "@/lib/listings";
import type { MarketplaceListingCard } from "@/lib/listing-types";
import {
  DEFAULT_LOCATION,
  LOCATION_RADIUS_OPTIONS,
  type SelectedLocation,
} from "@/lib/location";
import { findNearbyListings } from "@/lib/nearby-listings";
import { getDemoListings } from "@/lib/demo-listings";

export type BrowseListing = MarketplaceListingCard & {
  distanceKm?: number;
};

export type BrowseListingsResult = {
  listings: BrowseListing[];
  total: number;
  showingAll: boolean;
  location: Pick<SelectedLocation, "latitude" | "longitude" | "radiusKm" | "area">;
};

export function parseBrowseLocationParams(searchParams: {
  lat?: string;
  lng?: string;
  radius?: string;
  area?: string;
}): SelectedLocation {
  const latitude = Number(searchParams.lat);
  const longitude = Number(searchParams.lng);
  const radiusRaw = Number(searchParams.radius ?? DEFAULT_LOCATION.radiusKm);
  const radiusKm = LOCATION_RADIUS_OPTIONS.includes(
    radiusRaw as (typeof LOCATION_RADIUS_OPTIONS)[number],
  )
    ? radiusRaw
    : DEFAULT_LOCATION.radiusKm;
  const area = searchParams.area?.trim();

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return {
      ...DEFAULT_LOCATION,
      latitude,
      longitude,
      radiusKm,
      area: area || DEFAULT_LOCATION.area,
      formattedAddress: area || DEFAULT_LOCATION.formattedAddress,
    };
  }

  return {
    ...DEFAULT_LOCATION,
    radiusKm,
    ...(area ? { area, formattedAddress: area } : {}),
  };
}

type BrowseListingsOptions = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  area?: string;
  categorySlug?: string;
  city?: string;
  page?: number;
  pageSize?: number;
};

async function getLiveBrowseListings(options: BrowseListingsOptions): Promise<BrowseListingsResult> {
  const location = {
    latitude: options.latitude,
    longitude: options.longitude,
    radiusKm: options.radiusKm,
    area: options.area || DEFAULT_LOCATION.area,
  };

  // City filter takes precedence for "all cities" style browsing.
  if (options.city) {
    const listings = await getMarketplaceListings({
      categorySlug: options.categorySlug,
      city: options.city,
      limit: options.pageSize ?? 48,
    });
    return {
      listings,
      total: listings.length,
      showingAll: true,
      location,
    };
  }

  const nearby = await findNearbyListings({
    latitude: options.latitude,
    longitude: options.longitude,
    radiusKm: options.radiusKm,
    categorySlug: options.categorySlug,
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 48,
  });

  if (nearby.listings.length > 0) {
    return {
      listings: nearby.listings,
      total: nearby.total,
      showingAll: false,
      location,
    };
  }

  const all = await getMarketplaceListings({
    categorySlug: options.categorySlug,
    limit: options.pageSize ?? 48,
  });

  return {
    listings: all.map((item) => ({
      ...item,
      distanceKm: undefined,
    })),
    total: all.length,
    showingAll: true,
    location,
  };
}

export async function getBrowseListings(options: BrowseListingsOptions): Promise<BrowseListingsResult> {
  const live = await getLiveBrowseListings(options);
  // Samples fill the first page only, after real ads. Live totals and nearby distances stay real.
  if ((options.page ?? 1) > 1) return live;

  const demos = getDemoListings({
    categorySlug: options.categorySlug,
    city: options.city,
    limit: Math.max(0, (options.pageSize ?? 48) - live.listings.length),
  });

  return { ...live, listings: [...live.listings, ...demos] };
}
