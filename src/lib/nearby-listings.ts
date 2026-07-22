import { listingImageUrl } from "@/lib/listings";
import { haversineKm } from "@/lib/location";
import type { MarketplaceListingCard } from "@/lib/listing-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type NearbyListing = MarketplaceListingCard & {
  distanceKm: number;
  area?: string | null;
};

type NearbyRpcRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number | null;
  condition: string | null;
  city: string | null;
  area: string | null;
  contact_number: string | null;
  is_featured: boolean;
  created_at: string;
  category_name: string;
  category_slug: string;
  primary_image_path: string | null;
  distance_km: number;
};

function formatPrice(price: number | null) {
  if (price == null) return "Price on request";
  return `PKR ${new Intl.NumberFormat("en-PK").format(price)}`;
}

function mapNearbyRpc(row: NearbyRpcRow): NearbyListing {
  return {
    id: row.slug,
    listingId: row.id,
    title: row.title,
    price: formatPrice(row.price),
    image: listingImageUrl(row.primary_image_path),
    category: row.category_name,
    location: row.area || row.city || undefined,
    badge: row.is_featured ? "FEATURED" : undefined,
    description: row.description,
    contactNumber: row.contact_number,
    createdAt: row.created_at,
    condition: row.condition,
    distanceKm: Number(row.distance_km),
    area: row.area,
  };
}

async function findNearbyWithFallback(options: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ listings: NearbyListing[]; total: number }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 48));
  const offset = (page - 1) * pageSize;

  const supabase = await createClient();
  let query = supabase
    .from("marketplace_listings")
    .select(
      `
      id,
      title,
      slug,
      description,
      price,
      condition,
      city,
      area,
      contact_number,
      is_featured,
      created_at,
      latitude,
      longitude,
      marketplace_categories ( name, slug ),
      marketplace_listing_images ( storage_path, is_primary, display_order )
    `,
    )
    .eq("status", "PUBLISHED")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("created_at", { ascending: false })
    .limit(400);

  const { data, error } = await query;
  if (error || !data) {
    console.error("Nearby fallback failed", error);
    return { listings: [], total: 0 };
  }

  type Row = {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number | null;
    condition: string | null;
    city: string | null;
    area: string | null;
    contact_number: string | null;
    is_featured: boolean;
    created_at: string;
    latitude: number | null;
    longitude: number | null;
    marketplace_categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
    marketplace_listing_images:
      | { storage_path: string; is_primary: boolean; display_order: number }[]
      | null;
  };

  const categorySlug = options.categorySlug?.trim();
  const mapped = (data as unknown as Row[])
    .map((row) => {
      const category = Array.isArray(row.marketplace_categories)
        ? row.marketplace_categories[0]
        : row.marketplace_categories;
      if (
        categorySlug &&
        categorySlug !== "all" &&
        categorySlug !== "featured" &&
        category?.slug !== categorySlug
      ) {
        return null;
      }
      if (categorySlug === "featured" && !row.is_featured) return null;
      if (row.latitude == null || row.longitude == null) return null;

      const distanceKm = haversineKm(
        options.latitude,
        options.longitude,
        row.latitude,
        row.longitude,
      );
      if (distanceKm > options.radiusKm) return null;

      const images = [...(row.marketplace_listing_images ?? [])].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return a.display_order - b.display_order;
      });

      const listing: NearbyListing = {
        id: row.slug,
        listingId: row.id,
        title: row.title,
        price: formatPrice(row.price),
        image: listingImageUrl(images[0]?.storage_path),
        category: category?.name || "Marketplace",
        location: row.area || row.city || undefined,
        badge: row.is_featured ? "FEATURED" : undefined,
        description: row.description,
        contactNumber: row.contact_number,
        createdAt: row.created_at,
        condition: row.condition,
        distanceKm: Number(distanceKm.toFixed(1)),
        area: row.area,
      };
      return listing;
    })
    .filter((item): item is NearbyListing => Boolean(item))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    total: mapped.length,
    listings: mapped.slice(offset, offset + pageSize),
  };
}

export async function findNearbyListings(options: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 48));
  const offset = (page - 1) * pageSize;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("nearby_marketplace_listings", {
      p_lat: options.latitude,
      p_lng: options.longitude,
      p_radius_km: options.radiusKm,
      p_category_slug: options.categorySlug || null,
      p_limit: pageSize,
      p_offset: offset,
    });

    if (!error && data) {
      const listings = (data as NearbyRpcRow[]).map((row) => ({
        ...mapNearbyRpc(row),
        distanceKm: Number(Number(row.distance_km).toFixed(1)),
      }));
      return { listings, total: listings.length, source: "rpc" as const };
    }

    console.error("nearby_marketplace_listings RPC failed", error);
  } catch (error) {
    console.error("nearby RPC unavailable", error);
  }

  const fallback = await findNearbyWithFallback(options);
  return { ...fallback, source: "fallback" as const };
}
