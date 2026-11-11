import { HomeLocationListings } from "@/components/location/home-location-listings";
import { getBrowseListings, parseBrowseLocationParams } from "@/lib/browse-listings";
import { getFavoriteListingIds } from "@/lib/favorites";
import { getDemoListings } from "@/lib/demo-listings";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace";

export async function HomeListingsSection({
  searchParams,
}: {
  searchParams: { city?: string; lat?: string; lng?: string; radius?: string; area?: string };
}) {
  const city = searchParams.city
    ? searchParams.city.charAt(0).toUpperCase() + searchParams.city.slice(1)
    : undefined;
  const browseLocation = parseBrowseLocationParams(searchParams);

  let listings: Awaited<ReturnType<typeof getBrowseListings>>["listings"] = [];
  let favoriteIds: string[] = [];
  let showingAll = true;
  let area = browseLocation.area;
  let radiusKm = browseLocation.radiusKm;

  try {
    const [browse, favorites] = await Promise.all([
      getBrowseListings({
        latitude: browseLocation.latitude,
        longitude: browseLocation.longitude,
        radiusKm: browseLocation.radiusKm,
        area: browseLocation.area,
        city,
        pageSize: 48,
      }),
      getFavoriteListingIds(),
    ]);
    listings = browse.listings;
    showingAll = browse.showingAll;
    area = browse.location.area;
    radiusKm = browse.location.radiusKm;
    favoriteIds = favorites;
  } catch (error) {
    console.error("Home listings section failed", error);
  }

  // The home page shows four cards per category, even if a busy category used the browse limit.
  for (const category of MARKETPLACE_CATEGORIES) {
    const count = listings.filter((item) => item.category === category.name).length;
    if (count >= 4) continue;
    const existingIds = new Set(listings.map((item) => item.listingId));
    const samples = getDemoListings({ categorySlug: category.slug, city })
      .filter((item) => !existingIds.has(item.listingId))
      .slice(0, 4 - count);
    listings = [...listings, ...samples];
  }

  return (
    <HomeLocationListings
      listings={listings}
      favoriteIds={favoriteIds}
      showingAll={showingAll}
      area={area}
      radiusKm={radiusKm}
    />
  );
}
