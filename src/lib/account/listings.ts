import { listingImageUrl } from "@/lib/listings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { LISTING_IMAGE_BUCKET } from "@/lib/marketplace";

export type MyListing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  condition: string | null;
  city: string | null;
  contactNumber: string | null;
  status: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  image: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

type ListingRow = {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  price: number | null;
  condition: string | null;
  city: string | null;
  contact_number: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  marketplace_categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  marketplace_listing_images:
    | { storage_path: string; is_primary: boolean; display_order: number }[]
    | null;
};

function categoryOf(row: ListingRow) {
  const category = Array.isArray(row.marketplace_categories)
    ? row.marketplace_categories[0]
    : row.marketplace_categories;
  return category ?? { name: "Marketplace", slug: "all" };
}

function mapMyListing(row: ListingRow): MyListing {
  const category = categoryOf(row);
  const paths = [...(row.marketplace_listing_images ?? [])]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.display_order - b.display_order;
    })
    .map((image) => image.storage_path);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: row.price,
    condition: row.condition,
    city: row.city,
    contactNumber: row.contact_number,
    status: row.status,
    categoryId: row.category_id,
    categoryName: category.name,
    categorySlug: category.slug,
    image: listingImageUrl(paths[0]),
    images: paths.map((path) => listingImageUrl(path)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const myListingSelect = `
  id,
  user_id,
  category_id,
  title,
  slug,
  description,
  price,
  condition,
  city,
  contact_number,
  status,
  created_at,
  updated_at,
  marketplace_categories ( name, slug ),
  marketplace_listing_images ( storage_path, is_primary, display_order )
`;

export async function getMyListings(userId: string): Promise<MyListing[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("marketplace_listings")
      .select(myListingSelect)
      .eq("user_id", userId)
      .neq("status", "ARCHIVED")
      .order("created_at", { ascending: false });

    if (!error) {
      return ((data ?? []) as unknown as ListingRow[]).map(mapMyListing);
    }

    console.error("Admin load my listings failed, falling back to user client", error);
  } catch (error) {
    console.error("Admin client unavailable for my listings", error);
  }

  // Fallback: owner can read their own ads via RLS.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(myListingSelect)
    .eq("user_id", userId)
    .neq("status", "ARCHIVED")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load my listings", error);
    return [];
  }

  return ((data ?? []) as unknown as ListingRow[]).map(mapMyListing);
}

export async function getMyListingById(userId: string, listingId: string): Promise<MyListing | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketplace_listings")
    .select(myListingSelect)
    .eq("user_id", userId)
    .eq("id", listingId)
    .maybeSingle();

  if (error || !data) return null;
  return mapMyListing(data as unknown as ListingRow);
}

export async function updateMyListing(
  userId: string,
  listingId: string,
  input: {
    categoryId: string;
    city: string;
    title: string;
    price: number;
    condition: string;
    contactNumber: string;
    description: string;
    status?: string;
  },
) {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("marketplace_listings")
    .select("id")
    .eq("id", listingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) return { ok: false as const, message: "Listing not found." };

  const { error } = await admin
    .from("marketplace_listings")
    .update({
      category_id: input.categoryId,
      city: input.city,
      title: input.title,
      price: input.price,
      condition: input.condition,
      contact_number: input.contactNumber,
      description: input.description,
      status: input.status ?? "PUBLISHED",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .eq("user_id", userId);

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function deleteMyListing(userId: string, listingId: string) {
  const admin = createAdminClient();
  const supabase = await createClient();

  const { data: existing } = await admin
    .from("marketplace_listings")
    .select("id")
    .eq("id", listingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) return { ok: false as const, message: "Listing not found." };

  const { data: images } = await admin
    .from("marketplace_listing_images")
    .select("storage_path")
    .eq("listing_id", listingId);

  const paths = (images ?? []).map((image) => image.storage_path).filter(Boolean);
  if (paths.length) {
    await supabase.storage.from(LISTING_IMAGE_BUCKET).remove(paths);
  }

  await admin.from("marketplace_listing_images").delete().eq("listing_id", listingId);

  const { error } = await admin
    .from("marketplace_listings")
    .delete()
    .eq("id", listingId)
    .eq("user_id", userId);

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}
