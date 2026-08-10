import { HomeLocationListings } from "@/components/location/home-location-listings";
import { getBrowseListings, parseBrowseLocationParams } from "@/lib/browse-listings";
import { getFavoriteListingIds } from "@/lib/favorites";

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
