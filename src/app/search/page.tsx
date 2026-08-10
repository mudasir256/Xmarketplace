import Link from "next/link";
import { Suspense } from "react";
import { MarketplaceSearchForm } from "@/components/search/marketplace-search-form";
import { SearchResultsSection } from "@/components/search/search-results-section";
import { CatalogGridSkeleton, Skeleton } from "@/components/skeletons/skeleton";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function SearchResultsFallback() {
  return (
    <div>
      <Skeleton className="mb-4 h-6 w-56" />
      <CatalogGridSkeleton count={8} />
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQuery } = await searchParams;
  const query = (rawQuery || "").trim();

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px] max-[760px]:pb-[120px] max-[760px]:pt-6">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-orange">
              Marketplace
            </Link>
            <span>/</span>
            <span>Search</span>
          </div>

          <div className="mb-6">
            <h1 className="m-0 text-[clamp(22px,3vw,30px)] font-extrabold tracking-[-0.7px] text-navy">
              Search products
            </h1>
            <p className="mt-1.5 mb-4 text-sm text-muted">
              Find ads by matching words in titles, descriptions, categories, and cities.
            </p>
            <MarketplaceSearchForm initialQuery={query} autoFocus={!query} />
          </div>

          <Suspense fallback={<SearchResultsFallback />}>
            <SearchResultsSection query={query} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
