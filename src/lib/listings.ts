import { LISTING_IMAGE_BUCKET, listingConditionLabel } from "@/lib/marketplace";
import type { MarketplaceListingCard, MarketplaceListingDetail } from "@/lib/listing-types";
import { isSupabaseConfigured } from "@/lib/env-public";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { getUserAvatarUrl, getUserDisplayName, getInitialsAvatarDataUrl, normalizeAvatarUrl } from "@/lib/user-display";
import { getDemoListingBySlug, getDemoListings } from "@/lib/demo-listings";

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
    listingId: row.id,
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
      avatarUrl:
        normalizeAvatarUrl(profile?.avatar_path) ||
        getInitialsAvatarDataUrl(profile?.full_name?.trim() || "Seller"),
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
  try {
    if (!isSupabaseConfigured()) return [] as ListingRow[];

    const supabase = createPublicClient();
    const categorySlug = options?.categorySlug;
    const specificCategory = categorySlug && categorySlug !== "all" && categorySlug !== "featured";

    // Public catalog: everyone (signed in or not) only sees published ads.
    let query = supabase
      .from("marketplace_listings")
      .select(specificCategory ? listingSelect.replace("marketplace_categories (", "marketplace_categories!inner (") : listingSelect)
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false });

    if (options?.slug) query = query.eq("slug", options.slug);
    if (options?.city) query = query.ilike("city", options.city);
    if (specificCategory) query = query.eq("marketplace_categories.slug", categorySlug);
    if (categorySlug === "featured") query = query.eq("is_featured", true);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) {
      console.error("Failed to load marketplace listings", error.message);
      return [] as ListingRow[];
    }

    return (data ?? []) as unknown as ListingRow[];
  } catch (error) {
    console.error("Failed to load marketplace listings", error);
    return [] as ListingRow[];
  }
}

export async function getMarketplaceListings(options?: {
  categorySlug?: string;
  city?: string;
  limit?: number;
}) {
  const rows = await fetchVisibleListingRows(options);
  return rows.map(mapListingCard);
}

function tokenizeSearchQuery(query: string) {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function listingSearchScore(row: ListingRow, tokens: string[]) {
  if (!tokens.length) return 0;

  const category = categoryOf(row);
  const title = row.title.toLowerCase();
  const description = (row.description || "").toLowerCase();
  const city = (row.city || "").toLowerCase();
  const categoryName = category.name.toLowerCase();
  const categorySlug = category.slug.toLowerCase();
  const condition = (row.condition || "").toLowerCase();
  const haystack = `${title} ${description} ${city} ${categoryName} ${categorySlug} ${condition}`;

  let score = 0;
  for (const token of tokens) {
    if (!haystack.includes(token)) return 0;
    if (title.includes(token)) score += 8;
    if (categoryName.includes(token) || categorySlug.includes(token)) score += 3;
    if (city.includes(token)) score += 2;
    if (condition.includes(token)) score += 1;
    if (description.includes(token)) score += 1;
    // Prefer exact whole-word-ish title hits
    if (title.split(/[^\p{L}\p{N}]+/u).includes(token)) score += 4;
  }

  // Bonus when the full phrase appears in the title
  const phrase = tokens.join(" ");
  if (phrase.length > 1 && title.includes(phrase)) score += 10;

  return score;
}

/** Rank published listings by matching search words in title, description, city, and category. */
export async function searchMarketplaceListings(query: string, options?: { limit?: number }) {
  const tokens = tokenizeSearchQuery(query);
  if (!tokens.length) return [] as MarketplaceListingCard[];

  const rows = await fetchVisibleListingRows({ limit: options?.limit ? options.limit * 4 : undefined });
  const ranked = rows
    .map((row) => ({ row, score: listingSearchScore(row, tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.row.created_at.localeCompare(a.row.created_at);
    });

  const limited = options?.limit ? ranked.slice(0, options.limit) : ranked;
  const live = limited.map((item) => mapListingCard(item.row));
  const demos = getDemoListings({
    query,
    limit: Math.max(0, (options?.limit ?? 96) - live.length),
  });
  return [...live, ...demos];
}

export async function getMarketplaceListingBySlug(slug: string) {
  const demo = getDemoListingBySlug(slug);
  if (demo) return demo;

  const rows = await fetchVisibleListingRows({ slug, limit: 1 });
  const row = rows[0];
  if (!row) return null;

  let profile: { full_name: string | null; phone: string | null; avatar_path: string | null } | null = null;

  try {
    const admin = createAdminClient();
    const [{ data: existing }, authResult] = await Promise.all([
      admin.from("profiles").select("full_name, phone, avatar_path").eq("id", row.user_id).maybeSingle(),
      admin.auth.admin.getUserById(row.user_id),
    ]);

    const authUser = authResult.data.user;
    const authName = authUser ? getUserDisplayName(authUser) : null;
    const authAvatar = authUser ? getUserAvatarUrl(authUser) : null;

    // Always prefer live auth avatar/name so Google photos show on ads.
    const fullName = authName || existing?.full_name?.trim() || "Marketplace Seller";
    const avatarPath = authAvatar || normalizeAvatarUrl(existing?.avatar_path) || null;

    profile = {
      full_name: fullName,
      phone: existing?.phone ?? null,
      avatar_path: avatarPath,
    };

    if (authUser) {
      await admin.from("profiles").upsert(
        {
          id: row.user_id,
          email: authUser.email ?? null,
          full_name: fullName,
          avatar_path: avatarPath,
          phone: existing?.phone ?? null,
        },
        { onConflict: "id" },
      );
    }
  } catch (error) {
    console.error("Failed to load seller profile", error);
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, avatar_path")
      .eq("id", row.user_id)
      .maybeSingle();
    profile = data;
  }

  return mapListingDetail(row, profile);
}
