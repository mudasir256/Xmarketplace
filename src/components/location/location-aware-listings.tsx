import Link from "next/link";
import { CatalogCard } from "@/components/catalog-card";
import type { BrowseListing } from "@/lib/browse-listings";

export function LocationAwareListings({
  listings,
  favoriteIds = [],
  total,
  showingAll,
  area,
  radiusKm,
}: {
  listings: BrowseListing[];
  favoriteIds?: string[];
  total: number;
  showingAll: boolean;
  area: string;
  radiusKm: number;
}) {
  const favoriteSet = new Set(favoriteIds);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm text-muted">
          {showingAll
            ? `${total} listing${total === 1 ? "" : "s"} · showing all (none near ${area})`
            : `${total} listing${total === 1 ? "" : "s"} within ${radiusKm} km of ${area}`}
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <p className="m-0 text-sm text-muted">No posted ads yet.</p>
          <Link className="mt-4 inline-flex font-extrabold text-orange" href="/post-ad">
            Post an ad →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
          {listings.map((item) => (
            <div key={item.id} className="relative">
              <CatalogCard item={item} favorited={favoriteSet.has(item.listingId)} />
              {!showingAll && typeof item.distanceKm === "number" ? (
                <span className="pointer-events-none absolute top-3 left-3 z-2 rounded-full bg-[#04182fcc] px-2 py-1 text-[10px] font-extrabold text-white">
                  {item.distanceKm.toFixed(1)} km
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
