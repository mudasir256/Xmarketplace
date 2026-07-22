"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CatalogCard } from "@/components/catalog-card";
import { useLocation } from "@/providers/location-provider";
import type { MarketplaceListingCard } from "@/lib/listing-types";

type ApiListing = MarketplaceListingCard & {
  distanceKm?: number;
  slug?: string;
};

type LocationAwareListingsProps = {
  initialListings: MarketplaceListingCard[];
  favoriteIds?: string[];
  categorySlug?: string;
  mode?: "home" | "category";
  sectionTitle?: string;
};

export function LocationAwareListings({
  initialListings,
  favoriteIds = [],
  categorySlug,
  mode = "home",
  sectionTitle,
}: LocationAwareListingsProps) {
  const { selectedLocation } = useLocation();
  const [listings, setListings] = useState<ApiListing[]>(initialListings);
  const [total, setTotal] = useState(initialListings.length);
  const [showingAll, setShowingAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          lat: String(selectedLocation.latitude),
          lng: String(selectedLocation.longitude),
          radiusKm: String(selectedLocation.radiusKm),
          page: "1",
          area: selectedLocation.area,
        });
        if (categorySlug && categorySlug !== "all") {
          params.set("category", categorySlug);
        }

        const response = await fetch(`/api/listings?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          total?: number;
          listings?: Array<Record<string, unknown>>;
          fallback?: boolean;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(payload.message || "Could not load nearby listings");
        }

        if (cancelled) return;

        const mapped: ApiListing[] = (payload.listings ?? []).map((item) => ({
          id: String(item.slug || item.id),
          listingId: String(item.listingId || item.id),
          title: String(item.title || ""),
          price: String(item.price || "Price on request"),
          image: String(item.image || "/placeholder-listing.svg"),
          category: String(item.category || "Marketplace"),
          location: item.location ? String(item.location) : undefined,
          badge: item.badge ? String(item.badge) : undefined,
          condition: item.condition ? String(item.condition) : undefined,
          createdAt: item.createdAt ? String(item.createdAt) : undefined,
          distanceKm: typeof item.distanceKm === "number" ? item.distanceKm : undefined,
        }));

        const next = mapped.length ? mapped : initialListings;
        setListings(next);
        setTotal(payload.total ?? next.length);
        setShowingAll(Boolean(payload.fallback) || mapped.length === 0);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load nearby listings");
          setListings(initialListings);
          setShowingAll(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedLocation, categorySlug, initialListings]);

  if (mode === "category") {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-sm text-muted">
            {loading
              ? "Finding listings near you…"
              : showingAll
                ? `${total} listing${total === 1 ? "" : "s"} · showing all (none near ${selectedLocation.area})`
                : `${total} listing${total === 1 ? "" : "s"} within ${selectedLocation.radiusKm} km of ${selectedLocation.area}`}
          </p>
        </div>

        {error ? <p className="mb-3 text-sm font-semibold text-[#b42318]">{error}</p> : null}

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

  const sectionItems = sectionTitle
    ? listings.filter((item) => item.category === sectionTitle).slice(0, 4)
    : listings.slice(0, 4);

  if (sectionItems.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
      {sectionItems.map((item) => (
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
  );
}
