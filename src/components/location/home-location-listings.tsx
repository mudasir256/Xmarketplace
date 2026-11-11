import Link from "next/link";
import { CatalogCard } from "@/components/catalog-card";
import type { BrowseListing } from "@/lib/browse-listings";

const listingSections = [
  { title: "Vehicles", slug: "vehicles" },
  { title: "Bikes", slug: "bikes" },
  { title: "Property Sale", slug: "property-sale" },
  { title: "Property Rent", slug: "property-rent" },
  { title: "Mobiles", slug: "mobiles" },
  { title: "Electronics", slug: "electronics" },
  { title: "Furniture", slug: "furniture" },
  { title: "Animals", slug: "animals" },
  { title: "Fashion", slug: "fashion" },
  { title: "Services", slug: "services" },
];

export function HomeLocationListings({
  listings,
  favoriteIds,
  showingAll,
  area,
  radiusKm,
}: {
  listings: BrowseListing[];
  favoriteIds: string[];
  showingAll: boolean;
  area: string;
  radiusKm: number;
}) {
  const favoriteSet = new Set(favoriteIds);

  const sectionsWithAds = listingSections
    .map((section) => ({
      ...section,
      items: listings.filter((item) => item.category === section.title).slice(0, 4),
    }))
    .filter((section) => section.items.length > 0);
  const visibleListings = sectionsWithAds.flatMap((section) => section.items);
  const demoCount = visibleListings.filter((item) => item.isDemo).length;
  const liveCount = visibleListings.length - demoCount;

  if (sectionsWithAds.length === 0) {
    return (
      <section className="py-[42px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center max-[760px]:w-[min(100%_-_24px,1180px)]">
          <p className="m-0 text-sm text-muted">No ads posted yet.</p>
          <Link className="mt-4 inline-flex font-extrabold text-orange" href="/post-ad">
            Post an ad →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {demoCount > 0 ? (
        <div className="mx-auto mb-2 w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <p className="m-0 rounded-xl border border-[#ffd7b8] bg-[#fff8f1] px-4 py-3 text-sm text-navy">
            <strong>{liveCount} live ad{liveCount === 1 ? "" : "s"} · {demoCount} demo example{demoCount === 1 ? "" : "s"} shown.</strong>{" "}
            Demo examples are fictional and are not for sale.
          </p>
        </div>
      ) : null}
      {showingAll && liveCount > 0 ? (
        <div className="mx-auto mb-2 w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <p className="m-0 rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
            No {demoCount > 0 ? "live " : ""}ads within {radiusKm} km of {area}. Showing all {demoCount > 0 ? "live " : ""}listings instead.
          </p>
        </div>
      ) : null}
      {sectionsWithAds.map((section) => (
        <section className="py-[42px]" key={section.slug}>
          <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
            <div className="mb-5 flex items-end justify-between gap-5">
              <div>
                <h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">
                  {section.title}
                </h2>
                <p className="mt-1.5 mb-0 text-sm text-muted">
                  {section.items.every((item) => item.isDemo)
                    ? "Demo examples · not for sale"
                    : section.items.some((item) => item.isDemo)
                      ? "Live ads and demo examples"
                      : showingAll
                        ? "All cities"
                        : `Near ${area} · ${radiusKm} km`}
                </p>
              </div>
              <Link
                className="text-sm font-extrabold whitespace-nowrap text-orange"
                href={`/category/${section.slug}`}
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
              {section.items.map((item) => (
                <div key={item.id} className="relative">
                  <CatalogCard item={item} favorited={favoriteSet.has(item.listingId)} />
                  {!item.isDemo && !showingAll && typeof item.distanceKm === "number" ? (
                    <span className="pointer-events-none absolute top-3 left-3 z-2 rounded-full bg-[#04182fcc] px-2 py-1 text-[10px] font-extrabold text-white">
                      {item.distanceKm.toFixed(1)} km
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
