import { LISTING_IMAGE_BUCKET, listingConditionLabel } from "@/lib/marketplace";
import type { MarketplaceListingCard, MarketplaceListingDetail } from "@/lib/listing-types";
import { createClient } from "@/lib/supabase/server";

export type { MarketplaceListingCard, MarketplaceListingDetail } from "@/lib/listing-types";
export { relativeListingTime } from "@/lib/listing-types";

type ListingRow = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  price: number | null;
  condition: string | null;
  city: string | null;
  contact_number: string | null;
  is_featured: boolean;
  created_at: string;
  marketplace_categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  marketplace_listing_images:
    | { storage_path: string; is_primary: boolean; display_order: number }[]
    | null;
};

function formatPrice(price: number | null) {
  if (price == null) return "Price on request";
  return `PKR ${new Intl.NumberFormat("en-PK").format(price)}`;
}

function categoryOf(row: ListingRow) {
  const category = Array.isArray(row.marketplace_categories)
    ? row.marketplace_categories[0]
    : row.marketplace_categories;
  return category ?? { name: "Marketplace", slug: "all" };
}

function sortedImagePaths(row: ListingRow) {
  return [...(row.marketplace_listing_images ?? [])]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.display_order - b.display_order;
    })
    .map((image) => image.storage_path);
}

export function listingImageUrl(storagePath: string | null | undefined) {
  if (!storagePath) return "/placeholder-listing.svg";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "/placeholder-listing.svg";
  return `${base}/storage/v1/object/public/${LISTING_IMAGE_BUCKET}/${storagePath}`;
}

function mapListingCard(row: ListingRow): MarketplaceListingCard {
  const category = categoryOf(row);
  const images = sortedImagePaths(row);
  return {
    id: row.slug,
    title: row.title,
    price: formatPrice(row.price),
    image: listingImageUrl(images[0]),
    category: category.name,
    location: row.city ?? undefined,
    badge: row.is_featured ? "FEATURED" : undefined,
    description: row.description,
    contactNumber: row.contact_number,
    createdAt: row.created_at,
    condition: row.condition,
  };
}

function mapListingDetail(
  row: ListingRow,
  profile?: { full_name: string | null; phone: string | null; avatar_path: string | null } | null,
): MarketplaceListingDetail {
  const card = mapListingCard(row);
  const category = categoryOf(row);
  const images = sortedImagePaths(row).map((path) => listingImageUrl(path));
  const phone = row.contact_number || profile?.phone || null;

  return {
    ...card,
    listingId: row.id,
    images: images.length ? images : [listingImageUrl(null)],
    conditionLabel: listingConditionLabel(row.condition),
    postedDateLabel: new Date(row.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    seller: {
      name: profile?.full_name?.trim() || "Marketplace Seller",
      phone,
      avatarUrl: profile?.avatar_path || null,
    },
    details: [
      { label: "Category", value: category.name },
      { label: "Condition", value: listingConditionLabel(row.condition) },
      { label: "Price", value: formatPrice(row.price) },
      { label: "City", value: row.city || "—" },
      { label: "Posted", value: new Date(row.created_at).toLocaleDateString("en-PK") },
    ],
  };
}

const listingSelect = `
  id,
  user_id,
  title,
  slug,
  description,
  price,
  condition,
  city,
  contact_number,
  is_featured,
  created_at,
  marketplace_categories ( name, slug ),
  marketplace_listing_images ( storage_path, is_primary, display_order )
`;

async function fetchVisibleListingRows(options?: {
  categorySlug?: string;
  city?: string;
  slug?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("marketplace_listings")
    .select(listingSelect)
    .order("created_at", { ascending: false });

  if (options?.slug) query = query.eq("slug", options.slug);
  if (options?.city) query = query.ilike("city", options.city);
  if (options?.limit) query = query.limit(options.limit);

  if (user) {
    query = query.or(`status.eq.PUBLISHED,user_id.eq.${user.id}`);
  } else {
    query = query.eq("status", "PUBLISHED");
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load marketplace listings", error);
    return [] as ListingRow[];
  }

  let rows = (data ?? []) as unknown as ListingRow[];

  if (options?.categorySlug && options.categorySlug !== "all") {
    rows = rows.filter((row) => categoryOf(row).slug === options.categorySlug);
  }
  if (options?.categorySlug === "featured") {
    rows = rows.filter((row) => row.is_featured);
  }

  return rows;
}

export async function getMarketplaceListings(options?: {
  categorySlug?: string;
  city?: string;
  limit?: number;
}) {
  const rows = await fetchVisibleListingRows(options);
  return rows.map(mapListingCard);
}

export async function getMarketplaceListingBySlug(slug: string) {
  const rows = await fetchVisibleListingRows({ slug, limit: 1 });
  const row = rows[0];
  if (!row) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_path")
    .eq("id", row.user_id)
    .maybeSingle();

  return mapListingDetail(row, profile);
}
