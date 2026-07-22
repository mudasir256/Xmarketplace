import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { getFavoriteListingIds, toggleFavorite } from "@/lib/favorites";
import { getFavoriteListings } from "@/lib/favorites";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const [ids, listings] = await Promise.all([getFavoriteListingIds(), getFavoriteListings()]);
  return jsonOk({ favoriteIds: ids, listings });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as { listingId?: string } | null;
  if (!body?.listingId) return jsonError("listingId is required");
  const result = await toggleFavorite(body.listingId);
  if (!result.ok) return jsonError(result.message || "Could not update favorite", 400);
  return jsonOk(result);
}
