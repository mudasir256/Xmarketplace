"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getMarketplaceListings } from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/env-public";
import type { MarketplaceListingCard } from "@/lib/listing-types";

export type ToggleFavoriteResult = {
  ok: boolean;
  favorited: boolean;
  message?: string;
  requiresLogin?: boolean;
};

export async function getFavoriteListingIds(): Promise<string[]> {
  try {
    if (!isSupabaseConfigured()) return [];

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("marketplace_favorites")
      .select("listing_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load favorites", error.message);
      return [];
    }

    return (data ?? []).map((row) => row.listing_id);
  } catch (error) {
    console.error("Favorites unavailable", error);
    return [];
  }
}

export async function getFavoriteListings(): Promise<MarketplaceListingCard[]> {
  const favoriteIds = await getFavoriteListingIds();
  if (favoriteIds.length === 0) return [];

  const listings = await getMarketplaceListings();
  const favoriteSet = new Set(favoriteIds);
  return listings.filter((item) => favoriteSet.has(item.listingId));
}

export async function toggleFavorite(listingId: string): Promise<ToggleFavoriteResult> {
  if (!listingId) {
    return { ok: false, favorited: false, message: "Invalid listing." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      favorited: false,
      requiresLogin: true,
      message: "Please log in to save favorites.",
    };
  }

  try {
    const admin = createAdminClient();

    await admin.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
      },
      { onConflict: "id" },
    );

    const { data: existing } = await admin
      .from("marketplace_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from("marketplace_favorites")
        .delete()
        .eq("id", existing.id);

      if (error) {
        return { ok: false, favorited: true, message: error.message };
      }

      return { ok: true, favorited: false, message: "Removed from favorites." };
    }

    const { error } = await admin.from("marketplace_favorites").insert({
      user_id: user.id,
      listing_id: listingId,
    });

    if (error) {
      return {
        ok: false,
        favorited: false,
        message:
          error.message.includes("marketplace_favorites") || error.code === "42P01"
            ? "Favorites table is missing. Run the latest Supabase migration."
            : error.message,
      };
    }

    return { ok: true, favorited: true, message: "Saved to favorites." };
  } catch (error) {
    console.error("Toggle favorite failed", error);
    return {
      ok: false,
      favorited: false,
      message: error instanceof Error ? error.message : "Could not update favorite.",
    };
  }
}
