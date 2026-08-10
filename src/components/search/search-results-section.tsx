import Link from "next/link";
import { Search } from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { getFavoriteListingIds } from "@/lib/favorites";
import { searchMarketplaceListings } from "@/lib/listings";

export async function SearchResultsSection({ query }: { query: string }) {
  if (!query) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-white px-6 py-20 text-center">
        <span className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#e8edf3] text-[#8a97a8]">
          <Search size={26} />
        </span>
        <p className="m-0 text-sm font-extrabold text-navy">Search the marketplace</p>
        <p className="mt-1 mb-0 max-w-sm text-xs text-muted">
          Try something like “iPhone”, “Honda Civic”, or “Lahore laptop”.
        </p>
      </div>
    );
  }

  const [results, favoriteIds] = await Promise.all([
    searchMarketplaceListings(query, { limit: 96 }),
    getFavoriteListingIds(),
  ]);
  const favoriteSet = new Set(favoriteIds);

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-lg font-extrabold text-navy">
            {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
          </h2>
          <p className="mt-1 mb-0 text-xs text-muted">
            Showing listings that match your search words.
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <span className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#e8edf3] text-[#8a97a8]">
            <Search size={26} />
          </span>
          <p className="m-0 text-sm font-extrabold text-navy">No matching products</p>
          <p className="mt-1 mb-0 max-w-sm text-xs text-muted">
            No published ads matched “{query}”. Try fewer words or a different spelling.
          </p>
          <Link
            href="/category/all"
            className="mt-4 rounded-full bg-navy px-4 py-2 text-xs font-extrabold text-white"
          >
            Browse all ads
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-3">
          {results.map((item) => (
            <CatalogCard
              key={item.listingId || item.id}
              item={item}
              favorited={favoriteSet.has(item.listingId)}
            />
          ))}
        </div>
      )}
    </>
  );
}
