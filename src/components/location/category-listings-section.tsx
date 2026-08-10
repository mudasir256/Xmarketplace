import { LocationAwareListings } from "@/components/location/location-aware-listings";
import { getBrowseListings, parseBrowseLocationParams } from "@/lib/browse-listings";
import { getFavoriteListingIds } from "@/lib/favorites";

export async function CategoryListingsSection({
  categorySlug,
  searchParams,
}: {
  categorySlug: string;
  searchParams: {
    city?: string;
    lat?: string;
    lng?: string;
    radius?: string;
    area?: string;
  };
}) {
  const city = searchParams.city?.trim() || undefined;
  const browseLocation = parseBrowseLocationParams(searchParams);

  let listings: Awaited<ReturnType<typeof getBrowseListings>>["listings"] = [];
  let total = 0;
  let showingAll = true;
  let area = browseLocation.area;
  let radiusKm = browseLocation.radiusKm;
  let favoriteIds: string[] = [];

  try {
    const [browse, favorites] = await Promise.all([
      getBrowseListings({
        latitude: browseLocation.latitude,
        longitude: browseLocation.longitude,
        radiusKm: browseLocation.radiusKm,
        area: browseLocation.area,
        categorySlug,
        city,
        pageSize: 48,
      }),
      getFavoriteListingIds(),
    ]);
    listings = browse.listings;
    total = browse.total;
    showingAll = browse.showingAll;
    area = browse.location.area;
    radiusKm = browse.location.radiusKm;
    favoriteIds = favorites;
  } catch (error) {
    console.error("Category listings section failed", error);
  }

  return (
    <LocationAwareListings
      listings={listings}
      favoriteIds={favoriteIds}
      total={total}
      showingAll={showingAll}
      area={area}
      radiusKm={radiusKm}
    />
  );
}
